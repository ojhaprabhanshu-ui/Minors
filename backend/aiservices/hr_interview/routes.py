import json
import uuid
import time
import re
from flask import Blueprint, request, jsonify
from dotenv import load_dotenv

from hr_interview.session_store import (
    create_hr_session,
    get_hr_session,
    start_hr_session,
    add_integrity_event,
    save_answer,
    create_attempt,
    get_attempts,
    complete_attempt,
    get_previous_questions,
    record_question_in_history,
    HR_MIN_QUESTIONS,
    HR_MAX_QUESTIONS,
    HR_DURATION_SECONDS,
)
from hr_interview.ai_interviewer import generate_hr_question, evaluate_hr_answer
from hr_interview.report_generator import generate_hr_final_report

load_dotenv()

hr_bp = Blueprint("hr_interview", __name__, url_prefix="/api/hr-interview")


def _history_for_ai(candidate_id, current_session_id):
    """Return previous-question list for AI exclusion (across all attempts)."""
    previous = []
    for item in get_previous_questions(candidate_id):
        previous.append({"question": item.get("text", ""), "topic": item.get("topic", "")})
    return previous


@hr_bp.route("/start", methods=["POST"])
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
        session = create_hr_session(session_id, candidate_profile, resume_text, attempt_number)
        attempt = create_attempt(candidate_id, session_id)

        previous_questions = _history_for_ai(candidate_id, session_id)

        first_q = generate_hr_question(
            candidate_profile,
            resume_text,
            previous_questions=previous_questions,
            current_attempt_questions=[],
            previous_answer=None,
            previous_question_text=None,
        )
        session["questions"].append(first_q)
        session["currentQuestionId"] = first_q.get("id")

        record_question_in_history(
            candidate_id,
            first_q.get("question", ""),
            first_q.get("topic", ""),
            attempt.get("id"),
        )

        return jsonify({
            "status": "success",
            "sessionId": session_id,
            "session": session,
            "firstQuestion": first_q,
            "attemptNumber": attempt_number,
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@hr_bp.route("/<session_id>/next-question", methods=["POST"])
def next_question(session_id):
    try:
        session = get_hr_session(session_id)
        if not session:
            return jsonify({"status": "error", "message": "Session not found"}), 404

        # Enforce hard 30-minute duration on the server side
        if session.get("status") == "TIME_EXPIRED":
            return jsonify({
                "status": "success",
                "completed": True,
                "nextQuestion": None,
                "questionCount": len(session.get("answers", [])),
                "evaluation": None,
            })

        body = request.get_json() or {}
        previous_answer = body.get("previous_answer", "")
        previous_question_id = body.get("previous_question_id")

        candidate_profile = session["candidateProfile"]
        resume_text = session.get("resumeText", "")
        candidate_id = candidate_profile.get("candidateId", "anonymous")

        # Evaluate previous answer (if any). We do NOT save it here — the
        # /answer endpoint already saves it. Saving again would cause
        # double-entries in the final report.
        evaluation = None
        previous_question_text = None
        if previous_answer and previous_question_id:
            prev_q = next((q for q in session["questions"] if q.get("id") == previous_question_id), {})
            previous_question_text = prev_q.get("question", "")
            evaluation = evaluate_hr_answer(
                previous_question_text,
                previous_answer,
                candidate_profile,
                resume_text,
            )
            # Update the existing saved answer's evaluation in place so
            # the report still has the per-question feedback, without
            # creating a duplicate row.
            for ans in session.get("answers", []):
                if ans.get("questionId") == previous_question_id:
                    ans["evaluation"] = evaluation
                    break

        # If we've hit the maximum number of questions, mark as completed
        answered = len(session.get("answers", []))
        if answered >= HR_MAX_QUESTIONS:
            return jsonify({
                "status": "success",
                "completed": True,
                "nextQuestion": None,
                "questionCount": answered,
                "evaluation": evaluation,
            })

        # Build exclusion context (persistent history + current attempt questions)
        persistent_history = _history_for_ai(candidate_id, session_id)
        current_attempt_questions = session.get("questions", [])

        next_q = generate_hr_question(
            candidate_profile,
            resume_text,
            previous_questions=persistent_history,
            current_attempt_questions=current_attempt_questions,
            previous_answer=previous_answer,
            previous_question_text=previous_question_text,
        )

        session["questions"].append(next_q)
        session["currentQuestionId"] = next_q.get("id")

        # Look up attempt id for the session
        attempts = get_attempts(candidate_id)
        current_attempt = next((a for a in attempts if a.get("sessionId") == session_id), None)
        record_question_in_history(
            candidate_id,
            next_q.get("question", ""),
            next_q.get("topic", ""),
            current_attempt.get("id") if current_attempt else None,
        )

        return jsonify({
            "status": "success",
            "completed": False,
            "nextQuestion": next_q,
            "evaluation": evaluation,
            "questionCount": answered,
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@hr_bp.route("/<session_id>/answer", methods=["POST"])
def submit_answer(session_id):
    try:
        session = get_hr_session(session_id)
        if not session:
            return jsonify({"status": "error", "message": "Session not found"}), 404

        body = request.get_json() or {}
        question_id = body.get("question_id")
        transcript = body.get("transcript", "")
        duration = body.get("duration", 0)

        if not question_id:
            return jsonify({"status": "error", "message": "question_id required"}), 400

        current_q = next((q for q in session["questions"] if q.get("id") == question_id), {})
        evaluation = evaluate_hr_answer(
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


@hr_bp.route("/<session_id>/integrity", methods=["POST"])
def log_integrity(session_id):
    try:
        session = get_hr_session(session_id)
        if not session:
            return jsonify({"status": "error", "message": "Session not found"}), 404

        body = request.get_json() or {}
        add_integrity_event(
            session_id,
            body.get("type", "UNKNOWN"),
            body.get("severity", "MEDIUM"),
            body.get("details", ""),
        )
        return jsonify({"status": "success", "totalEvents": len(session["integrityEvents"])})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@hr_bp.route("/<session_id>/complete", methods=["POST"])
def complete_interview(session_id):
    try:
        session = get_hr_session(session_id)
        if not session:
            return jsonify({"status": "error", "message": "Session not found"}), 404

        session["status"] = "COMPLETED"
        report = generate_hr_final_report(session)
        session["finalReport"] = report
        session["overallScore"] = report.get("overall_score")

        candidate_id = session.get("candidateProfile", {}).get("candidateId", "anonymous")
        complete_attempt(candidate_id, session_id, report)

        return jsonify({"status": "success", "report": report})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@hr_bp.route("/<session_id>/result", methods=["GET"])
def get_result(session_id):
    try:
        session = get_hr_session(session_id)
        if not session:
            return jsonify({"status": "error", "message": "Session not found"}), 404

        if not session.get("finalReport"):
            report = generate_hr_final_report(session)
            session["finalReport"] = report
            session["overallScore"] = report.get("overall_score")

        return jsonify({"status": "success", "report": session["finalReport"], "session": session})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@hr_bp.route("/<session_id>/status", methods=["GET"])
def get_session_status(session_id):
    try:
        session = get_hr_session(session_id)
        if not session:
            return jsonify({"status": "error", "message": "Session not found"}), 404
        return jsonify({"status": "success", "session": session})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@hr_bp.route("/<session_id>/start-timer", methods=["POST"])
def start_timer(session_id):
    try:
        session = start_hr_session(session_id)
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


@hr_bp.route("/attempts/<candidate_id>", methods=["GET"])
def get_candidate_attempts(candidate_id):
    try:
        return jsonify({"status": "success", "attempts": get_attempts(candidate_id)})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@hr_bp.route("/history/<candidate_id>", methods=["GET"])
def get_question_history(candidate_id):
    try:
        return jsonify({"status": "success", "history": get_previous_questions(candidate_id)})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


def register_hr_interview_routes(app):
    app.register_blueprint(hr_bp)
