import json
import requests
import os
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("OPENROUTER_API_KEY") or os.getenv("GEMINI_API_KEY")


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
            "question": q.get("question", ""),
            "transcript": ans.get("transcript", ""),
            "candidate_answer": ans.get("transcript", ""),
            "score": ev.get("score", 0),
            "communication": ev.get("communication", 0),
            "clarity": ev.get("clarity", 0),
            "confidence": ev.get("confidence", 0),
            "professionalism": ev.get("professionalism", 0),
            "relevance": ev.get("relevance", 0),
            "self_awareness": ev.get("self_awareness", 0),
            "depth": ev.get("depth", 0),
            "feedback": ev.get("feedback", ""),
            "strengths": ev.get("strengths", []),
            "weaknesses": ev.get("weaknesses", []),
            "resume_alignment": ev.get("resume_alignment", "consistent"),
            "resume_notes": ev.get("resume_notes", ""),
        })

    return {
        "candidate_role": session.get("targetRole", "Software Engineer"),
        "total_questions": len(qa_pairs),
        "questions_answered": qa_pairs,
    }


def generate_hr_final_report(session):
    answers = session.get("answers", [])
    questions = session.get("questions", [])

    if not answers:
        return {
            "overall_score": 0,
            "verdict": "Interview Incomplete",
            "categories": {
                "communication": 0,
                "clarity": 0,
                "confidence": 0,
                "professionalism": 0,
                "teamwork": 0,
                "leadership": 0,
                "problem_solving": 0,
                "adaptability": 0,
                "self_awareness": 0,
                "motivation": 0,
            },
            "topics_covered": [],
            "strengths": [],
            "improvements": ["Please complete the interview to receive a report."],
            "question_performance": [],
            "summary": "No answers were recorded for this interview.",
            "integrity_summary": "Interview was not completed.",
            "resume_alignment": "Unable to evaluate — no answers recorded.",
            "recommendation": "Interview incomplete",
        }

    if not API_KEY:
        return _fallback_report(session)

    context = build_report_context(session)

    prompt = f"""You are a professional HR interviewer generating a final performance report.
You MUST base the report on the candidate's ACTUAL responses provided below. Do NOT use placeholder text.

Interview Data:
{json.dumps(context, indent=2)}

Generate a structured JSON report. Scores must reflect the per-question data above.

Output STRICT JSON only (no markdown, no code blocks):
{{
  "overall_score": <0-100, derived from per-question scores>,
  "verdict": "Strong HR Performance | Good HR Performance | Needs Improvement",
  "categories": {{
    "communication": <0-100>,
    "clarity": <0-100>,
    "confidence": <0-100>,
    "professionalism": <0-100>,
    "teamwork": <0-100>,
    "leadership": <0-100>,
    "problem_solving": <0-100>,
    "adaptability": <0-100>,
    "self_awareness": <0-100>,
    "motivation": <0-100>
  }},
  "topics_covered": [<unique topics from questions>],
  "strengths": [<3-5 specific strengths from the answers>],
  "improvements": [<3-5 specific areas to improve>],
  "question_performance": [
    {{
      "question_number": 1,
      "topic": "...",
      "score": <from data>,
      "question": "...",
      "candidate_answer": "<verbatim transcript of what the candidate said>",
      "transcript": "<duplicate of candidate_answer for backward compat>",
      "evaluation": {{ "feedback": "...", "strengths": [...], "weaknesses": [...] }}
    }}
  ],
  "summary": "<personalized 2-3 sentence summary based on actual transcripts>",
  "integrity_summary": "<summary of monitoring events>",
  "resume_alignment": "<short paragraph describing how answers aligned with the resume>",
  "recommendation": "Strongly Recommended | Recommended | Needs Further Evaluation | Not Recommended"
}}"""

    try:
        url = "https://openrouter.ai/api/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://vireza.com",
            "X-Title": "VIREZA AI HR Interview",
        }
        payload = {
            "model": "meta-llama/llama-3.3-70b-instruct",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.2,
            "max_tokens": 2500,
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
            required = ["overall_score", "verdict", "categories", "topics_covered",
                        "strengths", "improvements", "question_performance",
                        "summary", "integrity_summary", "resume_alignment", "recommendation"]
            if all(k in parsed for k in required):
                return parsed
    except Exception as e:
        print(f"[HR Report Generator] Error: {e}")

    return _fallback_report(session)


def _fallback_report(session):
    answers = session.get("answers", [])
    questions = session.get("questions", [])

    if not answers:
        return {
            "overall_score": 0,
            "verdict": "Interview Incomplete",
            "categories": {
                "communication": 0, "clarity": 0, "confidence": 0, "professionalism": 0,
                "teamwork": 0, "leadership": 0, "problem_solving": 0, "adaptability": 0,
                "self_awareness": 0, "motivation": 0,
            },
            "topics_covered": [], "strengths": [], "improvements": [],
            "question_performance": [], "summary": "No answers were recorded.",
            "integrity_summary": "Interview not completed.",
            "resume_alignment": "Unable to evaluate.",
            "recommendation": "Interview incomplete",
        }

    scores = []
    metric_keys = ["communication", "clarity", "confidence", "professionalism",
                   "relevance", "self_awareness", "depth"]
    metrics = {k: [] for k in metric_keys}

    q_perf = []
    all_strengths = []
    all_weaknesses = []

    for ans in answers:
        q = next((q for q in questions if q.get("id") == ans.get("questionId")), {})
        ev = ans.get("evaluation", {})
        s = ev.get("score", 5)
        scores.append(s)
        for k in metric_keys:
            metrics[k].append(ev.get(k, s))
        strengths = ev.get("strengths", []) or []
        weaknesses = ev.get("weaknesses", []) or []
        all_strengths.extend(strengths)
        all_weaknesses.extend(weaknesses)
        q_perf.append({
            "topic": q.get("topic", "General"),
            "score": s,
            "question": q.get("question", ""),
            "transcript": ans.get("transcript", ""),
            "candidate_answer": ans.get("transcript", ""),
            "evaluation": {
                "feedback": ev.get("feedback", ""),
                "strengths": strengths,
                "weaknesses": weaknesses,
            },
        })

    overall = round(sum(scores) / len(scores) * 10) if scores else 0
    overall = min(100, max(0, overall))

    def avg_pct(lst):
        if not lst:
            return overall
        return min(100, round(sum(lst) / len(lst) * 10))

    integrity_events = session.get("integrityEvents", [])
    integrity_summary = (
        "All proctoring checks maintained throughout the interview."
        if not integrity_events
        else f"{len(integrity_events)} monitoring events detected during the interview."
    )

    if overall >= 80:
        verdict = "Strong HR Performance"
        recommendation = "Strongly Recommended"
    elif overall >= 65:
        verdict = "Good HR Performance"
        recommendation = "Recommended"
    elif overall >= 50:
        verdict = "Satisfactory"
        recommendation = "Needs Further Evaluation"
    else:
        verdict = "Needs Improvement"
        recommendation = "Not Recommended"

    unique_strengths = list(dict.fromkeys(all_strengths))[:5] or [
        "Communicated experiences clearly"
    ]
    unique_weaknesses = list(dict.fromkeys(all_weaknesses))[:5] or [
        "Provide more specific examples from your experience"
    ]

    return {
        "overall_score": overall,
        "verdict": verdict,
        "categories": {
            "communication": avg_pct(metrics["communication"]),
            "clarity": avg_pct(metrics["clarity"]),
            "confidence": avg_pct(metrics["confidence"]),
            "professionalism": avg_pct(metrics["professionalism"]),
            "teamwork": overall,
            "leadership": overall,
            "problem_solving": avg_pct(metrics["depth"]),
            "adaptability": overall,
            "self_awareness": avg_pct(metrics["self_awareness"]),
            "motivation": overall,
        },
        "topics_covered": list({q.get("topic", "General") for q in questions if q.get("topic")}),
        "strengths": unique_strengths,
        "improvements": unique_weaknesses,
        "question_performance": q_perf,
        "summary": f"The candidate answered {len(answers)} of {len(questions)} questions with an average score of {overall}/100.",
        "integrity_summary": integrity_summary,
        "resume_alignment": "Your answers were generally consistent with the experience described in your resume.",
        "recommendation": recommendation,
    }
