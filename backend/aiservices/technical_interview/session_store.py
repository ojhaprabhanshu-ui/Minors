import time
import uuid
from datetime import datetime, timezone

TI_DURATION_MINUTES = 20
TI_DURATION_SECONDS = TI_DURATION_MINUTES * 60
TI_TOTAL_QUESTIONS = 7

ti_sessions = {}
ti_attempts = {}


def create_ti_session(session_id, candidate_profile, resume_text="", attempt_number=1):
    session = {
        "id": session_id,
        "candidateProfile": candidate_profile,
        "resumeText": resume_text,
        "targetRole": candidate_profile.get("targetRole", "Software Engineer"),
        "questions": [],
        "answers": [],
        "durationMinutes": TI_DURATION_MINUTES,
        "durationSeconds": TI_DURATION_SECONDS,
        "startedAt": None,
        "endsAt": None,
        "status": "READY",
        "currentQuestionId": None,
        "integrityEvents": [],
        "overallScore": None,
        "finalReport": None,
        "questionCount": 0,
        "attemptNumber": attempt_number,
    }
    ti_sessions[session_id] = session
    return session


def get_ti_session(session_id):
    session = ti_sessions.get(session_id)
    if not session:
        return None
    if session["status"] == "IN_PROGRESS" and session["endsAt"]:
        now_ts = time.time()
        if now_ts >= session["endsAt"]:
            session["status"] = "TIME_EXPIRED"
    return session


def start_ti_session(session_id):
    session = get_ti_session(session_id)
    if not session:
        return None
    if session["status"] == "READY":
        now_ts = time.time()
        session["startedAt"] = now_ts
        session["endsAt"] = now_ts + TI_DURATION_SECONDS
        session["status"] = "IN_PROGRESS"
    return session


def add_integrity_event(session_id, event_type, severity="MEDIUM", details=""):
    session = get_ti_session(session_id)
    if not session:
        return
    evt = {
        "type": event_type,
        "severity": severity,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "details": details,
    }
    session["integrityEvents"].append(evt)


def save_answer(session_id, question_id, transcript, duration, evaluation=None):
    session = get_ti_session(session_id)
    if not session:
        return None
    answer = {
        "questionId": question_id,
        "transcript": transcript,
        "duration": duration,
        "evaluation": evaluation or {},
        "createdAt": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    }
    session["answers"].append(answer)
    session["questionCount"] = len(session["answers"])
    return answer


def create_attempt(candidate_id, session_id):
    attempt_id = str(uuid.uuid4())
    attempt = {
        "id": attempt_id,
        "candidateId": candidate_id,
        "sessionId": session_id,
        "attemptNumber": len(ti_attempts.get(candidate_id, [])) + 1,
        "status": "IN_PROGRESS",
        "startedAt": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "completedAt": None,
        "duration": None,
        "overallScore": None,
        "finalReport": None,
    }
    ti_attempts.setdefault(candidate_id, []).append(attempt)
    return attempt


def get_attempts(candidate_id):
    return ti_attempts.get(candidate_id, [])


def complete_attempt(candidate_id, session_id, report):
    for attempt in ti_attempts.get(candidate_id, []):
        if attempt["sessionId"] == session_id:
            attempt["status"] = "COMPLETED"
            attempt["completedAt"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            attempt["finalReport"] = report
            attempt["overallScore"] = report.get("overall_score")
            return attempt
    return None
