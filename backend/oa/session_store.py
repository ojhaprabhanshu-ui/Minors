import time
from datetime import datetime, timezone

# Temporary in-memory session store for hackathon MVP
oa_sessions = {}

OA_DURATION_MINUTES = 90
OA_DURATION_SECONDS = OA_DURATION_MINUTES * 60
OA_PASSING_SCORE = 70

def create_oa_session(session_id: str, candidate_profile: dict, questions: list) -> dict:
    session = {
        "id": session_id,
        "candidateProfile": candidate_profile,
        "questions": questions,
        "durationMinutes": OA_DURATION_MINUTES,
        "durationSeconds": OA_DURATION_SECONDS,
        "startedAt": None,
        "endsAt": None,
        "submissions": {},        # Official submissions per question id
        "runResults": {},         # Last run results per question id
        "codeByQuestion": {},     # Autosaved code per question id and language
        "integrityEvents": [],
        "integrityRisk": "LOW",
        "status": "READY",        # READY, IN_PROGRESS, COMPLETED, EXPIRED
        "score": 0,
        "qualified": False,
        "finalResult": None
    }

    # Initialize codeByQuestion for each question and language
    for q in questions:
        q_id = q["id"]
        session["codeByQuestion"][q_id] = {
            "python": q.get("starterCode", {}).get("python", ""),
            "java": q.get("starterCode", {}).get("java", ""),
            "cpp": q.get("starterCode", {}).get("cpp", "")
        }

    oa_sessions[session_id] = session
    return session

def get_oa_session(session_id: str) -> dict:
    session = oa_sessions.get(session_id)
    if not session:
        return None

    # Check if timer expired
    if session["status"] == "IN_PROGRESS" and session["endsAt"]:
        now_ts = time.time()
        if now_ts >= session["endsAt"]:
            session["status"] = "EXPIRED"

    return session

def start_oa_session(session_id: str) -> dict:
    session = get_oa_session(session_id)
    if not session:
        return None

    if session["status"] == "READY":
        now_ts = time.time()
        session["startedAt"] = now_ts
        session["endsAt"] = now_ts + OA_DURATION_SECONDS
        session["status"] = "IN_PROGRESS"

    return session
