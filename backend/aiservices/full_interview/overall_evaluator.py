"""
OverallInterviewEvaluator — synthesises the final report from per-round reports.

This module is the thin coordinator. The heavy lifting happens in:
  - `cumulative_analyzer.py` (longitudinal, context-aware evaluation)
  - `skills_extractor.py` (dynamic skill profiling)

This module keeps the public surface (`evaluate_full_interview`) and the
deterministic base report (weighted score, recommendation, integrity
summary) so the route layer is unaffected.
"""

import json
import os
import time
from typing import Any, Dict, List, Optional, Tuple

import requests
from dotenv import load_dotenv

from full_interview.config import (
    ENABLED_ROUNDS,
    ROUND_METADATA,
    FULL_INTERVIEW_WEIGHTS,
    RECOMMENDATION_THRESHOLDS,
    recommendation_for,
    INTEGRITY_RISK_THRESHOLDS,
)
from full_interview.session_store import get_integrity_timeline
from full_interview.cumulative_analyzer import (
    evaluate_cumulatively,
    build_timeline,
    compute_longitudinal_metrics,
    longitudinal_consistency,
)

load_dotenv()


# ----------------------------------------------------------------------------
# Normalized round result shape (kept for backwards compat with frontend)
# ----------------------------------------------------------------------------

def _normalize_round_result(round_key: str, snapshot: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    snapshot = snapshot or {}
    base = {
        "round": round_key,
        "label": ROUND_METADATA.get(round_key, {}).get("label", round_key),
        "score": float(snapshot.get("score") or 0),
        "qualified": bool(snapshot.get("qualified", False)),
        "summary": "",
        "signals": {},
        "raw": snapshot,
    }

    if round_key == "oa":
        perf = snapshot.get("performanceBreakdown", {}) or {}
        base["signals"] = {
            "coding_correctness": float(perf.get("codingCorrectness", 0) or 0),
            "test_pass_rate": float(perf.get("testPassRate", 0) or 0),
            "edge_case_handling": float(perf.get("edgeCaseHandling", 0) or 0),
            "efficiency": float(perf.get("efficiency", 0) or 0),
            "integrity_risk": perf.get("integrityRisk", "LOW"),
        }
        ai = snapshot.get("aiFeedback", {}) or {}
        base["summary"] = ai.get("summary") or snapshot.get("summary", "")
    elif round_key == "technical":
        depth = snapshot.get("depth_of_understanding", {}) or {}
        cats = snapshot.get("categories", {}) or {}
        base["signals"] = {
            "depth_level": depth.get("level", "SHALLOW"),
            "depth_score": float(depth.get("score", 0) or 0),
            "technical_knowledge": float(cats.get("technical_knowledge", 0) or 0),
            "problem_solving": float(cats.get("problem_solving", 0) or 0),
            "communication": float(cats.get("communication", 0) or 0),
        }
        base["summary"] = snapshot.get("summary", "")
    elif round_key == "hr":
        cats = snapshot.get("categories", {}) or {}
        base["signals"] = {
            "communication": float(cats.get("communication", 0) or 0),
            "clarity": float(cats.get("clarity", 0) or 0),
            "confidence": float(cats.get("confidence", 0) or 0),
            "professionalism": float(cats.get("professionalism", 0) or 0),
            "relevance": float(cats.get("relevance", 0) or 0),
        }
        base["summary"] = snapshot.get("summary", "")

    return base


# ----------------------------------------------------------------------------
# Weighted overall score (deterministic, no API call)
# ----------------------------------------------------------------------------

def compute_overall_score(round_results: List[Dict[str, Any]]) -> Tuple[float, Dict[str, float]]:
    active = [r for r in round_results if r.get("score", 0) > 0 or r.get("round") in ENABLED_ROUNDS]
    if not active:
        return 0.0, {}

    total_weight = sum(FULL_INTERVIEW_WEIGHTS.get(r["round"], 0) for r in active) or 1.0
    weighted_sum = 0.0
    contributions: Dict[str, float] = {}

    for r in active:
        w = FULL_INTERVIEW_WEIGHTS.get(r["round"], 0) / total_weight
        contribution = w * float(r.get("score", 0) or 0)
        weighted_sum += contribution
        contributions[r["round"]] = round(contribution, 2)

    overall = max(0.0, min(100.0, round(weighted_sum, 2)))
    return overall, contributions


# ----------------------------------------------------------------------------
# Integrity summary (kept for backwards compat)
# ----------------------------------------------------------------------------

def summarize_integrity(events: List[Dict[str, Any]]) -> Dict[str, Any]:
    high = [e for e in events if (e.get("severity") or "").upper() == "HIGH"]
    medium = [e for e in events if (e.get("severity") or "").upper() == "MEDIUM"]

    type_to_phrase = {
        "FULLSCREEN_EXIT": "exited fullscreen mode",
        "TAB_SWITCH": "switched browser tabs or windows",
        "END_INTERVIEW_COMMAND": "verbally requested to end the interview",
        "TIME_EXPIRED": "the interview timer reached its limit",
        "WINDOW_BLUR": "lost window focus",
        "MIC_DENIED": "microphone permission was modified",
        "CAM_DENIED": "camera permission was modified",
    }

    rounds_with_events: Dict[str, List[str]] = {}
    for e in events:
        phrase = type_to_phrase.get(e.get("type", ""), e.get("type", "an event"))
        rounds_with_events.setdefault(e.get("round", "session"), []).append(phrase)

    if not events:
        return {
            "summary": "No assessment-integrity events were recorded during the session.",
            "risk": "LOW",
            "total_events": 0,
            "high_severity_count": 0,
            "by_round": {},
        }

    if len(high) >= INTEGRITY_RISK_THRESHOLDS["HIGH"]:
        risk = "HIGH"
    elif len(high) + len(medium) >= INTEGRITY_RISK_THRESHOLDS["MEDIUM"]:
        risk = "MEDIUM"
    else:
        risk = "LOW"

    parts = []
    for rk, phrases in rounds_with_events.items():
        label = ROUND_METADATA.get(rk, {}).get("label", rk)
        parts.append(f"In {label}, the candidate {', '.join(phrases)}.")
    summary_text = " ".join(parts) if parts else "Assessment integrity events were recorded."

    return {
        "summary": summary_text,
        "risk": risk,
        "total_events": len(events),
        "high_severity_count": len(high),
        "by_round": rounds_with_events,
    }


# ----------------------------------------------------------------------------
# Main entry point — composes per-round summaries + cumulative synthesis
# ----------------------------------------------------------------------------

def evaluate_full_interview(full_session: Dict[str, Any]) -> Dict[str, Any]:
    """Synthesise the final consolidated report. The result contains BOTH:
      - the legacy per-round view (`round_results`, `score_contributions`)
      - the new cumulative context-aware analysis
        (`cumulative_timeline`, `longitudinal_metrics`,
         `longitudinal_summary`, `skill_alignment`, `longitudinal_trends`).
    """
    round_blocks = full_session.get("round_status", {})
    enabled = full_session.get("enabled_rounds", [])

    round_results: List[Dict[str, Any]] = []
    for rk in enabled:
        block = round_blocks.get(rk, {})
        normalized = _normalize_round_result(rk, block.get("result_snapshot"))
        if block.get("status") == "SKIPPED":
            normalized["skipped"] = True
            normalized["score"] = 0.0
        round_results.append(normalized)

    overall_score, contributions = compute_overall_score(round_results)
    recommendation = recommendation_for(int(round(overall_score)))
    integrity = summarize_integrity(get_integrity_timeline(full_session["id"]))

    # Deterministic base (for the existing frontend report fields)
    base_report: Dict[str, Any] = {
        "overall_score": overall_score,
        "recommendation": recommendation,
        "weights_used": dict(FULL_INTERVIEW_WEIGHTS),
        "score_contributions": contributions,
        "round_results": round_results,
        "cross_round_analysis": longitudinal_consistency(
            build_timeline(full_session),
            {r["round"]: r.get("score", 0) for r in round_results},
        ),
        "integrity_summary": integrity,
        "candidate_id": full_session.get("candidate_id"),
        "target_role": full_session.get("target_role"),
        "generated_at": int(time.time()),
    }

    # Cumulative, context-aware synthesis (the new holistic layer)
    cumulative = evaluate_cumulatively(
        full_session=full_session,
        overall_score=overall_score,
        recommendation=recommendation,
        integrity=integrity,
    )

    # Merge — cumulative fields win because they are the more complete view.
    # We keep the per-round `round_results` for backwards compat.
    final = {**base_report, **cumulative}
    return final
