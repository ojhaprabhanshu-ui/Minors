"""
Session + attempt storage for the Full Interview orchestrator.

Stores `FullInterviewSession` objects (the parent) and references to the
existing child round sessions by id. The child session records themselves
are owned by their respective modules (oa_sessions, ti_sessions, hr_sessions)
— we never duplicate their data.
"""

import time
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from full_interview.config import ENABLED_ROUNDS, ROUND_ORDER, FULL_INTERVIEW_WEIGHTS


# In-memory stores (MVP; replace with persistent DB in production)
full_sessions: Dict[str, Dict[str, Any]] = {}
full_attempts: Dict[str, List[Dict[str, Any]]] = {}

# Aggregated integrity timeline across all rounds
# Structure: { full_session_id: [ {round, type, severity, details, timestamp}, ... ] }
full_integrity_timeline: Dict[str, List[Dict[str, Any]]] = {}

# Pre-warmed next-round payloads
# Structure: { full_session_id: { round_key: {"round_session_id": ..., "snapshot": {...}, "started_at": ts} } }
# The orchestrator populates this by kicking off a background thread when the
# previous round completes, so the next call to /round/begin returns instantly.
preloaded_rounds: Dict[str, Dict[str, Any]] = {}

# Skill profile cache
# Structure: { candidate_id: skill_profile_dict }
candidate_skill_profiles: Dict[str, Dict[str, Any]] = {}


# ----------------------------------------------------------------------------
# Full Interview Session lifecycle
# ----------------------------------------------------------------------------

def _empty_round_status(round_key: str) -> Dict[str, Any]:
    """A round starts in PENDING and progresses through the lifecycle."""
    return {
        "round": round_key,
        "status": "PENDING",          # PENDING | READY | IN_PROGRESS | COMPLETED | SKIPPED | EXPIRED | FAILED
        "round_session_id": None,     # id inside the child module's store
        "started_at": None,
        "completed_at": None,
        "score": None,                # 0-100 normalized
        "result_snapshot": None,      # raw result from the child round
    }


def create_full_session(
    candidate_id: str,
    candidate_profile: Dict[str, Any],
    resume_text: str,
    target_role: str,
    resume_id: Optional[str] = None,
) -> Dict[str, Any]:
    """Create a new Full Interview session. Locks the candidate identity."""
    session_id = str(uuid.uuid4())

    # Lock the candidate identity. These are passed verbatim to every child round.
    locked_profile = dict(candidate_profile or {})
    locked_profile.setdefault("candidateId", candidate_id)
    locked_profile.setdefault("targetRole", target_role)

    session = {
        "id": session_id,
        "candidate_id": candidate_id,
        "resume_id": resume_id,
        "target_role": target_role,
        # Locked payload — passed unchanged into every round
        "locked_resume_text": resume_text,
        "locked_candidate_profile": locked_profile,
        # Workflow
        "current_round": ENABLED_ROUNDS[0] if ENABLED_ROUNDS else "done",
        "status": "PENDING",          # PENDING → RULES_ACCEPTED → SYSTEM_CHECK_PASSED → IN_PROGRESS → COMPLETED | ABORTED
        "enabled_rounds": list(ENABLED_ROUNDS),
        "round_order": list(ROUND_ORDER),
        "weights": dict(FULL_INTERVIEW_WEIGHTS),
        # Per-round lifecycle
        "round_status": {r: _empty_round_status(r) for r in ROUND_ORDER},
        # Cross-round permissions check (verified once, reused by all rounds)
        "permissions": {
            "camera": False,
            "microphone": False,
            "screen_share": False,
            "fullscreen": False,
        },
        # Aggregated integrity timeline
        "integrity_events": [],
        # Bookkeeping
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "started_at": None,
        "ends_at": None,
        "overall_score": None,
        "final_recommendation": None,
        "final_report": None,
    }

    full_sessions[session_id] = session
    full_integrity_timeline[session_id] = []

    # Also create a parent-level attempt record
    attempt_id = str(uuid.uuid4())
    attempt = {
        "id": attempt_id,
        "candidate_id": candidate_id,
        "full_session_id": session_id,
        "status": "PENDING",
        "created_at": session["created_at"],
        "started_at": None,
        "completed_at": None,
        "overall_score": None,
        "final_report": None,
    }
    full_attempts.setdefault(candidate_id, []).append(attempt)
    session["_attempt_id"] = attempt_id

    return session


def get_full_session(session_id: str) -> Optional[Dict[str, Any]]:
    """Return the session with any lazy state updates applied."""
    session = full_sessions.get(session_id)
    if not session:
        return None
    _refresh_expiration(session)
    return session


def _refresh_expiration(session: Dict[str, Any]) -> None:
    """Mark the session EXPIRED if its ends_at has passed and it is still
    in progress. End-time is the sum of all round durations."""
    if session.get("status") != "IN_PROGRESS":
        return
    ends_at = session.get("ends_at")
    if ends_at and time.time() >= ends_at:
        session["status"] = "EXPIRED"


# ----------------------------------------------------------------------------
# Transition handlers
# ----------------------------------------------------------------------------

def set_status(session_id: str, status: str) -> Optional[Dict[str, Any]]:
    session = full_sessions.get(session_id)
    if not session:
        return None
    session["status"] = status
    if status == "IN_PROGRESS" and not session.get("started_at"):
        session["started_at"] = time.time()
        # Approximate total length = sum of all enabled round durations
        from full_interview.config import ROUND_METADATA
        total_seconds = sum(
            ROUND_METADATA[r]["duration_minutes"] * 60
            for r in session.get("enabled_rounds", [])
            if r in ROUND_METADATA
        )
        session["ends_at"] = session["started_at"] + total_seconds
    return session


def set_permissions(session_id: str, permissions: Dict[str, bool]) -> Optional[Dict[str, Any]]:
    session = full_sessions.get(session_id)
    if not session:
        return None
    session["permissions"].update({k: bool(v) for k, v in (permissions or {}).items()})
    return session


def update_round(
    session_id: str,
    round_key: str,
    *,
    status: Optional[str] = None,
    round_session_id: Optional[str] = None,
    score: Optional[float] = None,
    result_snapshot: Optional[Dict[str, Any]] = None,
) -> Optional[Dict[str, Any]]:
    """Update one round's status block. Idempotent."""
    session = full_sessions.get(session_id)
    if not session or round_key not in session["round_status"]:
        return None
    block = session["round_status"][round_key]
    if status is not None:
        block["status"] = status
        if status == "IN_PROGRESS" and not block.get("started_at"):
            block["started_at"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        if status in ("COMPLETED", "SKIPPED", "EXPIRED", "FAILED") and not block.get("completed_at"):
            block["completed_at"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    if round_session_id is not None:
        block["round_session_id"] = round_session_id
    if score is not None:
        block["score"] = float(score)
    if result_snapshot is not None:
        block["result_snapshot"] = result_snapshot
    return session


def advance_round(session_id: str) -> Optional[Dict[str, Any]]:
    """Move `current_round` to the next enabled round that is not yet COMPLETED
    or SKIPPED. Sets current_round to 'final' when all rounds are done, and
    'done' once the final report is generated."""
    session = full_sessions.get(session_id)
    if not session:
        return None
    enabled = session.get("enabled_rounds", [])
    for r in enabled:
        block = session["round_status"].get(r, {})
        if block.get("status") in (None, "PENDING", "READY", "IN_PROGRESS"):
            session["current_round"] = r
            return session
    # All enabled rounds reached a terminal state
    session["current_round"] = "final"
    return session


def append_integrity_event(
    session_id: str,
    round_key: str,
    event_type: str,
    severity: str,
    details: str,
) -> Optional[Dict[str, Any]]:
    session = full_sessions.get(session_id)
    if not session:
        return None
    evt = {
        "round": round_key,
        "type": event_type,
        "severity": severity,
        "details": details,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    }
    full_integrity_timeline.setdefault(session_id, []).append(evt)
    session["integrity_events"].append(evt)
    return session


def get_integrity_timeline(session_id: str) -> List[Dict[str, Any]]:
    return list(full_integrity_timeline.get(session_id, []))


def set_final_report(
    session_id: str,
    overall_score: float,
    recommendation: str,
    report: Dict[str, Any],
) -> Optional[Dict[str, Any]]:
    session = full_sessions.get(session_id)
    if not session:
        return None
    session["overall_score"] = float(overall_score)
    session["final_recommendation"] = recommendation
    session["final_report"] = report
    session["status"] = "COMPLETED"
    session["current_round"] = "done"

    # Update parent attempt
    attempt_id = session.get("_attempt_id")
    if attempt_id:
        for a in full_attempts.get(session["candidate_id"], []):
            if a["id"] == attempt_id:
                a["status"] = "COMPLETED"
                a["completed_at"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                a["overall_score"] = float(overall_score)
                a["final_report"] = report
                break
    return session


def abort(session_id: str, reason: str = "candidate_aborted") -> Optional[Dict[str, Any]]:
    session = full_sessions.get(session_id)
    if not session:
        return None
    session["status"] = "ABORTED"
    session["abort_reason"] = reason
    attempt_id = session.get("_attempt_id")
    if attempt_id:
        for a in full_attempts.get(session["candidate_id"], []):
            if a["id"] == attempt_id:
                a["status"] = "ABORTED"
                a["completed_at"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                break
    return session


def get_attempts(candidate_id: str) -> List[Dict[str, Any]]:
    return list(full_attempts.get(candidate_id, []))


# ----------------------------------------------------------------------------
# Pre-warm cache for the next round
# ----------------------------------------------------------------------------

def store_preloaded(full_session_id: str, round_key: str, payload: Dict[str, Any]) -> None:
    """Stash a pre-generated next-round payload so the next /round/begin call
    returns in <50ms instead of blocking on the LLM."""
    preloaded_rounds.setdefault(full_session_id, {})[round_key] = {
        **payload,
        "started_at": time.time(),
    }


def consume_preloaded(full_session_id: str, round_key: str) -> Optional[Dict[str, Any]]:
    """Atomically read + remove a preloaded payload. Returns None if not present."""
    bucket = preloaded_rounds.get(full_session_id, {})
    payload = bucket.pop(round_key, None)
    if not bucket:
        preloaded_rounds.pop(full_session_id, None)
    return payload


def get_preloaded_status(full_session_id: str) -> Dict[str, Optional[Dict[str, Any]]]:
    """Inspect (without consuming) what's preloaded for a session."""
    return dict(preloaded_rounds.get(full_session_id, {}))


# ----------------------------------------------------------------------------
# Skill profile cache
# ----------------------------------------------------------------------------

def store_skill_profile(candidate_id: str, skill_profile: Dict[str, Any]) -> None:
    candidate_skill_profiles[candidate_id] = skill_profile


def get_skill_profile(candidate_id: str) -> Optional[Dict[str, Any]]:
    return candidate_skill_profiles.get(candidate_id)
