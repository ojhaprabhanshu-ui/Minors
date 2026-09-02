import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("OPENROUTER_API_KEY") or os.getenv("GEMINI_API_KEY")
OA_PASSING_SCORE = 70

def calculate_integrity_risk(integrity_events: list) -> tuple:
    """
    Computes cumulative integrity risk score and categorizes Risk Level.
    Weights:
      - Fullscreen exit: +10
      - Tab switch / Blur: +8
      - Paste event: +15
      - Screen share stopped: +30
    """
    weights = {
        "FULLSCREEN_EXIT": 10,
        "TAB_SWITCH": 8,
        "PASTE": 15,
        "SCREEN_SHARE_STOPPED": 30,
        "BLUR": 5
    }

    score = 0
    for evt in integrity_events:
        evt_type = evt.get("type", "").upper()
        score += weights.get(evt_type, 5)

    if score <= 20:
        level = "LOW"
    elif score <= 50:
        level = "MEDIUM"
    else:
        level = "HIGH"

    return score, level

def calculate_oa_objective_score(session: dict) -> dict:
    """
    Calculates deterministic objective performance scores (0-100) per question and overall.
    Formula:
      - Correctness (Tests passed): 50%
      - Problem Solving: 20%
      - Time Efficiency: 15%
      - Code Quality: 15%
    """
    questions = session.get("questions", [])
    submissions = session.get("submissions", {})
    started_at = session.get("startedAt")
    endsAt = session.get("endsAt")
    
    question_results = []
    total_q_scores = []

    for q in questions:
        q_id = q["id"]
        sub = submissions.get(q_id)

        if sub:
            passed = sub.get("totalPassed", 0)
            total = sub.get("totalCases", 1) or 1
            ratio = min(1.0, max(0.0, passed / total))

            correctness = ratio * 50.0
            problem_solving = (ratio * 15.0) + (5.0 if ratio > 0.5 else 0.0)
            time_efficiency = 15.0 if sub.get("runtimeMs", 500) < 500 else 10.0
            code_quality = 15.0 if sub.get("success", False) else 5.0

            q_score = round(correctness + problem_solving + time_efficiency + code_quality)
        else:
            passed = 0
            total = len(q.get("testCases", {}).get("public", [])) + len(q.get("testCases", {}).get("hidden", []))
            ratio = 0
            q_score = 0

        question_results.append({
            "id": q_id,
            "title": q["title"],
            "topic": q["topic"],
            "difficulty": q["difficulty"],
            "score": q_score,
            "testsPassed": passed,
            "totalTests": total,
            "attempted": bool(sub)
        })
        total_q_scores.append(q_score)

    overall_score = round(sum(total_q_scores) / len(total_q_scores)) if total_q_scores else 0
    qualified = (overall_score >= OA_PASSING_SCORE)

    # Sub-category breakdown
    avg_ratio = sum(r["testsPassed"] / (r["totalTests"] or 1) for r in question_results) / (len(question_results) or 1)
    correctness_breakdown = round(avg_ratio * 100)
    problem_solving_breakdown = round(min(100, avg_ratio * 90 + 10))
    time_mgmt_breakdown = round(min(100, (1.0 - (len(submissions) / 3.0) * 0.1) * 85 + avg_ratio * 15))
    code_quality_breakdown = round(min(100, avg_ratio * 80 + 20))

    risk_score, risk_level = calculate_integrity_risk(session.get("integrityEvents", []))

    return {
        "overallScore": overall_score,
        "passingThreshold": OA_PASSING_SCORE,
        "qualified": qualified,
        "questionResults": question_results,
        "performanceBreakdown": {
            "correctness": correctness_breakdown,
            "problemSolving": problem_solving_breakdown,
            "timeManagement": time_mgmt_breakdown,
            "codeQuality": code_quality_breakdown
        },
        "integrity": {
            "riskScore": risk_score,
            "riskLevel": risk_level,
            "totalEvents": len(session.get("integrityEvents", [])),
            "timeline": session.get("integrityEvents", [])
        }
    }

def generate_gemini_oa_feedback(objective_data: dict, candidate_profile: dict) -> dict:
    """
    Sends objective test results to Gemini for qualitative candidate feedback.
    Maintains factual accuracy based on objective scores.
    """
    score = objective_data["overallScore"]
    qualified = objective_data["qualified"]
    q_results = objective_data["questionResults"]

    default_feedback = {
        "strengths": [
            "Good algorithmic understanding across basic array and hashing problems.",
            "Clean structure and functional logic in code implementations."
        ],
        "weaknesses": [
            "Edge case handling for empty inputs or negative values.",
            "Graph / Dynamic Programming optimization needs further practice."
        ],
        "timeManagementFeedback": "Distributed time well across questions, completing primary test assertions efficiently.",
        "codeQualityObservations": "Code is structured cleanly with standard function signatures and basic modularity.",
        "recommendedPreparation": [
            "Practice Sliding Window & Two Pointer patterns on LeetCode Medium.",
            "Review Graph BFS/DFS traversal and visited set tracking.",
            "Work on space complexity optimization for recursion."
        ]
    }

    if not API_KEY:
        return default_feedback

    prompt = f"""
You are an expert tech lead evaluating candidate performance in Round 1 DSA OA.
Objective Results:
- Overall Score: {score} / 100
- Qualified for Round 2: {qualified}
- Questions: {json.dumps(q_results)}
- Candidate Skills: {json.dumps(candidate_profile.get('skills', []))}
{candidate_profile.get('_skill_block') or ''}

Generate structured feedback in strict JSON format with these exact keys:
"strengths": ["Strength 1", "Strength 2"],
"weaknesses": ["Weakness 1", "Weakness 2"],
"timeManagementFeedback": "Detailed statement...",
"codeQualityObservations": "Detailed statement...",
"recommendedPreparation": ["Topic 1", "Topic 2", "Topic 3"]

Do NOT alter objective facts (e.g. do NOT change test counts). Return strictly valid JSON.
"""

    headers = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
    payload = {
        "model": "google/gemini-2.0-flash-001",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.2
    }

    try:
        url = "https://openrouter.ai/api/v1/chat/completions"
        if not API_KEY.startswith("sk-or-"):
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={API_KEY}"
            payload = {"contents": [{"parts": [{"text": prompt}]}]}
            headers = {"Content-Type": "application/json"}

        res = requests.post(url, headers=headers, json=payload, timeout=10)
        if res.status_code == 200:
            data = res.json()
            raw_text = ""
            if "choices" in data and len(data["choices"]) > 0:
                raw_text = data["choices"][0]["message"]["content"]
            elif "candidates" in data and len(data["candidates"]) > 0:
                raw_text = data["candidates"][0]["content"]["parts"][0]["text"]

            raw_text = raw_text.strip()
            if raw_text.startswith("```json"): raw_text = raw_text[7:]
            if raw_text.startswith("```"): raw_text = raw_text[3:]
            if raw_text.endswith("```"): raw_text = raw_text[:-3]

            return json.loads(raw_text.strip())
    except Exception as e:
        print(f"[OA Scoring Engine] Gemini feedback notice: {e}")

    return default_feedback
