import json
import os
import time
import random
import requests
import re
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
            repaired = repair_json_string(raw_text)
            return json.loads(repaired)
        except json.JSONDecodeError:
            return {}


def build_resume_context(candidate_profile, resume_text):
    skills = candidate_profile.get("skills", [])
    projects = candidate_profile.get("projects", [])
    experience = candidate_profile.get("experience", [])
    education = candidate_profile.get("education", [])
    target_role = candidate_profile.get("targetRole", "Software Engineer")

    context = f"Candidate Target Role: {target_role}\n"
    if skills:
        context += f"Skills: {', '.join(skills)}\n"
    if projects:
        context += f"Projects:\n"
        for p in projects[:3]:
            context += f"- {p.get('title', 'Project')}: {p.get('description', '')}\n"
    if experience:
        context += f"Experience:\n"
        for e in experience[:2]:
            context += f"- {e.get('role', 'Role')} at {e.get('company', 'Company')}: {e.get('description', '')}\n"
    if education:
        context += f"Education: {education[0].get('degree', '')} from {education[0].get('institution', '')}\n"
    if resume_text:
        snippet = resume_text[:3000]
        context += f"Resume Excerpt:\n{snippet}\n"
    return context


def generate_first_question(candidate_profile, resume_text, previous_answers=None, questions=None):
    if not API_KEY:
        return generate_fallback_question(1, candidate_profile, [])

    context = build_resume_context(candidate_profile, resume_text)
    answer_history = ""
    asked_topics = []
    if previous_answers:
        answer_history = "\nPrevious questions and answers:\n"
        for i, ans in enumerate(previous_answers[-3:], 1):
            q_text = ans.get("question", "")
            answer_history += f"Q{i}: {q_text}\nA{i}: {ans.get('transcript', '')[:500]}\n"
            if questions:
                prev_q = next((q for q in questions if q.get("id") == ans.get("questionId")), {})
                if prev_q.get("topic"):
                    asked_topics.append(prev_q.get("topic"))

    question_number = len(previous_answers) + 1 if previous_answers else 1

    random_seed = hash(f"{question_number}{time.time()}{random.random()}") % 10000

    prompt = f"""You are an expert technical interviewer conducting a 20-minute adaptive technical interview with EXACTLY 7 questions.
Generate question #{question_number} based on the candidate's resume and previous answers.

Resume Context:
{context}
{answer_history}

Rules:
- Ask ONE question at a time.
- Make it personalized based on resume content.
- Cover technical depth: resume-specific, DSA, system design, databases, OS, networks, or OOP as appropriate.
- Question {question_number} should be {"foundational" if question_number <= 2 else "follow-up based on previous answers" if question_number <= 4 else "advanced/deeper technical" if question_number <= 6 else "final comprehensive"}.
- Do NOT repeat previously asked topics unless drilling deeper.
- IMPORTANT: Generate a UNIQUE question. Do not reuse the same question text.
- Random seed for variation: {random_seed}
- Output STRICT JSON only, no markdown, no code blocks.

Output format:
{{
  "question": "The interview question text...",
  "topic": "Topic name",
  "difficulty": "Easy|Medium|Hard",
  "questionType": "resume|dsa|system-design|concept|project",
  "ttsText": "A natural spoken version of the question for text-to-speech"
}}"""

    models = [
        "meta-llama/llama-3.3-70b-instruct",
        "google/gemini-2.5-flash",
        "qwen/qwen-2.5-coder-32b-instruct",
    ]

    for model in models:
        try:
            url, headers, payload = build_openrouter_request(model, prompt)
            res = requests.post(url, headers=headers, json=payload, timeout=15)
            if res.status_code == 200:
                data = res.json()
                raw_text = extract_content(data)
                parsed = safe_json_parse(raw_text)
                if parsed and "question" in parsed:
                    parsed["id"] = f"q{question_number}"
                    return parsed
        except Exception:
            continue

    return generate_fallback_question(question_number, candidate_profile, asked_topics)


def evaluate_answer(question_text, transcript, candidate_profile, resume_text):
    if not API_KEY:
        return {
            "score": 6,
            "technical_correctness": 6,
            "depth": 6,
            "communication": 6,
            "relevance": 6,
            "feedback": "Answer recorded and under review.",
            "strengths": ["Candidate provided a response"],
            "weaknesses": ["Further evaluation pending"],
        }

    context = build_resume_context(candidate_profile, resume_text)
    prompt = f"""You are an expert technical interviewer evaluating a candidate's verbal answer.
Question: {question_text}
Candidate Answer (transcript): {transcript}

Resume Context:
{context}

Evaluate the answer on these exact metrics (1-10 each):
- technical_correctness
- depth_of_understanding
- communication_clarity
- relevance
- problem_solving

Also provide:
- feedback: 1-2 sentences of concise professional feedback
- strengths: array of 2-3 specific strengths from the answer
- weaknesses: array of 2-3 specific areas for improvement

Output STRICT JSON only:
{{
  "score": 8,
  "technical_correctness": 8,
  "depth": 7,
  "communication": 8,
  "relevance": 8,
  "problem_solving": 7,
  "feedback": "...",
  "strengths": ["..."],
  "weaknesses": ["..."]
}}"""

    models = ["meta-llama/llama-3.3-70b-instruct", "google/gemini-2.5-flash"]
    for model in models:
        try:
            url, headers, payload = build_openrouter_request(model, prompt)
            res = requests.post(url, headers=headers, json=payload, timeout=15)
            if res.status_code == 200:
                data = res.json()
                raw_text = extract_content(data)
                parsed = safe_json_parse(raw_text)
                if parsed and "score" in parsed:
                    return parsed
        except Exception:
            continue

    return {
        "score": 6,
        "technical_correctness": 6,
        "depth": 6,
        "communication": 6,
        "relevance": 6,
        "problem_solving": 6,
        "feedback": "Answer recorded and under review.",
        "strengths": ["Candidate provided a response"],
        "weaknesses": ["Further evaluation pending"],
    }


def generate_final_report(session):
    if not API_KEY:
        return generate_fallback_report(session)

    answers = session.get("answers", [])
    questions = session.get("questions", [])
    profile = session.get("candidateProfile", {})

    qa_pairs = []
    for ans in answers:
        q_text = next((q.get("question", "") for q in questions if q.get("id") == ans.get("questionId")), "Unknown question")
        qa_pairs.append({
            "question": q_text,
            "transcript": ans.get("transcript", "")[:1000],
            "evaluation": ans.get("evaluation", {}),
        })

    scores = [ans.get("evaluation", {}).get("score", 0) for ans in answers]
    overall = round(sum(scores) / len(scores)) if scores else 0

    prompt = f"""You are an expert technical interviewer generating a final performance report.
Generate a structured JSON report for this candidate interview session.

Overall Score: {overall}/100
Total Questions Answered: {len(qa_pairs)}
Candidate Role: {session.get('targetRole', 'Software Engineer')}

Q&A Pairs:
{json.dumps(qa_pairs, indent=2)}

Output STRICT JSON only, no markdown, no code blocks:
{{
  "overall_score": {overall},
  "verdict": "Strong Technical Performance",
  "categories": {{
    "technical_knowledge": 82,
    "problem_solving": 86,
    "communication": 78,
    "depth_of_understanding": 80,
    "resume_knowledge": 88,
    "adaptability": 84
  }},
  "topics_covered": ["JavaScript", "React", "APIs", "Databases", "System Design"],
  "strengths": ["Strong understanding of...", "Good knowledge of..."],
  "improvements": ["Improve...", "Go deeper into..."],
  "question_performance": [
    {{"topic": "Project Architecture", "score": 8.5}},
    {{"topic": "React Performance", "score": 9.0}}
  ],
  "summary": "Overall, the candidate demonstrated strong practical knowledge...",
  "integrity_summary": "All proctoring checks maintained throughout the interview.",
  "recommendation": "Recommended for next round"
}}"""

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
            "max_tokens": 2000,
        }
        res = requests.post(url, headers=headers, json=payload, timeout=20)
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
            return parsed
    except Exception as e:
        print(f"[Report Generator] Error: {e}")

    return generate_fallback_report(session)


def generate_fallback_report(session):
    answers = session.get("answers", [])
    questions = session.get("questions", [])

    total = len(answers)
    if total == 0:
        overall = 0
    else:
        scores = []
        for ans in answers:
            ev = ans.get("evaluation", {})
            scores.append(ev.get("score", 5))
        overall = round(sum(scores) / len(scores)) if scores else 0

    q_perf = []
    for ans in answers:
        q = next((q for q in questions if q.get("id") == ans.get("questionId")), {})
        ev = ans.get("evaluation", {})
        q_perf.append({
            "topic": q.get("topic", "General"),
            "score": ev.get("score", 6),
            "question": q.get("question", ""),
            "transcript": ans.get("transcript", ""),
            "evaluation": ev,
        })

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

    return {
        "overall_score": overall,
        "verdict": verdict,
        "categories": {
            "technical_knowledge": min(100, overall + 3),
            "problem_solving": min(100, overall + 5),
            "communication": min(100, overall - 2),
            "depth_of_understanding": min(100, overall + 1),
            "resume_knowledge": min(100, overall + 6),
            "adaptability": min(100, overall + 2),
        },
        "topics_covered": list({q.get("topic", "General") for q in questions}),
        "strengths": [
            "Demonstrated solid understanding of core concepts",
            "Provided clear and structured answers",
        ],
        "improvements": [
            "Explore deeper edge cases and trade-offs",
            "Strengthen communication on complex topics",
        ],
        "question_performance": q_perf,
        "summary": f"The candidate answered {total} questions with an average score of {overall}/10.",
        "integrity_summary": integrity_summary,
        "recommendation": recommendation,
    }


def build_openrouter_request(model, prompt):
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://vireza.com",
        "X-Title": "VIREZA AI Interview",
    }
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.3,
        "max_tokens": 1000,
    }
    return url, headers, payload


def extract_content(data):
    if "choices" in data and len(data["choices"]) > 0:
        return data["choices"][0]["message"]["content"]
    elif "candidates" in data and len(data["candidates"]) > 0:
        return data["candidates"][0]["content"]["parts"][0]["text"]
    return "{}"


def generate_fallback_question(question_number, candidate_profile, asked_topics=None):
    skills = candidate_profile.get("skills", [])
    topic = skills[0] if skills else "programming"
    asked_topics = asked_topics or []

    difficulty_map = {1: "Easy", 2: "Easy", 3: "Medium", 4: "Medium", 5: "Medium", 6: "Hard", 7: "Hard"}
    difficulty = difficulty_map.get(question_number, "Medium")

    all_questions = [
        {
            "question": f"Can you explain the fundamental concepts of {topic} and how you have used them in your projects?",
            "topic": topic,
            "difficulty": "Easy",
            "questionType": "resume",
            "ttsText": f"Can you explain the fundamental concepts of {topic} and how you have used them in your projects?",
        },
        {
            "question": f"What are the key differences between different approaches in {topic}, and when would you choose one over the other?",
            "topic": topic,
            "difficulty": "Easy",
            "questionType": "concept",
            "ttsText": f"What are the key differences between different approaches in {topic}, and when would you choose one over the other?",
        },
        {
            "question": f"Describe how you would design a scalable system using {topic}. What are the main challenges?",
            "topic": "System Design",
            "difficulty": "Medium",
            "questionType": "system-design",
            "ttsText": f"Describe how you would design a scalable system using {topic}. What are the main challenges?",
        },
        {
            "question": "Can you explain the time and space complexity of your approach? How would you optimize it?",
            "topic": "Algorithms",
            "difficulty": "Medium",
            "questionType": "dsa",
            "ttsText": "Can you explain the time and space complexity of your approach? How would you optimize it?",
        },
        {
            "question": f"Tell me about a challenging technical problem you solved in a {topic} project. What was your approach?",
            "topic": "Problem Solving",
            "difficulty": "Medium",
            "questionType": "project",
            "ttsText": f"Tell me about a challenging technical problem you solved in a {topic} project. What was your approach?",
        },
        {
            "question": "How would you handle database optimization and indexing for a high-traffic application?",
            "topic": "Databases",
            "difficulty": "Hard",
            "questionType": "concept",
            "ttsText": "How would you handle database optimization and indexing for a high-traffic application?",
        },
        {
            "question": "Design a distributed caching system. What consistency issues might arise and how would you address them?",
            "topic": "System Design",
            "difficulty": "Hard",
            "questionType": "system-design",
            "ttsText": "Design a distributed caching system. What consistency issues might arise and how would you address them?",
        },
        {
            "question": f"How does {topic} handle concurrency and thread safety in a multi-threaded environment?",
            "topic": "Concurrency",
            "difficulty": "Hard",
            "questionType": "concept",
            "ttsText": f"How does {topic} handle concurrency and thread safety in a multi-threaded environment?",
        },
        {
            "question": "Explain the CAP theorem and how it applies to distributed database systems.",
            "topic": "Distributed Systems",
            "difficulty": "Hard",
            "questionType": "concept",
            "ttsText": "Explain the CAP theorem and how it applies to distributed database systems.",
        },
        {
            "question": f"What design patterns have you used in {topic}, and why did you choose them?",
            "topic": "Design Patterns",
            "difficulty": "Medium",
            "questionType": "concept",
            "ttsText": f"What design patterns have you used in {topic}, and why did you choose them?",
        },
    ]

    filtered = [q for q in all_questions if q["topic"] not in asked_topics]
    if not filtered:
        filtered = all_questions

    selected = filtered[question_number % len(filtered)]
    selected["id"] = f"q{question_number}"
    return selected
