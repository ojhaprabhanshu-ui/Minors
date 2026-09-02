"""
HTTP API for the Full Interview orchestrator.

Endpoints:
  POST   /api/full-interview/start
  GET    /api/full-interview/<session_id>
  POST   /api/full-interview/<session_id>/accept-rules
  POST   /api/full-interview/<session_id>/system-check
  POST   /api/full-interview/<session_id>/round/begin
  POST   /api/full-interview/<session_id>/round/complete
  POST   /api/full-interview/<session_id>/synthesize-report
  GET    /api/full-interview/<session_id>/report
  POST   /api/full-interview/<session_id>/abort
  GET    /api/full-interview/attempts/<candidate_id>
  GET    /api/full-interview/config           (returns the public config snapshot)
"""

from flask import Blueprint, request, jsonify

from full_interview.session_store import (
    get_full_session,
    set_final_report,
    get_attempts,
)
from full_interview.orchestrator import (
    begin_full_interview,
    accept_rules,
    record_system_check,
    start_round,
    complete_round,
    abort_full_interview,
)
from full_interview.overall_evaluator import evaluate_full_interview
from full_interview.config import (
    ENABLED_ROUNDS,
    ROUND_ORDER,
    ROUND_METADATA,
    FULL_INTERVIEW_WEIGHTS,
    RECOMMENDATION_THRESHOLDS,
)


fi_bp = Blueprint("full_interview", __name__, url_prefix="/api/full-interview")


# ----------------------------------------------------------------------------
# Public config snapshot — used by the frontend to render the rules page
# ----------------------------------------------------------------------------

@fi_bp.route("/config", methods=["GET"])
def get_config():
    return jsonify({
        "status": "success",
        "config": {
            "enabled_rounds": list(ENABLED_ROUNDS),
            "round_order": list(ROUND_ORDER),
            "weights": dict(FULL_INTERVIEW_WEIGHTS),
            "thresholds": dict(RECOMMENDATION_THRESHOLDS),
            "metadata": {k: dict(v) for k, v in ROUND_METADATA.items()},
        },
    })


# ----------------------------------------------------------------------------
# Session lifecycle
# ----------------------------------------------------------------------------

@fi_bp.route("/start", methods=["POST"])
def start_full_interview():
    try:
        body = request.get_json() or {}
        candidate_id = body.get("candidate_id") or body.get("candidateId") or "anonymous"
        candidate_profile = body.get("candidate_profile", {}) or {}
        # Always inject candidateId + targetRole into the profile for the round to read
        candidate_profile["candidateId"] = candidate_id
        candidate_profile["targetRole"] = body.get("target_role", "Software Engineer")

        resume_text = body.get("resume_text", "") or ""
        if not resume_text.strip():
            resume_text = "Software engineer candidate with general programming experience."

        target_role = body.get("target_role", "Software Engineer")
        resume_id = body.get("resume_id")

        session = begin_full_interview(
            candidate_id=candidate_id,
            candidate_profile=candidate_profile,
            resume_text=resume_text,
            target_role=target_role,
            resume_id=resume_id,
        )
        return jsonify({"status": "success", "session": session})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@fi_bp.route("/<session_id>", methods=["GET"])
def get_session(session_id):
    session = get_full_session(session_id)
    if not session:
        return jsonify({"status": "error", "message": "Session not found"}), 404
    return jsonify({"status": "success", "session": session})


@fi_bp.route("/<session_id>/accept-rules", methods=["POST"])
def accept_rules_endpoint(session_id):
    session = accept_rules(session_id)
    if not session:
        return jsonify({"status": "error", "message": "Session not found"}), 404
    return jsonify({"status": "success", "session": session})


@fi_bp.route("/<session_id>/system-check", methods=["POST"])
def system_check_endpoint(session_id):
    try:
        body = request.get_json() or {}
        permissions = body.get("permissions", {}) or {}
        session = record_system_check(session_id, permissions)
        if not session:
            return jsonify({"status": "error", "message": "Session not found"}), 404
        return jsonify({"status": "success", "session": session})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ----------------------------------------------------------------------------
# Round control
# ----------------------------------------------------------------------------

@fi_bp.route("/<session_id>/round/begin", methods=["POST"])
def begin_round_endpoint(session_id):
    try:
        body = request.get_json() or {}
        round_key = body.get("round")
        if not round_key:
            return jsonify({"status": "error", "message": "round is required"}), 400

        print(f"[FULL_INTERVIEW_API] Starting round {round_key} for session {session_id}")
        result = start_round(session_id, round_key)
        print(f"[FULL_INTERVIEW_API] Round {round_key} started successfully: {result.get('round_session_id')}")
        return jsonify({"status": "success", **result})
    except ValueError as e:
        print(f"[FULL_INTERVIEW_API] ValueError starting round: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 400
    except Exception as e:
        print(f"[FULL_INTERVIEW_API] Exception starting round: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500


@fi_bp.route("/<session_id>/round/complete", methods=["POST"])
def complete_round_endpoint(session_id):
    try:
        body = request.get_json() or {}
        round_key = body.get("round")
        if not round_key:
            return jsonify({"status": "error", "message": "round is required"}), 400

        print(f"[FULL_INTERVIEW_API] Completing round {round_key} for session {session_id}")
        result = complete_round(session_id, round_key)
        print(f"[FULL_INTERVIEW_API] Round {round_key} completed, next round: {result.get('next_round')}")
        return jsonify({"status": "success", **result})
    except ValueError as e:
        print(f"[FULL_INTERVIEW_API] ValueError completing round: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 400
    except Exception as e:
        print(f"[FULL_INTERVIEW_API] Exception completing round: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500


# ----------------------------------------------------------------------------
# Final report
# ----------------------------------------------------------------------------

@fi_bp.route("/<session_id>/synthesize-report", methods=["POST"])
def synthesize_report_endpoint(session_id):
    """Build the final consolidated report. Marks the session COMPLETED."""
    try:
        session = get_full_session(session_id)
        if not session:
            return jsonify({"status": "error", "message": "Session not found"}), 404

        # All enabled rounds must be in a terminal state
        enabled = session.get("enabled_rounds", [])
        for rk in enabled:
            block = session["round_status"].get(rk, {})
            if block.get("status") not in ("COMPLETED", "SKIPPED"):
                return jsonify({
                    "status": "error",
                    "message": f"Round '{rk}' is not complete (status={block.get('status')})",
                }), 400

        report = evaluate_full_interview(session)
        set_final_report(
            session_id,
            overall_score=report.get("overall_score", 0),
            recommendation=report.get("recommendation", "No Hire"),
            report=report,
        )
        updated = get_full_session(session_id)
        return jsonify({"status": "success", "report": report, "session": updated})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@fi_bp.route("/<session_id>/report", methods=["GET"])
def get_report_endpoint(session_id):
    session = get_full_session(session_id)
    if not session:
        return jsonify({"status": "error", "message": "Session not found"}), 404
    report = session.get("final_report")
    if not report:
        return jsonify({
            "status": "error",
            "message": "Report not yet generated. Complete all rounds first.",
        }), 404
    return jsonify({"status": "success", "report": report, "session": session})


# ----------------------------------------------------------------------------
# Live aggregate (cumulative) — used by the Transition screen to show a
# running holistic snapshot of the session while the candidate is still in
# the middle of a round.
# ----------------------------------------------------------------------------

@fi_bp.route("/<session_id>/aggregate", methods=["GET"])
def get_aggregate_endpoint(session_id):
    """Return the running cumulative analysis (no LLM call — uses the
    deterministic longitudinal metrics). Safe to poll from the UI."""
    try:
        session = get_full_session(session_id)
        if not session:
            return jsonify({"status": "error", "message": "Session not found"}), 404

        from full_interview.cumulative_analyzer import (
            build_timeline,
            compute_longitudinal_metrics,
            longitudinal_consistency,
        )
        from full_interview.session_store import get_integrity_timeline
        from full_interview.overall_evaluator import summarize_integrity, compute_overall_score, _normalize_round_result

        # Build the running view from whatever rounds have completed so far
        timeline = build_timeline(session)
        metrics = compute_longitudinal_metrics(timeline)
        consistency = longitudinal_consistency(
            timeline, metrics.get("per_round_avg", {})
        )
        integrity = summarize_integrity(get_integrity_timeline(session_id))

        # Compute current running weighted score (only over completed rounds)
        round_results = []
        for rk in session.get("enabled_rounds", []):
            block = session.get("round_status", {}).get(rk, {})
            if block.get("status") == "COMPLETED":
                round_results.append(_normalize_round_result(rk, block.get("result_snapshot")))
        overall_score, contributions = compute_overall_score(round_results)

        return jsonify({
            "status": "success",
            "current_round": session.get("current_round"),
            "session_status": session.get("status"),
            "running_score": overall_score,
            "running_contributions": contributions,
            "longitudinal_metrics": metrics,
            "longitudinal_consistency": consistency,
            "integrity_summary": integrity,
            "skill_profile": session.get("skill_profile", {}),
            "cumulative_timeline_size": len(timeline),
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@fi_bp.route("/<session_id>/prewarm-status", methods=["GET"])
def get_prewarm_status_endpoint(session_id):
    """Tell the UI whether the next round is already pre-generated. Used
    by the TransitionScreen to show 'Ready' vs 'Preparing Round N'."""
    try:
        session = get_full_session(session_id)
        if not session:
            return jsonify({"status": "error", "message": "Session not found"}), 404

        from full_interview.session_store import get_preloaded_status
        status = get_preloaded_status(session_id)
        return jsonify({
            "status": "success",
            "next_round": session.get("current_round"),
            "preloaded": {
                rk: {
                    "ready": True,
                    "round_session_id": p.get("round_session_id"),
                    "prewarm_ms": p.get("prewarm_ms"),
                    "started_at": p.get("started_at"),
                }
                for rk, p in status.items()
            },
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ----------------------------------------------------------------------------
# Misc
# ----------------------------------------------------------------------------

@fi_bp.route("/<session_id>/abort", methods=["POST"])
def abort_endpoint(session_id):
    try:
        body = request.get_json(silent=True) or {}
        reason = body.get("reason", "candidate_aborted")
        session = abort_full_interview(session_id, reason=reason)
        if not session:
            return jsonify({"status": "error", "message": "Session not found"}), 404
        return jsonify({"status": "success", "session": session})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@fi_bp.route("/attempts/<candidate_id>", methods=["GET"])
def list_attempts(candidate_id):
    return jsonify({"status": "success", "attempts": get_attempts(candidate_id)})


def register_full_interview_routes(app):
    app.register_blueprint(fi_bp)
