import json
import uuid
import os
from flask import Blueprint, request, jsonify
from dotenv import load_dotenv

from technical_interview.session_store import (
    create_ti_session,
    get_ti_session,
    start_ti_session,
    add_integrity_event,
    save_answer,
    ti_sessions,
    create_attempt,
    get_attempts,
    complete_attempt,
)
from technical_interview.ai_interviewer import generate_first_question, evaluate_answer
from technical_interview.report_generator import generate_final_report

load_dotenv()

ti_bp = Blueprint("technical_interview", __name__, url_prefix="/api/technical-interview")
MAX_QUESTIONS = 7


@ti_bp.route("/start", methods=["POST"])
def start_interview():
    try:
        body = request.get_json() or {}
        candidate_id = body.get("candidate_id", "anonymous")
        resume_id = body.get("resume_id")
        target_role = body.get("target_role", "Software Engineer")
        resume_text = body.get("resume_text", "")
        candidate_profile = body.get("candidate_profile", {})

        candidate_profile["targetRole"] = target_role
        if not resume_text:
            resume_text = "Software engineer candidate with general programming experience."

        existing_attempts = get_attempts(candidate_id)
        attempt_number = len(existing_attempts) + 1

        session_id = str(uuid.uuid4())
        session = create_ti_session(session_id, candidate_profile, resume_text, attempt_number)

        first_q = generate_first_question(candidate_profile, resume_text)
        session["questions"].append(first_q)
        session["currentQuestionId"] = first_q.get("id", "q1")

        create_attempt(candidate_id, session_id)

        return jsonify({
            "status": "success",
            "sessionId": session_id,
            "session": session,
            "firstQuestion": first_q,
            "attemptNumber": attempt_number,
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@ti_bp.route("/<session_id>/next-question", methods=["POST"])
def next_question(session_id):
    try:
        session = get_ti_session(session_id)
        if not session:
            return jsonify({"status": "error", "message": "Session not found"}), 404

        body = request.get_json() or {}
        previous_answer = body.get("previous_answer", "")
        previous_question_id = body.get("previous_question_id")

        candidate_profile = session["candidateProfile"]
        resume_text = session.get("resumeText", "")

        if previous_answer and previous_question_id:
            prev_q = next((q for q in session["questions"] if q.get("id") == previous_question_id), {})
            evaluation = evaluate_answer(
                prev_q.get("question", ""),
                previous_answer,
                candidate_profile,
                resume_text,
            )
            # Update the existing saved answer's evaluation in place so the
            # report still has per-question feedback, without creating a
            # duplicate row (the /answer endpoint already saved it).
            for ans in session.get("answers", []):
                if ans.get("questionId") == previous_question_id:
                    ans["evaluation"] = evaluation
                    break
        else:
            evaluation = None

        answers = session.get("answers", [])
        if len(answers) >= MAX_QUESTIONS:
            return jsonify({
                "status": "success",
                "nextQuestion": None,
                "evaluation": evaluation,
                "questionCount": len(answers),
                "completed": True,
            })

        q = generate_first_question(candidate_profile, resume_text, answers, session.get("questions", []))

        session["questions"].append(q)
        session["currentQuestionId"] = q.get("id", f"q{len(session['questions'])+1}")

        return jsonify({
            "status": "success",
            "nextQuestion": q,
            "evaluation": evaluation,
            "questionCount": len(session["answers"]),
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@ti_bp.route("/<session_id>/answer", methods=["POST"])
def submit_answer(session_id):
    try:
        session = get_ti_session(session_id)
        if not session:
            return jsonify({"status": "error", "message": "Session not found"}), 404

        body = request.get_json() or {}
        question_id = body.get("question_id")
        transcript = body.get("transcript", "")
        duration = body.get("duration", 0)

        if not question_id:
            return jsonify({"status": "error", "message": "question_id required"}), 400

        current_q = next((q for q in session["questions"] if q.get("id") == question_id), {})
        evaluation = evaluate_answer(
            current_q.get("question", ""),
            transcript,
            session["candidateProfile"],
            session.get("resumeText", ""),
        )
        save_answer(session_id, question_id, transcript, duration, evaluation)

        return jsonify({
            "status": "success",
            "evaluation": evaluation,
            "questionCount": len(session["answers"]),
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@ti_bp.route("/<session_id>/integrity", methods=["POST"])
def log_integrity(session_id):
    try:
        session = get_ti_session(session_id)
        if not session:
            return jsonify({"status": "error", "message": "Session not found"}), 404

        body = request.get_json() or {}
        event_type = body.get("type", "UNKNOWN")
        severity = body.get("severity", "MEDIUM")
        details = body.get("details", "")
        add_integrity_event(session_id, event_type, severity, details)
        return jsonify({"status": "success", "totalEvents": len(session["integrityEvents"])})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@ti_bp.route("/<session_id>/complete", methods=["POST"])
def complete_interview(session_id):
    try:
        session = get_ti_session(session_id)
        if not session:
            return jsonify({"status": "error", "message": "Session not found"}), 404

        body = request.get_json(silent=True) or {}
        end_reason = body.get("endReason") or "CANDIDATE_ENDED"

        import time as _t
        ends_at = session.get("endsAt")
        if ends_at and _t.time() >= ends_at and session.get("status") != "COMPLETED":
            end_reason = "TIME_EXPIRED"

        session["status"] = "COMPLETED"
        session["endReason"] = end_reason
        report = generate_final_report(session)
        session["finalReport"] = report
        session["overallScore"] = report.get("overall_score")

        complete_attempt(
            session.get("candidateProfile", {}).get("candidateId", "anonymous"),
            session_id,
            report,
        )

        return jsonify({"status": "success", "report": report, "endReason": end_reason})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@ti_bp.route("/<session_id>/result", methods=["GET"])
def get_result(session_id):
    try:
        session = get_ti_session(session_id)
        if not session:
            return jsonify({"status": "error", "message": "Session not found"}), 404

        if not session.get("finalReport"):
            report = generate_final_report(session)
            session["finalReport"] = report
            session["overallScore"] = report.get("overall_score")

        return jsonify({"status": "success", "report": session["finalReport"], "session": session})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@ti_bp.route("/<session_id>/status", methods=["GET"])
def get_session_status(session_id):
    try:
        session = get_ti_session(session_id)
        if not session:
            return jsonify({"status": "error", "message": "Session not found"}), 404
        return jsonify({"status": "success", "session": session})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@ti_bp.route("/<session_id>/start-timer", methods=["POST"])
def start_timer(session_id):
    try:
        session = start_ti_session(session_id)
        if not session:
            return jsonify({"status": "error", "message": "Session not found"}), 404
        return jsonify({
            "status": "success",
            "startedAt": session.get("startedAt"),
            "endsAt": session.get("endsAt"),
            "session": session,
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@ti_bp.route("/attempts/<candidate_id>", methods=["GET"])
def get_candidate_attempts(candidate_id):
    try:
        attempts = get_attempts(candidate_id)
        return jsonify({"status": "success", "attempts": attempts})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


def register_technical_interview_routes(app):
    app.register_blueprint(ti_bp)
