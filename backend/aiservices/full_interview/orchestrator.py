"""
Orchestration logic for the Full Interview.

The orchestrator does NOT call round internals directly — it goes through the
*same HTTP-style entry points* that the standalone round containers use, by
hitting the corresponding Flask test client functions. This guarantees the
rounds are exercised exactly as they would be when launched in isolation.

Performance optimizations:
  * When a round completes, we spawn a background thread to pre-generate the
    NEXT round's first question and stash it in the `preloaded_rounds` cache.
    This collapses the round-transition latency from ~5-15s to <50ms.
  * Skills are extracted once from the resume + profile and injected into
    every round's question-generation prompt, so all rounds probe the same
    declared competencies.
"""

import os
import sys
import uuid
import json
import threading
import time
import traceback
from typing import Any, Dict, Optional

from full_interview.session_store import (
    create_full_session,
    get_full_session,
    set_status,
    set_permissions,
    update_round,
    advance_round,
    append_integrity_event,
    get_integrity_timeline,
    set_final_report,
    abort as abort_session,
    store_preloaded,
    consume_preloaded,
    get_preloaded_status,
    store_skill_profile,
    get_skill_profile,
)
from full_interview.skills_extractor import extract_skill_profile


# Ensure the parent backend dir (with oa/, ats/, etc.) is importable
BACKEND_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_ROOT not in sys.path:
    sys.path.insert(0, BACKEND_ROOT)


# ----------------------------------------------------------------------------
# Helpers
# ----------------------------------------------------------------------------

def _enrich_profile_with_skills(
    session: Dict[str, Any],
    profile: Dict[str, Any],
) -> Dict[str, Any]:
    """Copy the cached skill_profile onto the round-specific candidate_profile
    so the round's question generator sees it. Adds:
      - `skill_profile`: the raw dict
      - `_skill_block`: a pre-rendered prompt fragment
    """
    candidate_id = session.get("candidate_id")
    skill_profile = session.get("skill_profile") or (
        get_skill_profile(candidate_id) if candidate_id else None
    )
    if not skill_profile:
        skill_profile = extract_skill_profile(
            profile,
            session.get("locked_resume_text", ""),
        )
        if candidate_id:
            store_skill_profile(candidate_id, skill_profile)
    enriched = dict(profile)
    enriched["skill_profile"] = skill_profile
    from full_interview.skills_extractor import skill_profile_for_prompt
    enriched["_skill_block"] = skill_profile_for_prompt(skill_profile)
    return enriched


def _next_round_for_session(session: Dict[str, Any]) -> Optional[str]:
    """Return the next enabled round that has not yet reached a terminal
    state, or None if all rounds are done."""
    for rk in session.get("enabled_rounds", []):
        block = session.get("round_status", {}).get(rk, {})
        if block.get("status") in (None, "PENDING", "READY", "IN_PROGRESS"):
            return rk
    return None


# ----------------------------------------------------------------------------
# Round start — delegates to the child round's create/start functions
# ----------------------------------------------------------------------------
# We do NOT import the round's HTTP routes; we call the round's underlying
# session_store + AI entry points, which is what those routes call anyway.
# This keeps a single source of truth for the round's behavior.

def _start_oa_round(session: Dict[str, Any]) -> Dict[str, Any]:
    """Create + start an OA session for the locked candidate."""
    from oa.gemini_generator import generate_dsa_questions
    from oa.session_store import create_oa_session, start_oa_session

    profile = _enrich_profile_with_skills(session, session["locked_candidate_profile"])
    resume_text = session["locked_resume_text"] or ""

    # If the profile has no skills (rare), fall back to a small default so the
    # generator always has something to work with.
    if not profile.get("skills"):
        profile = dict(profile)
        sp = profile.get("skill_profile") or {}
        fallback = (sp.get("primary") or []) + (sp.get("supporting") or [])
        if not fallback:
            fallback = ["Python", "JavaScript", "Data Structures"]
        profile["skills"] = fallback

    questions = generate_dsa_questions(profile)

    oa_session_id = str(uuid.uuid4())
    oa_session = create_oa_session(oa_session_id, profile, questions)
    oa_session = start_oa_session(oa_session_id)
    return {
        "round_session_id": oa_session_id,
        "snapshot": {
            "id": oa_session_id,
            "questions": oa_session.get("questions", []),
            "codeByQuestion": oa_session.get("codeByQuestion", {}),
            "durationMinutes": oa_session.get("durationMinutes"),
            "endsAt": oa_session.get("endsAt"),
            "status": oa_session.get("status"),
        },
    }


def _start_technical_round(session: Dict[str, Any]) -> Dict[str, Any]:
    """Create + start a Technical interview session with enhanced dynamic question generation."""
    from technical_interview.session_store import create_ti_session, start_ti_session
    from technical_interview.ai_interviewer import generate_first_question, generate_fallback_question

    profile = _enrich_profile_with_skills(session, session["locked_candidate_profile"])
    resume_text = session["locked_resume_text"] or "Software engineer candidate with general programming experience."
    profile = dict(profile)
    profile.setdefault("targetRole", session.get("target_role", "Software Engineer"))

    print(f"[ORCHESTRATOR] Starting Technical Round with profile: {profile.keys()}")
    print(f"[ORCHESTRATOR] Resume text length: {len(resume_text)}")

    # Get previous OA questions for cross-round deduplication
    oa_session_id = None
    previous_questions = []
    oa_round_block = session.get("round_status", {}).get("oa", {})
    if oa_round_block.get("status") == "COMPLETED":
        oa_session_id = oa_round_block.get("round_session_id")
        if oa_session_id:
            from oa.session_store import oa_sessions
            oa_session = oa_sessions.get(oa_session_id)
            if oa_session:
                # Extract OA questions for deduplication
                for q in oa_session.get("questions", []):
                    previous_questions.append({
                        "question": q.get("title", ""),
                        "topic": q.get("topic", "Coding"),
                        "questionType": "dsa"
                    })
                print(f"[ORCHESTRATOR] Loaded {len(previous_questions)} OA questions for deduplication")

    ti_session_id = str(uuid.uuid4())
    ti_session = create_ti_session(ti_session_id, profile, resume_text, attempt_number=1)
    
    # Always ensure we have a question, even if AI fails
    first_q = None
    try:
        # Generate first question with deduplication context
        print(f"[ORCHESTRATOR] Attempting AI question generation...")
        first_q = generate_first_question(
            profile, 
            resume_text,
            previous_answers=None,
            questions=None,
            previous_attempt_questions=previous_questions,
            attempt_number=1
        )
        print(f"[ORCHESTRATOR] Generated first technical question: {first_q.get('topic')}")
    except Exception as e:
        print(f"[ORCHESTRATOR] Error generating technical question: {str(e)}")
        print(f"[ORCHESTRATOR] Using fallback question instead")
    
    # Fallback if AI generation returned None or failed
    if not first_q or not first_q.get("question"):
        print(f"[ORCHESTRATOR] Using fallback question due to failed AI generation")
        first_q = generate_fallback_question(1, profile, [], previous_questions)
    
    ti_session["questions"].append(first_q)
    ti_session["currentQuestionId"] = first_q.get("id", "q1")
    ti_session = start_ti_session(ti_session_id)

    return {
        "round_session_id": ti_session_id,
        "snapshot": {
            "id": ti_session_id,
            "firstQuestion": first_q,
            "questions": ti_session.get("questions", []),
            "endsAt": ti_session.get("endsAt"),
            "durationMinutes": ti_session.get("durationMinutes"),
            "status": ti_session.get("status"),
            "integrityEvents": ti_session.get("integrityEvents", []),
        },
    }


def _start_hr_round(session: Dict[str, Any]) -> Dict[str, Any]:
    """Create + start an HR interview session."""
    from hr_interview.session_store import (
        create_hr_session, start_hr_session, create_attempt,
        record_question_in_history,
    )
    from hr_interview.ai_interviewer import generate_hr_question

    profile = _enrich_profile_with_skills(session, session["locked_candidate_profile"])
    resume_text = session["locked_resume_text"] or "Software engineer candidate with general programming experience."
    candidate_id = session["candidate_id"]
    profile = dict(profile)
    profile.setdefault("candidateId", candidate_id)
    profile.setdefault("targetRole", session.get("target_role", "Software Engineer"))

    hr_session_id = str(uuid.uuid4())
    hr_session = create_hr_session(hr_session_id, profile, resume_text, attempt_number=1)
    attempt = create_attempt(candidate_id, hr_session_id)

    first_q = generate_hr_question(
        profile,
        resume_text,
        previous_questions=[],
        current_attempt_questions=[],
        previous_answer=None,
        previous_question_text=None,
    )
    hr_session["questions"].append(first_q)
    hr_session["currentQuestionId"] = first_q.get("id")
    record_question_in_history(
        candidate_id,
        first_q.get("question", ""),
        first_q.get("topic", ""),
        attempt.get("id"),
    )
    hr_session = start_hr_session(hr_session_id)

    return {
        "round_session_id": hr_session_id,
        "snapshot": {
            "id": hr_session_id,
            "firstQuestion": first_q,
            "questions": hr_session.get("questions", []),
            "endsAt": hr_session.get("endsAt"),
            "durationMinutes": hr_session.get("durationMinutes"),
            "status": hr_session.get("status"),
            "integrityEvents": hr_session.get("integrityEvents", []),
        },
    }


# ----------------------------------------------------------------------------
# Round completion — pulls the final result from the child module
# ----------------------------------------------------------------------------

def _finish_oa_round(session: Dict[str, Any], round_session_id: str) -> Dict[str, Any]:
    from oa.session_store import get_oa_session
    from oa.scoring_engine import calculate_oa_objective_score, generate_gemini_oa_feedback
    from oa.session_store import oa_sessions

    oa_session = oa_sessions.get(round_session_id)
    if not oa_session:
        raise ValueError(f"OA round session {round_session_id} not found")

    objective = calculate_oa_objective_score(oa_session)
    ai_feedback = generate_gemini_oa_feedback(objective, oa_session.get("candidateProfile", {}))

    oa_session["status"] = "COMPLETED"
    oa_session["finalResult"] = {
        "round": "OA",
        "score": objective["overallScore"],
        "qualified": objective["qualified"],
        "passingThreshold": objective["passingThreshold"],
        "performanceBreakdown": objective["performanceBreakdown"],
        "integrity": objective["integrity"],
        "aiFeedback": ai_feedback,
    }
    oa_session["score"] = objective["overallScore"]
    oa_session["qualified"] = objective["qualified"]

    return {
        "score": float(objective["overallScore"]),
        "qualified": bool(objective["qualified"]),
        "raw": oa_session["finalResult"],
    }


def _finish_technical_round(session: Dict[str, Any], round_session_id: str) -> Dict[str, Any]:
    from technical_interview.session_store import get_ti_session
    from technical_interview.report_generator import generate_final_report

    ti_session = get_ti_session(round_session_id)
    if not ti_session:
        raise ValueError(f"Technical round session {round_session_id} not found")

    report = generate_final_report(ti_session)
    ti_session["status"] = "COMPLETED"
    ti_session["finalReport"] = report
    ti_session["overallScore"] = report.get("overall_score")

    return {
        "score": float(report.get("overall_score") or 0),
        "raw": report,
    }


def _finish_hr_round(session: Dict[str, Any], round_session_id: str) -> Dict[str, Any]:
    from hr_interview.session_store import get_hr_session
    from hr_interview.report_generator import generate_hr_final_report

    hr_session = get_hr_session(round_session_id)
    if not hr_session:
        raise ValueError(f"HR round session {round_session_id} not found")

    report = generate_hr_final_report(hr_session)
    hr_session["status"] = "COMPLETED"
    hr_session["finalReport"] = report
    hr_session["overallScore"] = report.get("overall_score")

    return {
        "score": float(report.get("overall_score") or 0),
        "raw": report,
    }


# ----------------------------------------------------------------------------
# Public orchestrator API
# ----------------------------------------------------------------------------

ROUND_STARTERS = {
    "oa": _start_oa_round,
    "technical": _start_technical_round,
    "hr": _start_hr_round,
}
ROUND_FINISHERS = {
    "oa": _finish_oa_round,
    "technical": _finish_technical_round,
    "hr": _finish_hr_round,
}


def begin_full_interview(
    candidate_id: str,
    candidate_profile: Dict[str, Any],
    resume_text: str,
    target_role: str,
    resume_id: Optional[str] = None,
) -> Dict[str, Any]:
    """Create the parent session. Does NOT start any round yet.

    Also runs the skills extractor once and caches the result. Every
    subsequent round starter will use this profile."""
    session = create_full_session(
        candidate_id=candidate_id,
        candidate_profile=candidate_profile,
        resume_text=resume_text,
        target_role=target_role,
        resume_id=resume_id,
    )
    # Build the skill profile from declared skills + resume text. This is
    # fast (no LLM call) and the orchestrator will inject it into each round.
    skill_profile = extract_skill_profile(candidate_profile, resume_text)
    store_skill_profile(candidate_id, skill_profile)
    # Stash the profile on the session itself for easy access by the
    # cumulative analyzer (which doesn't know about the cache).
    from full_interview.session_store import full_sessions
    if session["id"] in full_sessions:
        full_sessions[session["id"]]["skill_profile"] = skill_profile
    return session


def accept_rules(session_id: str) -> Optional[Dict[str, Any]]:
    return set_status(session_id, "RULES_ACCEPTED")


def record_system_check(session_id: str, permissions: Dict[str, bool]) -> Optional[Dict[str, Any]]:
    set_permissions(session_id, permissions)
    return set_status(session_id, "SYSTEM_CHECK_PASSED")


def start_round(session_id: str, round_key: str) -> Dict[str, Any]:
    """Start a specific round. Marks the full session IN_PROGRESS if this is
    the first round. Records the resulting child session id.

    Latency: if the previous round's completion pre-warmed this round, the
    call returns in <50ms (no LLM call, just cache hit)."""
    session = get_full_session(session_id)
    if not session:
        raise ValueError("Session not found")

    print(f"[ORCHESTRATOR] Starting round: {round_key} for session: {session_id}")
    print(f"[ORCHESTRATOR] Current session status: {session['status']}")
    print(f"[ORCHESTRATOR] Enabled rounds: {session['enabled_rounds']}")

    if round_key not in session["enabled_rounds"]:
        print(f"[ORCHESTRATOR] Round {round_key} is disabled, skipping")
        update_round(session_id, round_key, status="SKIPPED", score=0.0)
        advance_round(session_id)
        return {"round": round_key, "round_status": "SKIPPED", "round_session_id": None}

    if session["status"] in ("SYSTEM_CHECK_PASSED", "PENDING", "RULES_ACCEPTED"):
        set_status(session_id, "IN_PROGRESS")
        print(f"[ORCHESTRATOR] Marked session as IN_PROGRESS")

    # ----- Fast path: use pre-warmed payload if available -----
    t_start = time.time()
    prewarmed = consume_preloaded(session_id, round_key)
    if prewarmed:
        update_round(
            session_id,
            round_key,
            status="IN_PROGRESS",
            round_session_id=prewarmed["round_session_id"],
        )
        elapsed_ms = int((time.time() - t_start) * 1000)
        print(f"[ORCHESTRATOR] Round {round_key} served from PREWARM cache in {elapsed_ms}ms")
        return {
            "round": round_key,
            "round_status": "IN_PROGRESS",
            "round_session_id": prewarmed["round_session_id"],
            "snapshot": prewarmed.get("snapshot", {}),
            "prewarmed": True,
            "latency_ms": elapsed_ms,
        }

    # ----- Slow path: synchronous LLM-backed generation -----
    starter = ROUND_STARTERS.get(round_key)
    if not starter:
        raise ValueError(f"Unknown round: {round_key}")

    try:
        result = starter(session)
        elapsed_ms = int((time.time() - t_start) * 1000)
        print(f"[ORCHESTRATOR] Round {round_key} started synchronously in {elapsed_ms}ms, "
              f"session ID: {result['round_session_id']}")

        update_round(
            session_id,
            round_key,
            status="IN_PROGRESS",
            round_session_id=result["round_session_id"],
        )

        return {
            "round": round_key,
            "round_status": "IN_PROGRESS",
            "round_session_id": result["round_session_id"],
            "snapshot": result["snapshot"],
            "prewarmed": False,
            "latency_ms": elapsed_ms,
        }
    except Exception as e:
        print(f"[ORCHESTRATOR] Error starting round {round_key}: {str(e)}")
        raise


def complete_round(session_id: str, round_key: str) -> Dict[str, Any]:
    """Finalize a round, pull its report, advance to the next round, and
    kick off a background pre-warm of the next round's first question."""
    session = get_full_session(session_id)
    if not session:
        raise ValueError("Session not found")
    if round_key not in ROUND_FINISHERS:
        raise ValueError(f"Unknown round: {round_key}")

    block = session["round_status"].get(round_key, {})
    round_session_id = block.get("round_session_id")
    if not round_session_id:
        raise ValueError(f"Round {round_key} was never started")

    finisher = ROUND_FINISHERS[round_key]
    result = finisher(session, round_session_id)
    update_round(
        session_id,
        round_key,
        status="COMPLETED",
        score=result["score"],
        result_snapshot=result["raw"],
    )

    _aggregate_round_integrity(session_id, round_key, round_session_id)

    # Determine the next round BEFORE advancing
    next_round = _next_round_for_session(session)
    advance_round(session_id)

    # Fire-and-forget prewarm of the next round (does not block this response)
    if next_round and next_round in session.get("enabled_rounds", []):
        try:
            _prewarm_round_in_background(session_id, next_round)
        except Exception as e:
            print(f"[ORCHESTRATOR] Prewarm kickoff failed (non-fatal): {e}")

    return {
        "round": round_key,
        "score": result["score"],
        "next_round": get_full_session(session_id).get("current_round"),
        "prewarming": next_round,
    }


# ----------------------------------------------------------------------------
# Background pre-warming
# ----------------------------------------------------------------------------

def _prewarm_round_in_background(session_id: str, round_key: str) -> None:
    """Spawn a daemon thread that calls the round starter and stashes the
    result in the preloaded cache. The next /round/begin call will hit
    this cache and return in <50ms."""
    def _worker():
        try:
            # Refresh the session inside the worker (the in-memory store is
            # process-local; no DB to re-read)
            session = get_full_session(session_id)
            if not session:
                return
            starter = ROUND_STARTERS.get(round_key)
            if not starter:
                return
            t0 = time.time()
            payload = starter(session)
            elapsed = int((time.time() - t0) * 1000)
            store_preloaded(session_id, round_key, {
                "round_session_id": payload["round_session_id"],
                "snapshot": payload.get("snapshot", {}),
                "prewarm_ms": elapsed,
            })
            print(f"[ORCHESTRATOR] Prewarm of {round_key} complete in {elapsed}ms")
        except Exception as e:
            print(f"[ORCHESTRATOR] Prewarm worker error: {e}")
            traceback.print_exc()

    t = threading.Thread(target=_worker, name=f"prewarm-{round_key}", daemon=True)
    t.start()


def _aggregate_round_integrity(full_session_id: str, round_key: str, round_session_id: str) -> None:
    """Copy the round's own integrityEvents into the parent's timeline."""
    if round_key == "oa":
        from oa.session_store import oa_sessions
        child = oa_sessions.get(round_session_id)
        events = (child or {}).get("integrityEvents", [])
    elif round_key == "technical":
        from technical_interview.session_store import ti_sessions
        child = ti_sessions.get(round_session_id)
        events = (child or {}).get("integrityEvents", [])
    elif round_key == "hr":
        from hr_interview.session_store import hr_sessions
        child = hr_sessions.get(round_session_id)
        events = (child or {}).get("integrityEvents", [])
    else:
        return

    for evt in events:
        append_integrity_event(
            full_session_id,
            round_key,
            evt.get("type", "UNKNOWN"),
            evt.get("severity", "MEDIUM"),
            evt.get("details", ""),
        )


def abort_full_interview(session_id: str, reason: str = "candidate_aborted") -> Optional[Dict[str, Any]]:
    return abort_session(session_id, reason)
