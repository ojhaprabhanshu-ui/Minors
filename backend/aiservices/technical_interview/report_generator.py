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
            "difficulty": q.get("difficulty", "Medium"),
            "question": q.get("question", ""),
            "transcript": ans.get("transcript", ""),
            "score": ev.get("score", 0),
            "technical_correctness": ev.get("technical_correctness", 0),
            "depth": ev.get("depth", 0),
            "communication": ev.get("communication", 0),
            "relevance": ev.get("relevance", 0),
            "problem_solving": ev.get("problem_solving", 0),
            "feedback": ev.get("feedback", ""),
            "strengths": ev.get("strengths", []),
            "weaknesses": ev.get("weaknesses", []),
        })

    context = {
        "candidate_role": session.get("targetRole", "Software Engineer"),
        "total_questions": len(qa_pairs),
        "questions_answered": qa_pairs,
    }
    return context


def generate_final_report(session):
    answers = session.get("answers", [])
    questions = session.get("questions", [])

    if not answers:
        return {
            "overall_score": 0,
            "verdict": "Interview Incomplete",
            "categories": {
                "technical_knowledge": 0,
                "problem_solving": 0,
                "communication": 0,
                "depth_of_understanding": 0,
                "resume_knowledge": 0,
                "adaptability": 0,
            },
            "topics_covered": [],
            "strengths": [],
            "improvements": ["Please complete the interview to receive a report."],
            "question_performance": [],
            "summary": "No answers were recorded for this interview.",
            "integrity_summary": "Interview was not completed.",
            "recommendation": "Interview incomplete",
        }

    if not API_KEY:
        return generate_fallback_report(session)

    context = build_report_context(session)

    prompt = f"""You are an expert technical interviewer generating a final performance report based on the candidate's ACTUAL interview responses.

You MUST analyze the real question-by-question data provided below and produce a personalized report. Do NOT use generic or placeholder text.

Interview Data:
{json.dumps(context, indent=2)}

Generate a structured JSON report with these fields. All scores must be derived from the per-question data above.

Output STRICT JSON only (no markdown, no code blocks):
{{
  "overall_score": <0-100, computed from per-question scores>,
  "verdict": "Strong Technical Performance | Satisfactory Technical Performance | Needs Improvement",
  "categories": {{
    "technical_knowledge": <0-100, based on technical_correctness across answers>,
    "problem_solving": <0-100, based on problem_solving scores>,
    "communication": <0-100, based on communication scores>,
    "depth_of_understanding": <0-100, based on depth scores>,
    "resume_knowledge": <0-100, based on relevance to resume context>,
    "adaptability": <0-100, based on performance across varying topics>
  }},
  "topics_covered": [<unique topics from the questions>],
  "strengths": [<3-5 specific strengths observed in the actual answers>],
  "improvements": [<3-5 specific areas to improve based on the actual weaknesses>],
  "question_performance": [
    {{
      "question_number": 1,
      "topic": "...",
      "score": <actual score from data>,
      "question": "<actual question text>",
      "transcript": "<candidate's actual answer>",
      "evaluation": {{
        "feedback": "<from data>",
        "strengths": [...],
        "weaknesses": [...]
      }}
    }}
  ],
  "summary": "<2-3 sentence personalized summary based on what the candidate actually said>",
  "integrity_summary": "<summary of any monitoring events>",
  "recommendation": "Recommended for next round | Consider further evaluation | Further technical practice recommended"
}}

CRITICAL: Use the actual transcript and evaluation data. Do not invent scores or feedback. The report must reflect the candidate's real performance."""

    try:
        url = "https://openrouter.ai/api/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://vireza.com",
            "X-Title": "VIREZA AI Interview",
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

            for key in ["overall_score", "verdict", "categories", "topics_covered",
                        "strengths", "improvements", "question_performance",
                        "summary", "integrity_summary", "recommendation"]:
                if key not in parsed:
                    return generate_fallback_report(session)

            return parsed
    except Exception as e:
        print(f"[Report Generator] Error: {e}")

    return generate_fallback_report(session)


def generate_fallback_report(session):
    answers = session.get("answers", [])
    questions = session.get("questions", [])

    if not answers:
        return {
            "overall_score": 0,
            "verdict": "Interview Incomplete",
            "categories": {
                "technical_knowledge": 0,
                "problem_solving": 0,
                "communication": 0,
                "depth_of_understanding": 0,
                "resume_knowledge": 0,
                "adaptability": 0,
            },
            "topics_covered": [],
            "strengths": [],
            "improvements": ["Please complete the interview to receive a report."],
            "question_performance": [],
            "summary": "No answers were recorded for this interview.",
            "integrity_summary": "Interview was not completed.",
            "recommendation": "Interview incomplete",
        }

    scores = []
    tech_scores = []
    depth_scores = []
    comm_scores = []
    rel_scores = []
    ps_scores = []

    q_perf = []
    all_strengths = []
    all_weaknesses = []

    for ans in answers:
        q = next((q for q in questions if q.get("id") == ans.get("questionId")), {})
        ev = ans.get("evaluation", {})

        score = ev.get("score", 5)
        scores.append(score)
        tech_scores.append(ev.get("technical_correctness", score))
        depth_scores.append(ev.get("depth", score))
        comm_scores.append(ev.get("communication", score))
        rel_scores.append(ev.get("relevance", score))
        ps_scores.append(ev.get("problem_solving", score))

        strengths = ev.get("strengths", []) or []
        weaknesses = ev.get("weaknesses", []) or []
        all_strengths.extend(strengths)
        all_weaknesses.extend(weaknesses)

        q_perf.append({
            "topic": q.get("topic", "General"),
            "score": score,
            "question": q.get("question", ""),
            "transcript": ans.get("transcript", ""),
            "evaluation": {
                "feedback": ev.get("feedback", ""),
                "strengths": strengths,
                "weaknesses": weaknesses,
            },
        })

    overall = round(sum(scores) / len(scores) * 10) if scores else 0
    overall = min(100, max(0, overall))

    avg = lambda lst: round(sum(lst) / len(lst) * 10) if lst else overall

    integrity_events = session.get("integrityEvents", [])
    integrity_summary = (
        "All proctoring checks maintained throughout the interview."
        if not integrity_events
        else f"{len(integrity_events)} monitoring events detected during the interview."
    )

    if overall >= 80:
        verdict = "Strong Technical Performance"
        recommendation = "Recommended for next round"
    elif overall >= 60:
        verdict = "Satisfactory Technical Performance"
        recommendation = "Consider further evaluation"
    else:
        verdict = "Needs Improvement"
        recommendation = "Further technical practice recommended"

    if all_strengths:
        unique_strengths = list(dict.fromkeys(all_strengths))[:5]
    else:
        unique_strengths = ["Demonstrated solid understanding of core concepts"]

    if all_weaknesses:
        unique_weaknesses = list(dict.fromkeys(all_weaknesses))[:5]
    else:
        unique_weaknesses = ["Explore deeper edge cases and trade-offs"]

    return {
        "overall_score": overall,
        "verdict": verdict,
        "categories": {
            "technical_knowledge": min(100, avg(tech_scores)),
            "problem_solving": min(100, avg(ps_scores)),
            "communication": min(100, avg(comm_scores)),
            "depth_of_understanding": min(100, avg(depth_scores)),
            "resume_knowledge": min(100, avg(rel_scores)),
            "adaptability": overall,
        },
        "topics_covered": list({q.get("topic", "General") for q in questions if q.get("topic")}),
        "strengths": unique_strengths,
        "improvements": unique_weaknesses,
        "question_performance": q_perf,
        "summary": f"The candidate answered {len(answers)} of {len(questions)} questions with an average score of {overall}/100.",
        "integrity_summary": integrity_summary,
        "recommendation": recommendation,
    }
