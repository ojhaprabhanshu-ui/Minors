import json
import os
import re
import requests
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("OPENROUTER_API_KEY") or os.getenv("GEMINI_API_KEY")


def repair_json_string(raw_text: str) -> str:
    raw_text = re.sub(r"\n+", " ", raw_text)
    raw_text = re.sub(r"\s+", " ", raw_text)
    return raw_text.strip()


def safe_json_parse(raw_text: str):
    try:
        return json.loads(raw_text)
    except json.JSONDecodeError:
        try:
            return json.loads(repair_json_string(raw_text))
        except json.JSONDecodeError:
            return {}


def build_report_context(session):
    answers = session.get("answers", [])
    questions = session.get("questions", [])

    qa_pairs = []
    for ans in answers:
        q = next((q for q in questions if q.get("id") == ans.get("questionId")), {})
        ev = ans.get("evaluation", {})
        qa_pairs.append({
            "question_number": len(qa_pairs) + 1,
            "topic": q.get("topic", "General"),
            "difficulty": q.get("difficulty", "Medium"),
            "probe_focus": q.get("probe_focus", ""),
            "question": q.get("question", ""),
            "transcript": ans.get("transcript", ""),
            "candidate_answer": ans.get("transcript", ""),
            "score": ev.get("score", 0),
            "technical_correctness": ev.get("technical_correctness", 0),
            "depth": ev.get("depth", 0),
            "problem_solving": ev.get("problem_solving", 0),
            "trade_off_awareness": ev.get("trade_off_awareness", 0),
            "communication": ev.get("communication", 0),
            "relevance": ev.get("relevance", 0),
            "depth_signal": ev.get("depth_signal", "shallow"),
            "feedback": ev.get("feedback", ""),
            "strengths": ev.get("strengths", []),
            "weaknesses": ev.get("weaknesses", []),
        })

    return {
        "candidate_role": session.get("targetRole", "Software Engineer"),
        "total_questions": len(qa_pairs),
        "questions_answered": qa_pairs,
    }


def generate_final_report(session):
    answers = session.get("answers", [])
    questions = session.get("questions", [])

    if not answers:
        return _empty_report()

    if not API_KEY:
        return _fallback_report(session)

    context = build_report_context(session)
    end_reason = session.get("endReason") or ("TIME_EXPIRED" if session.get("status") == "TIME_EXPIRED" else "COMPLETED")

    prompt = f"""You are an expert technical interviewer generating a Technical Assessment Report for a Round 2 high-stakes interview.

You MUST base the report strictly on the candidate's actual interview performance captured below. Do NOT use generic or placeholder text. Every claim must reference the actual transcripts and per-question evaluations.

Interview Data:
{json.dumps(context, indent=2)}

Interview termination reason: {end_reason}

Generate a structured JSON report with EXACTLY these sections:

{{
  "overall_score": <0-100, computed from the per-question scores>,
  "verdict": "Strong Technical Performance | Satisfactory Technical Performance | Needs Improvement",
  "technical_proficiency_summary": {{
    "data_structures_and_algorithms": <0-100>,
    "system_design_and_architecture": <0-100>,
    "databases_and_storage": <0-100>,
    "networking_and_os": <0-100>,
    "language_specific_depth": <0-100>,
    "distributed_systems_thinking": <0-100>
  }},
  "depth_of_understanding": {{
    "level": "WHY" | "HOW" | "SHALLOW",
    "score": <0-100>,
    "analysis": "2-3 sentence analysis of whether the candidate understands WHY technologies work, not just HOW to use them.",
    "evidence": ["specific quote or topic from the interview that supports this assessment", ...]
  }},
  "strengths_and_knowledge_gaps": {{
    "strengths": [
      "<specific area of expertise observed in the interview, with evidence from the transcript>",
      ...
    ],
    "knowledge_gaps": [
      "<specific area where the candidate struggled, with what was missing>",
      ...
    ]
  }},
  "question_performance": [
    {{
      "question_number": 1,
      "topic": "...",
      "difficulty": "...",
      "probe_focus": "...",
      "question": "...",
      "candidate_answer": "<verbatim transcript of the candidate's answer>",
      "transcript": "<duplicate of candidate_answer for backward compat with the HR report schema>",
      "score": <0-10>,
      "feedback": "...",
      "strengths": [...],
      "weaknesses": [...]
    }}
  ],
  "topics_covered": ["unique topics from the questions"],
  "integrity_summary": "<summary of any monitoring events>",
  "recommendation": {{
    "decision": "Hire" | "No Hire" | "Follow-up Required",
    "rationale": "2-3 sentence rationale grounded in the evidence above",
    "evidence": ["specific signal that drove the decision", ...]
  }},
  "summary": "2-3 sentence personalized summary"
}}

Calibration for the recommendation:
- overall_score >= 80 with strong "WHY" depth signal: "Hire"
- overall_score 60-79 OR mixed depth: "Follow-up Required"
- overall_score < 60 OR shallow answers throughout: "No Hire"

The depth_of_understanding.level is "WHY" if the candidate consistently explained trade-offs, internals, or failure modes; "HOW" if they described usage correctly but did not justify choices; "SHALLOW" if answers were generic or off-topic.

CRITICAL: Use the actual transcript and evaluation data. Do not invent scores or feedback. The report must reflect the candidate's real performance."""

    try:
        url = "https://openrouter.ai/api/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://vireza.com",
            "X-Title": "VIREZA AI Technical Interview",
        }
        payload = {
            "model": "meta-llama/llama-3.3-70b-instruct",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.2,
            "max_tokens": 3000,
        }
        res = requests.post(url, headers=headers, json=payload, timeout=25)
        if res.status_code == 200:
            data = res.json()
            raw_text = data.get("choices", [{}])[0].get("message", {}).get("content", "{}")
            raw_text = raw_text.strip()
            if raw_text.startswith("```json"):
                raw_text = raw_text[7:]
            if raw_text.startswith("```"):
                raw_text = raw_text[3:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]
            parsed = json.loads(raw_text.strip())
            required = [
                "overall_score", "verdict", "technical_proficiency_summary",
                "depth_of_understanding", "strengths_and_knowledge_gaps",
                "question_performance", "topics_covered", "integrity_summary",
                "recommendation", "summary",
            ]
            if all(k in parsed for k in required):
                return parsed
    except Exception as e:
        print(f"[Technical Report Generator] Error: {e}")

    return _fallback_report(session)


def _empty_report():
    return {
        "overall_score": 0,
        "verdict": "Interview Incomplete",
        "technical_proficiency_summary": {
            "data_structures_and_algorithms": 0,
            "system_design_and_architecture": 0,
            "databases_and_storage": 0,
            "networking_and_os": 0,
            "language_specific_depth": 0,
            "distributed_systems_thinking": 0,
        },
        "depth_of_understanding": {
            "level": "SHALLOW",
            "score": 0,
            "analysis": "No answers were recorded for this interview.",
            "evidence": [],
        },
        "strengths_and_knowledge_gaps": {
            "strengths": [],
            "knowledge_gaps": ["Please complete the interview to receive a report."],
        },
        "question_performance": [],
        "topics_covered": [],
        "integrity_summary": "Interview was not completed.",
        "recommendation": {
            "decision": "No Hire",
            "rationale": "Candidate did not provide any answers.",
            "evidence": [],
        },
        "summary": "No answers were recorded for this interview.",
    }


def _fallback_report(session):
    answers = session.get("answers", [])
    questions = session.get("questions", [])

    if not answers:
        return _empty_report()

    scores = []
    tech_scores = []
    depth_scores = []
    comm_scores = []
    rel_scores = []
    ps_scores = []
    trade_scores = []

    q_perf = []
    all_strengths = []
    all_weaknesses = []
    why_count = 0

    for ans in answers:
        q = next((q for q in questions if q.get("id") == ans.get("questionId")), {})
        ev = ans.get("evaluation", {})

        s = ev.get("score", 5)
        scores.append(s)
        tech_scores.append(ev.get("technical_correctness", s))
        depth_scores.append(ev.get("depth", s))
        comm_scores.append(ev.get("communication", s))
        rel_scores.append(ev.get("relevance", s))
        ps_scores.append(ev.get("problem_solving", s))
        trade_scores.append(ev.get("trade_off_awareness", s))
        if ev.get("depth_signal") == "why":
            why_count += 1

        all_strengths.extend(ev.get("strengths", []) or [])
        all_weaknesses.extend(ev.get("weaknesses", []) or [])

        q_perf.append({
            "question_number": len(q_perf) + 1,
            "topic": q.get("topic", "General"),
            "difficulty": q.get("difficulty", "Medium"),
            "probe_focus": q.get("probe_focus", ""),
            "question": q.get("question", ""),
            "candidate_answer": ans.get("transcript", ""),
            "score": s,
            "feedback": ev.get("feedback", ""),
            "strengths": ev.get("strengths", []) or [],
            "weaknesses": ev.get("weaknesses", []) or [],
        })

    overall = round(sum(scores) / len(scores) * 10) if scores else 0
    overall = min(100, max(0, overall))

    def avg_pct(lst):
        if not lst:
            return overall
        return min(100, round(sum(lst) / len(lst) * 10))

    avg_depth = avg_pct(depth_scores)
    if why_count / max(1, len(answers)) >= 0.6:
        depth_level = "WHY"
    elif why_count / max(1, len(answers)) >= 0.3:
        depth_level = "HOW"
    else:
        depth_level = "SHALLOW"

    if overall >= 80:
        verdict = "Strong Technical Performance"
    elif overall >= 60:
        verdict = "Satisfactory Technical Performance"
    else:
        verdict = "Needs Improvement"

    if overall >= 80 and depth_level == "WHY":
        decision = "Hire"
    elif overall >= 60:
        decision = "Follow-up Required"
    else:
        decision = "No Hire"

    unique_strengths = list(dict.fromkeys(all_strengths))[:5] or [
        "Demonstrated solid understanding of core concepts"
    ]
    unique_weaknesses = list(dict.fromkeys(all_weaknesses))[:5] or [
        "Explore deeper edge cases and trade-offs"
    ]

    integrity_events = session.get("integrityEvents", [])
    integrity_summary = (
        "All proctoring checks maintained throughout the interview."
        if not integrity_events
        else f"{len(integrity_events)} monitoring events detected during the interview."
    )

    return {
        "overall_score": overall,
        "verdict": verdict,
        "technical_proficiency_summary": {
            "data_structures_and_algorithms": avg_pct(ps_scores),
            "system_design_and_architecture": avg_pct(trade_scores),
            "databases_and_storage": avg_pct(rel_scores),
            "networking_and_os": avg_pct(rel_scores),
            "language_specific_depth": avg_pct(tech_scores),
            "distributed_systems_thinking": avg_pct(trade_scores),
        },
        "depth_of_understanding": {
            "level": depth_level,
            "score": avg_depth,
            "analysis": (
                f"Across {len(answers)} answer(s), the candidate demonstrated {depth_level.lower()} depth. "
                f"They { 'explained trade-offs and internals' if depth_level=='WHY' else 'described usage correctly' if depth_level=='HOW' else 'provided mostly surface-level answers' }."
            ),
            "evidence": q_perf[0]["feedback"] if q_perf else "",
        },
        "strengths_and_knowledge_gaps": {
            "strengths": unique_strengths,
            "knowledge_gaps": unique_weaknesses,
        },
        "question_performance": q_perf,
        "topics_covered": list({q.get("topic", "General") for q in questions if q.get("topic")}),
        "integrity_summary": integrity_summary,
        "recommendation": {
            "decision": decision,
            "rationale": (
                f"Overall score {overall}/100 with {depth_level} depth. "
                f"{'Strong technical mastery across probed domains.' if decision=='Hire' else 'Mixed signals; recommend a focused follow-up.' if decision=='Follow-up Required' else 'Performance did not meet the bar for this role.'}"
            ),
            "evidence": unique_strengths[:2] + unique_weaknesses[:2],
        },
        "summary": f"The candidate answered {len(answers)} of {len(questions)} questions with an average score of {overall}/100.",
    }
