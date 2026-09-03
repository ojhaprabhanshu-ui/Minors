"""
Cumulative Contextual Analyzer.

Produces a longitudinal, context-aware evaluation of the entire Full Interview
session by:

  1. Pulling the FULL Q+A history from every child round (OA, Technical, HR)
  2. Building a flat timeline of (round, question_number, question, answer,
     score, signals, timestamp)
  3. Computing longitudinal metrics (per-round trend, cross-skill coverage,
     declared-vs-demonstrated skill gap)
  4. Sending the Technical and HR answers to the LLM for qualitative analysis
     with strict evidence-grounding instructions (OA is excluded from qualitative
     analysis as it's coding-based rather than answer-based)
  5. Falling back to a deterministic synthesis if the API is unavailable

This module is *pure* with respect to round internals: it only reads from
the child session stores (oa_sessions / ti_sessions / hr_sessions) via the
parent's recorded round_session_ids. It does not mutate anything.

IMPORTANT: All qualitative analysis (strengths, weaknesses, skill alignment,
workplace readiness) is based on Technical and HR interview answers only.
The Online Assessment (OA) coding round is included in the timeline for
reference but excluded from qualitative evaluation since it's code-based
rather than response-based.
"""

import json
import os
import re
import time
from collections import Counter, defaultdict
from typing import Any, Dict, List, Optional, Tuple

import requests
from dotenv import load_dotenv

from full_interview.config import (
    ENABLED_ROUNDS,
    ROUND_METADATA,
    FULL_INTERVIEW_WEIGHTS,
    RECOMMENDATION_THRESHOLDS,
    INTEGRITY_RISK_THRESHOLDS,
)
from full_interview.skills_extractor import SKILL_TAXONOMY

load_dotenv()
API_KEY = os.getenv("OPENROUTER_API_KEY") or os.getenv("GEMINI_API_KEY")


# ----------------------------------------------------------------------------
# Step 1: Build the longitudinal timeline from child round stores
# ----------------------------------------------------------------------------

def _safe_get_oa_session(round_session_id: str) -> Dict[str, Any]:
    try:
        from oa.session_store import oa_sessions
        return oa_sessions.get(round_session_id) or {}
    except Exception:
        return {}


def _safe_get_ti_session(round_session_id: str) -> Dict[str, Any]:
    try:
        from technical_interview.session_store import ti_sessions
        return ti_sessions.get(round_session_id) or {}
    except Exception:
        return {}


def _safe_get_hr_session(round_session_id: str) -> Dict[str, Any]:
    try:
        from hr_interview.session_store import hr_sessions
        return hr_sessions.get(round_session_id) or {}
    except Exception:
        return {}


def _normalize_oa_qa(oa_session: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Convert OA submissions into a normalized Q+A list."""
    out: List[Dict[str, Any]] = []
    questions_by_id = {q.get("id"): q for q in oa_session.get("questions", [])}
    for qid, sub in (oa_session.get("submissions") or {}).items():
        q = questions_by_id.get(qid, {})
        out.append({
            "round": "oa",
            "question_number": len(out) + 1,
            "question_id": qid,
            "topic": q.get("topic", "Coding"),
            "difficulty": q.get("difficulty", "Medium"),
            "question": q.get("title") or q.get("description", "")[:160],
            "candidate_answer": (sub.get("code") or "")[:600],
            "transcript": (sub.get("code") or "")[:600],
            "score": float(sub.get("publicCount", 0) > 0 and
                           (sub.get("passedCount", 0) /
                            max(1, sub.get("publicCount", 0) +
                                sub.get("hiddenCount", 0))) * 10) or 0.0,
            "passed_public": sub.get("passedCount", 0),
            "total_tests": sub.get("publicCount", 0) + sub.get("hiddenCount", 0),
            "language": sub.get("language", ""),
            "signals": {
                "public_passed": sub.get("passedCount", 0),
                "hidden_passed": sub.get("hiddenPassedCount", 0),
            },
            "timestamp": sub.get("submittedAt", ""),
        })
    return out


def _normalize_text_qa(session: Dict[str, Any], round_key: str) -> List[Dict[str, Any]]:
    """Convert Technical / HR answer arrays into a normalized Q+A list."""
    out: List[Dict[str, Any]] = []
    questions_by_id = {q.get("id"): q for q in session.get("questions", [])}
    for ans in session.get("answers", []):
        q = questions_by_id.get(ans.get("questionId"), {})
        ev = ans.get("evaluation", {}) or {}
        out.append({
            "round": round_key,
            "question_number": len(out) + 1,
            "question_id": ans.get("questionId"),
            "topic": q.get("topic", "General"),
            "difficulty": q.get("difficulty", ""),
            "question": q.get("question", ""),
            "candidate_answer": (ans.get("transcript", "") or "")[:1500],
            "transcript": (ans.get("transcript", "") or "")[:1500],
            "score": float(ev.get("score", 0) or 0),
            "signals": {
                k: v for k, v in ev.items()
                if k in (
                    "technical_correctness", "depth", "problem_solving",
                    "trade_off_awareness", "communication", "relevance",
                    "depth_signal", "clarity", "confidence",
                    "professionalism", "self_awareness",
                )
            },
            "feedback": ev.get("feedback", ""),
            "strengths": ev.get("strengths", []) or [],
            "weaknesses": ev.get("weaknesses", []) or [],
            "timestamp": ans.get("createdAt", ""),
        })
    return out


def build_timeline(full_session: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Return a single, time-ordered list of every Q+A in the full session."""
    timeline: List[Dict[str, Any]] = []
    for rk in full_session.get("enabled_rounds", ENABLED_ROUNDS):
        block = full_session.get("round_status", {}).get(rk, {})
        if block.get("status") != "COMPLETED":
            continue
        round_session_id = block.get("round_session_id")
        if not round_session_id:
            continue

        if rk == "oa":
            timeline.extend(_normalize_oa_qa(_safe_get_oa_session(round_session_id)))
        elif rk == "technical":
            timeline.extend(_normalize_text_qa(_safe_get_ti_session(round_session_id), "technical"))
        elif rk == "hr":
            timeline.extend(_normalize_text_qa(_safe_get_hr_session(round_session_id), "hr"))

    # Re-number globally so the report can refer to e.g. "Question 14 of 19"
    for idx, item in enumerate(timeline, 1):
        item["global_number"] = idx
    return timeline


# ----------------------------------------------------------------------------
# Step 2: Longitudinal metrics (deterministic, no LLM)
# ----------------------------------------------------------------------------

def compute_longitudinal_metrics(timeline: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Per-round averages, global trend, score variance, declared-vs-demonstrated
    skill coverage, and integrity impact on performance. Excludes OA from qualitative trend analysis."""
    by_round: Dict[str, List[float]] = defaultdict(list)
    for qa in timeline:
        if qa.get("score"):
            by_round[qa["round"]].append(float(qa["score"]))

    per_round_avg = {
        rk: round(sum(v) / len(v), 2) if v else 0.0
        for rk, v in by_round.items()
    }

    # For qualitative trend analysis, use only Technical and HR rounds (exclude OA)
    qual_scores = [s for qa in timeline if qa['round'] in ['technical', 'hr'] for s in [qa.get('score')] if s]
    all_scores = [s for scores in by_round.values() for s in scores]
    
    # Use qualitative scores for trend analysis
    trend_scores = qual_scores if qual_scores else all_scores
    global_avg = round(sum(trend_scores) / len(trend_scores), 2) if trend_scores else 0.0
    variance = round(
        sum((s - global_avg) ** 2 for s in trend_scores) / len(trend_scores), 2
    ) if trend_scores else 0.0

    # Trend: compare last-third mean to first-third mean (based on Technical/HR only)
    trend = "STABLE"
    if len(trend_scores) >= 4:
        third = max(1, len(trend_scores) // 3)
        first = sum(trend_scores[:third]) / third
        last = sum(trend_scores[-third:]) / third
        delta = last - first
        if delta > 1.5:
            trend = "IMPROVING"
        elif delta < -1.5:
            trend = "DECLINING"

    # Declared-vs-demonstrated skill coverage (focus on Technical/HR answers)
    skill_profile = {}
    full_session_meta = {}  # filled by caller if needed
    qual_timeline = [qa for qa in timeline if qa['round'] in ['technical', 'hr']]
    coverage = _skill_coverage(skill_profile, qual_timeline)

    return {
        "per_round_avg": per_round_avg,
        "global_avg": global_avg,
        "score_variance": variance,
        "consistency": "HIGH" if variance < 3 else "MEDIUM" if variance < 8 else "LOW",
        "trend": trend,
        "skill_coverage": coverage,
        "total_questions": len(timeline),
        "questions_answered": sum(1 for qa in timeline if qa.get("candidate_answer")),
        "qualitative_questions": len(qual_timeline),  # Technical + HR only
        "oa_questions": len([qa for qa in timeline if qa['round'] == 'oa']),  # OA for reference
    }


def _skill_coverage(skill_profile: Dict[str, Any], timeline: List[Dict[str, Any]]) -> Dict[str, Any]:
    """For each canonical skill in the profile, count how many times the
    candidate's transcript mentioned it (a coarse demonstrated-skill signal)."""
    declared = set()
    for bucket in ("primary", "supporting", "exposure"):
        for s in (skill_profile.get(bucket) or []):
            declared.add(s)

    mentioned: Counter = Counter()
    for qa in timeline:
        text = (qa.get("candidate_answer") or "").lower()
        for canonical in SKILL_TAXONOMY:
            aliases = [canonical] + SKILL_TAXONOMY[canonical].get("aliases", [])
            for alias in aliases:
                if len(alias) <= 3:
                    pat = r"(?<![\w])" + re.escape(alias) + r"(?![\w])"
                else:
                    pat = r"(?<![\w])" + re.escape(alias) + r"(?![\w])"
                if re.search(pat, text):
                    mentioned[canonical] += 1
                    break

    covered = sorted([s for s in declared if mentioned.get(s, 0) > 0])
    gaps = sorted([s for s in declared if mentioned.get(s, 0) == 0])
    return {
        "declared": sorted(declared),
        "covered": covered,
        "gaps": gaps,
        "coverage_rate": round(len(covered) / max(1, len(declared)), 2),
    }


# ----------------------------------------------------------------------------
# Step 3: Cross-round consistency (granular, longitudinal version)
# ----------------------------------------------------------------------------

def longitudinal_consistency(
    timeline: List[Dict[str, Any]],
    per_round_avg: Dict[str, float],
) -> Dict[str, Any]:
    """More nuanced than the round-only version: looks at variance WITHIN a
    round (e.g. candidate got worse across HR Q5-Q8) AND across rounds.
    Excludes OA from qualitative consistency analysis."""
    notes: List[str] = []
    
    # For qualitative analysis, focus on Technical and HR rounds only
    qual_timeline = [qa for qa in timeline if qa['round'] in ['technical', 'hr']]
    qual_per_round_avg = {k: v for k, v in per_round_avg.items() if k in ['technical', 'hr']}

    # Technical -> HR delta chain (excluding OA from qualitative trend)
    chain = ["technical", "hr"]
    for i in range(len(chain) - 1):
        a, b = chain[i], chain[i + 1]
        if qual_per_round_avg.get(a) and qual_per_round_avg.get(b):
            delta = qual_per_round_avg[b] - qual_per_round_avg[a]
            if abs(delta) > 8:
                direction = "better" if delta > 0 else "worse"
                notes.append(
                    f"Performance in {ROUND_METADATA.get(b, {}).get('label', b)} is "
                    f"{abs(delta):.0f} points {direction} than "
                    f"{ROUND_METADATA.get(a, {}).get('label', a)} — "
                    f"suggests a real strength gap (or a real strength) across formats."
                )

    # Within-round trend (focus on Technical and HR)
    by_round: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
    for qa in qual_timeline:
        by_round[qa["round"]].append(qa)
    for rk, items in by_round.items():
        if len(items) >= 3:
            first = sum(q.get("score", 0) for q in items[:2]) / 2
            last = sum(q.get("score", 0) for q in items[-2:]) / 2
            if last - first > 1.5:
                notes.append(
                    f"Within {ROUND_METADATA.get(rk, {}).get('label', rk)}, performance "
                    f"improved by {last - first:.1f} points from the first 2 to the last 2 "
                    f"answers — the candidate warmed up or learned from feedback."
                )
            elif first - last > 1.5:
                notes.append(
                    f"Within {ROUND_METADATA.get(rk, {}).get('label', rk)}, performance "
                    f"declined by {first - last:.1f} points from the first 2 to the last 2 "
                    f"answers — possible fatigue or time pressure."
                )

    # Variance-based signal (Technical and HR only)
    if qual_timeline:
        scores = [q.get("score", 0) for q in qual_timeline if q.get("score")]
        if scores:
            mean = sum(scores) / len(scores)
            var = sum((s - mean) ** 2 for s in scores) / len(scores)
            if var > 8:
                notes.append(
                    f"High variance across {len(scores)} scored answers in Technical/HR rounds (σ²={var:.1f}). "
                    f"Performance is inconsistent — some answers are very strong, others weak."
                )
            elif var < 2:
                notes.append(
                    f"Low variance across {len(scores)} scored answers in Technical/HR rounds (σ²={var:.1f}). "
                    f"Performance is consistent and predictable."
                )

    return {
        "level": (
            "HIGHLY_CONSISTENT" if not notes or all("consistent" in n.lower() for n in notes)
            else "MIXED_SIGNALS" if any("gap" in n.lower() or "variance" in n.lower() for n in notes)
            else "MOSTLY_CONSISTENT"
        ),
        "notes": notes,
        "analysis_focus": "Technical and HR interview rounds only (OA excluded from qualitative analysis)",
    }


# ----------------------------------------------------------------------------
# Step 4: LLM-assisted cumulative narrative
# ----------------------------------------------------------------------------

def _format_timeline_for_prompt(timeline: List[Dict[str, Any]]) -> str:
    """Compact but evidence-grounded timeline rendering for the LLM prompt, focused on actual answers."""
    lines: List[str] = []
    # Separate OA (for informational purposes) from Technical/HR (for answer-based analysis)
    technical_hr_timeline = [qa for qa in timeline if qa['round'] in ['technical', 'hr']]
    oa_timeline = [qa for qa in timeline if qa['round'] == 'oa']
    
    if technical_hr_timeline:
        lines.append("=== TECHNICAL & HR INTERVIEW ANSWERS (ANALYSIS FOCUS) ===")
        for qa in technical_hr_timeline:
            signals = ", ".join(f"{k}={v}" for k, v in (qa.get("signals") or {}).items() if v)
            answer_preview = (qa.get("candidate_answer") or "").replace("\n", " ").strip()[:280]
            answer_length = len(qa.get("candidate_answer", ""))
            lines.append(
                f"#{qa['global_number']} [{ROUND_METADATA.get(qa['round'], {}).get('label', qa['round'])}] "
                f"({qa.get('topic','General')}, diff={qa.get('difficulty','?')}) "
                f"score={qa.get('score',0):.1f}/10 {('['+signals+']') if signals else ''} "
                f"answer_length={answer_length} chars\n"
                f"  Q: {qa.get('question','')[:200]}\n"
                f"  A: {answer_preview}"
            )
    
    if oa_timeline:
        lines.append("\n=== ONLINE ASSESSMENT CODING PROBLEMS (REFERENCE ONLY) ===")
        for qa in oa_timeline:
            answer_preview = (qa.get("candidate_answer") or "").replace("\n", " ").strip()[:280]
            lines.append(
                f"#{qa['global_number']} [OA Coding] "
                f"({qa.get('topic','Coding')}, diff={qa.get('difficulty','?')}) "
                f"score={qa.get('score',0):.1f}/10 passed={qa.get('passed_public',0)}/{qa.get('total_tests',0)}\n"
                f"  Q: {qa.get('question','')[:200]}\n"
                f"  Code Preview: {answer_preview}"
            )
    
    return "\n".join(lines) if lines else "(no questions were answered)"


def _build_holistic_narrative(
    full_session: Dict[str, Any],
    timeline: List[Dict[str, Any]],
    metrics: Dict[str, Any],
    consistency: Dict[str, Any],
    integrity: Dict[str, Any],
    skill_profile: Dict[str, Any],
    overall_score: float,
    recommendation: str,
) -> Dict[str, Any]:
    """Ask the LLM to synthesize a *cumulative, holistic* report from the
    full timeline. Returns a dict with strengths, weaknesses, longitudinal
    narrative, workplace readiness, and a final summary — every claim must
    reference a specific question/answer pair in the timeline."""

    if not API_KEY:
        return _deterministic_narrative(timeline, metrics, consistency, overall_score, recommendation)

    timeline_text = _format_timeline_for_prompt(timeline)
    skill_text = ""
    if skill_profile:
        from full_interview.skills_extractor import skill_profile_for_prompt
        skill_text = skill_profile_for_prompt(skill_profile)

    prompt = f"""You are a senior hiring manager writing a CUMULATIVE, longitudinal performance
report for a candidate who completed a multi-round AI interview (Coding → Technical → HR).

CRITICAL INSTRUCTION: Your analysis MUST be based ENTIRELY on the candidate's actual responses. You are to evaluate:
1. The specific content and quality of each answer provided in Technical and HR rounds
2. The depth of understanding demonstrated in their explanations
3. Their ability to connect concepts and apply knowledge practically
4. Their communication and professional behavior
5. Longitudinal patterns across their actual performance

YOU MUST NOT:
- Use generic templates or placeholder text
- Invent strengths or weaknesses not evident in the actual answers
- Provide feedback that doesn't match the actual transcripts
- Assume capabilities not demonstrated in the interview
- Include Online Assessment (OA) coding problems in your qualitative analysis (use only for reference)

The candidate answered {len(timeline)} questions across the session. Below is the COMPLETE
Q+A timeline, with per-question scores and per-question signals. You MUST read every
question and answer before drawing conclusions. Your report must be EVIDENCE-GROUNDED:
every claim must cite the question number it came from (e.g. "Q4 of the HR round showed
weakness in X because the candidate's answer mentioned Y").

=== CANDIDATE SKILL PROFILE ===
{skill_text or '(no skill profile available)'}

=== COMPLETE Q+A TIMELINE (Technical & HR focus for analysis, OA for reference) ===
{timeline_text}

=== LONGITUDINAL METRICS ===
{json.dumps(metrics, indent=2)}

=== CROSS-ROUND CONSISTENCY NOTES ===
{json.dumps(consistency, indent=2)}

=== INTEGRITY ===
{json.dumps(integrity, indent=2)}

=== OVERALL SCORE & RECOMMENDATION ===
Overall: {overall_score:.1f}/100 | Recommendation: {recommendation}

=== INSTRUCTIONS ===
Generate a structured JSON object with EXACTLY these fields. No markdown, no code blocks.
Every claim must reference specific question numbers from the Technical and HR timeline above.

{{
  "longitudinal_summary": "3-5 sentence narrative describing how the candidate's performance evolved across the FULL session — not just round-by-round. What did they start strong on, what did they improve, what did they get worse at, and what is the overall arc? BASED ON THEIR ACTUAL ANSWERS.",
  "strengths": ["<specific strength clearly demonstrated in their actual answers, with question number reference>", ...],
  "weaknesses": ["<specific gap or weakness observed in their actual answers, with question number reference>", ...],
  "skill_alignment": {{
    "declared_skills_covered": ["<skill the candidate declared and demonstrated well in their answers>"],
    "declared_skills_gaps": ["<skill the candidate declared but did not demonstrate in their answers>"],
    "undiscovered_strengths": ["<skill the candidate showed in their answers that was not on their declared list>"],
    "narrative": "2-3 sentence assessment of how well the candidate's declared skills match what they actually demonstrated in their responses."
  }},
  "workplace_readiness": {{
    "technical_readiness": "Beginner | Developing | Proficient | Advanced",
    "communication_readiness": "Beginner | Developing | Proficient | Advanced",
    "collaboration_readiness": "Beginner | Developing | Proficient | Advanced",
    "problem_solving_readiness": "Beginner | Developing | Proficient | Advanced",
    "notes": "2-3 sentence summary of how prepared the candidate is for day-1 work, citing specific evidence from their answers."
  }},
  "longitudinal_trends": {{
    "trend": "IMPROVING | STABLE | DECLINING",
    "explanation": "1-2 sentence explanation grounded in the timeline of their actual answers"
  }},
  "summary": "2-3 sentence executive summary of the candidate's full interview performance based entirely on their actual responses."
}}

CRITICAL: Read every question/answer above before writing. Cite question numbers in your claims.
Do NOT fabricate scores or feedback. Every assessment must be grounded in the candidate's actual answers from Technical and HR rounds."""

    try:
        url = "https://openrouter.ai/api/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://vireza.com",
            "X-Title": "VIREZA Cumulative Report",
        }
        payload = {
            "model": "meta-llama/llama-3.3-70b-instruct",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.2,
            "max_tokens": 2200,
        }
        res = requests.post(url, headers=headers, json=payload, timeout=30)
        if res.status_code == 200:
            data = res.json()
            raw = (data.get("choices", [{}])[0].get("message", {}).get("content", "{}") or "").strip()
            if raw.startswith("```json"):
                raw = raw[7:]
            if raw.startswith("```"):
                raw = raw[3:]
            if raw.endswith("```"):
                raw = raw[:-3]
            parsed = json.loads(raw.strip())
            required = [
                "longitudinal_summary", "strengths", "weaknesses",
                "skill_alignment", "workplace_readiness",
                "longitudinal_trends", "summary",
            ]
            if all(k in parsed for k in required):
                return parsed
    except Exception as e:
        print(f"[Cumulative Analyzer] LLM error: {e}")
    return _deterministic_narrative(timeline, metrics, consistency, overall_score, recommendation)


def _deterministic_narrative(
    timeline: List[Dict[str, Any]],
    metrics: Dict[str, Any],
    consistency: Dict[str, Any],
    overall_score: float,
    recommendation: str,
) -> Dict[str, Any]:
    """Used when no LLM is available. Produces a structured report from the
    longitudinal metrics alone, focused on actual answers from Technical/HR rounds."""
    # Focus only on Technical and HR rounds for qualitative analysis
    analysis_timeline = [qa for qa in timeline if qa['round'] in ['technical', 'hr']]
    
    strengths: List[str] = []
    weaknesses: List[str] = []
    for qa in analysis_timeline:
        if qa.get("score", 0) >= 8:
            s = qa.get("strengths") or ["Strong answer"]
            strengths.append(f"Q{qa['global_number']} ({ROUND_METADATA.get(qa['round'], {}).get('label', qa['round'])}): {s[0]}")
        elif qa.get("score", 0) and qa.get("score", 0) < 5:
            w = qa.get("weaknesses") or ["Weak answer"]
            weaknesses.append(f"Q{qa['global_number']} ({ROUND_METADATA.get(qa['round'], {}).get('label', qa['round'])}): {w[0]}")

    strengths = strengths[:5] or ["Completed the interview with coherent performance profile."]
    weaknesses = weaknesses[:5] or ["Develop stronger technical explanations and provide more specific examples."]

    coverage = metrics.get("skill_coverage", {}) or {}
    # Calculate metrics excluding OA for qualitative assessment
    tech_hr_questions = len(analysis_timeline)
    tech_hr_avg = metrics.get("per_round_avg", {}).get("technical", 0) + metrics.get("per_round_avg", {}).get("hr", 0)
    tech_hr_avg = tech_hr_avg / 2 if (metrics.get("per_round_avg", {}).get("technical") and metrics.get("per_round_avg", {}).get("hr")) else tech_hr_avg
    
    return {
        "longitudinal_summary": (
            f"Across {tech_hr_questions} Technical and HR interview questions, the candidate "
            f"averaged {tech_hr_avg:.1f}/10 with a "
            f"{metrics.get('consistency', 'MEDIUM').lower()} consistency signal. "
            f"The overall trend across the session was {metrics.get('trend', 'STABLE').lower()}. "
            f"Analysis based on actual interview responses provided."
        ),
        "strengths": strengths,
        "weaknesses": weaknesses,
        "skill_alignment": {
            "declared_skills_covered": coverage.get("covered", []),
            "declared_skills_gaps": coverage.get("gaps", []),
            "undiscovered_strengths": [],
            "narrative": (
                f"Coverage rate of declared skills: {int((coverage.get('coverage_rate') or 0) * 100)}%. "
                f"Based on actual Technical and HR interview responses."
                if coverage else "Skill coverage data unavailable."
            ),
        },
        "workplace_readiness": {
            "technical_readiness": "Proficient" if overall_score >= 70 else "Developing",
            "communication_readiness": "Proficient" if overall_score >= 70 else "Developing",
            "collaboration_readiness": "Proficient" if overall_score >= 70 else "Developing",
            "problem_solving_readiness": "Proficient" if overall_score >= 70 else "Developing",
            "notes": f"Candidate achieved an overall score of {overall_score:.0f}/100 with "
                     f"trend = {metrics.get('trend', 'STABLE')}. Assessment based on actual interview responses.",
        },
        "longitudinal_trends": {
            "trend": metrics.get("trend", "STABLE"),
            "explanation": "Trend derived from the longitudinal score trajectory across Technical and HR rounds.",
        },
        "summary": f"Final recommendation: {recommendation}. Overall score "
                   f"{overall_score:.0f}/100 across {metrics.get('total_questions', 0)} "
                   f"questions with {metrics.get('consistency', 'MEDIUM').lower()} consistency. "
                   f"Analysis based on actual Technical and HR interview responses.",
    }


# ----------------------------------------------------------------------------
# Step 5: Public entry point
# ----------------------------------------------------------------------------

def evaluate_cumulatively(
    full_session: Dict[str, Any],
    overall_score: float,
    recommendation: str,
    integrity: Dict[str, Any],
) -> Dict[str, Any]:
    """Main entry point. Returns a dict that the orchestrator merges into
    the final report."""
    timeline = build_timeline(full_session)
    skill_profile = full_session.get("skill_profile", {}) or {}
    metrics = compute_longitudinal_metrics(timeline)
    consistency = longitudinal_consistency(timeline, metrics.get("per_round_avg", {}))

    narrative = _build_holistic_narrative(
        full_session=full_session,
        timeline=timeline,
        metrics=metrics,
        consistency=consistency,
        integrity=integrity,
        skill_profile=skill_profile,
        overall_score=overall_score,
        recommendation=recommendation,
    )

    return {
        "cumulative_timeline": timeline,
        "longitudinal_metrics": metrics,
        "longitudinal_consistency": consistency,
        "skill_profile": skill_profile,
        **narrative,
    }
