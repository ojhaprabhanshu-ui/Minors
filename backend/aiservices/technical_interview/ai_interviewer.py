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
    """Safely cleans up newline and whitespace issues without dangerous regex."""
    raw_text = raw_text.replace('\r', '')
    raw_text = re.sub(r'\n+', ' ', raw_text)
    raw_text = re.sub(r'\s+', ' ', raw_text)
    return raw_text.strip()


def safe_json_parse(raw_text: str):
    """Robustly strips markdown fences and parses JSON safely."""
    raw_text = raw_text.strip()
    
    # Strip markdown code block fences if the AI included them
    if raw_text.startswith("```"):
        first_newline = raw_text.find("\n")
        if first_newline != -1:
            raw_text = raw_text[first_newline:].strip()
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3].strip()
            
    try:
        return json.loads(raw_text)
    except json.JSONDecodeError:
        try:
            repaired = repair_json_string(raw_text)
            return json.loads(repaired)
        except json.JSONDecodeError:
            return None


def normalize_string(text: str) -> str:
    """Normalizes string for similarity comparison."""
    if not text:
        return ""
    # Lowercase, remove punctuation, strip
    text = re.sub(r'[^\w\s]', '', text.lower())
    return ' '.join(text.split())


def is_duplicate_question(new_q: str, past_qs: list, threshold=0.65) -> bool:
    """
    Lightweight similarity check to prevent both exact duplicates and obvious paraphrasing.
    Uses Jaccard similarity of words.
    """
    norm_new = normalize_string(new_q)
    if not norm_new:
        return False
        
    words_new = set(norm_new.split())
    
    for past_q in past_qs:
        norm_p = normalize_string(past_q)
        if not norm_p:
            continue
            
        # Exact substring matches (e.g. one question is entirely contained in another)
        if norm_new in norm_p or norm_p in norm_new:
            return True
            
        # Word overlap (Jaccard Similarity)
        words_p = set(norm_p.split())
        if not words_p or not words_new:
            continue
            
        intersection = words_new.intersection(words_p)
        union = words_new.union(words_p)
        
        if len(union) == 0:
            continue
            
        similarity = len(intersection) / len(union)
        if similarity >= threshold:
            return True
            
    return False


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


def generate_first_question(candidate_profile, resume_text, previous_answers=None, questions=None, previous_attempt_questions=None):
    """
    Generates a unique AI interview question.
    Added `previous_attempt_questions` parameter to support Round 2 retries without breaking existing calls.
    """
    previous_answers = previous_answers or []
    questions = questions or []
    previous_attempt_questions = previous_attempt_questions or []
    
    question_number = len(previous_answers) + 1
    
    # Track all asked questions and topics across ALL attempts
    all_asked_questions = []
    all_asked_topics = set()
    
    # 1. Add questions from previous attempts
    past_attempt_history = ""
    if previous_attempt_questions:
        past_attempt_history = "\nQuestions Asked in PREVIOUS Attempts (DO NOT REPEAT):\n"
        for i, q in enumerate(previous_attempt_questions, 1):
            q_text = q.get("question", "")
            if q_text:
                all_asked_questions.append(q_text)
                past_attempt_history += f"- {q_text}\n"
            if q.get("topic"):
                all_asked_topics.add(q.get("topic"))

    # 2. Add questions from the current attempt
    current_answer_history = ""
    if previous_answers:
        current_answer_history = "\nCurrent Attempt Q&A History:\n"
        for i, ans in enumerate(previous_answers, 1):
            q_text = ans.get("question", "")
            if q_text:
                all_asked_questions.append(q_text)
                current_answer_history += f"Q{i}: {q_text}\nCandidate A{i}: {ans.get('transcript', '')[:500]}\n"
            
    # Add topics from current attempt's `questions` array
    for q in questions:
        if q.get("topic"):
            all_asked_topics.add(q.get("topic"))

    # Logging Block
    print("="*50)
    print(f"ROUND 2 AI QUESTION GENERATION")
    print("="*50)
    print(f"Attempt: {'1' if not previous_attempt_questions else '2+'}")
    print(f"Question Number: {question_number} / 7")
    print(f"Total Previous Questions in History: {len(all_asked_questions)}")
    print(f"Topics Already Covered: {list(all_asked_topics)}")
    print("="*50)

    if not API_KEY:
        print("[WARNING] No API key found. Using fallback.")
        return generate_fallback_question(question_number, candidate_profile, list(all_asked_topics), all_asked_questions)

    context = build_resume_context(candidate_profile, resume_text)
    random_seed = hash(f"{question_number}{time.time()}{random.random()}") % 10000

    # Determine progression phase
    if question_number <= 2:
        phase = "foundational concepts"
    elif question_number <= 4:
        phase = "follow-up based on candidate's previous answers or project specifics"
    elif question_number <= 6:
        phase = "advanced, deep technical edge cases"
    else:
        phase = "final comprehensive architecture or system design wrap-up"

    prompt = f"""You are an expert technical interviewer conducting a 20-minute adaptive technical interview.
The interview must contain EXACTLY 7 questions. You are generating question #{question_number}.

CANDIDATE CONTEXT:
{context}
{past_attempt_history}
{current_answer_history}

Topics Already Covered Across All Attempts: {', '.join(all_asked_topics) if all_asked_topics else 'None'}

IMPORTANT INSTRUCTIONS:
- Generate ONE highly relevant question based on the candidate's resume and target role.
- Stage: This question should test {phase}.
- UNIQUENESS GUARANTEE: You MUST NOT repeat any question from the "Previous Attempts" or "Current Attempt" lists.
- Do NOT use different wording to ask the exact same scenario. Genuinely change the subject, constraints, or sub-skill being tested.
- If the candidate performed poorly in a previous answer, drill down into that topic but with a genuinely NEW technical angle.
- Random variation seed: {random_seed}

Output format must be STRICT JSON only, no markdown, no code block backticks.
{{
  "question": "The newly generated, unique interview question...",
  "topic": "Topic Name (e.g., React, MongoDB, System Design)",
  "difficulty": "Easy|Medium|Hard",
  "questionType": "resume|dsa|system-design|concept|project",
  "ttsText": "A natural spoken version of the question for text-to-speech engine"
}}"""

    models = [
        "meta-llama/llama-3.3-70b-instruct",
        "google/gemini-2.5-flash",
        "qwen/qwen-2.5-coder-32b-instruct",
    ]

    max_retries = 3
    
    for attempt in range(max_retries):
        for model in models:
            print(f"[AI GENERATION] Trying model: {model} (Retry Loop {attempt+1}/{max_retries})")
            try:
                url, headers, payload = build_openrouter_request(model, prompt)
                res = requests.post(url, headers=headers, json=payload, timeout=15)
                
                if res.status_code == 200:
                    data = res.json()
                    raw_text = extract_content(data)
                    parsed = safe_json_parse(raw_text)
                    
                    if parsed and "question" in parsed:
                        new_question_text = parsed["question"]
                        
                        # Backend DUPLICATE PROTECTION Check
                        if is_duplicate_question(new_question_text, all_asked_questions):
                            print(f"[AI DUPLICATE DETECTED] Generated question was too similar to previous question.")
                            print(f"Rejected: {new_question_text}")
                            continue # Try next model or next retry loop
                            
                        parsed["id"] = f"q{question_number}"
                        print(f"[AI SUCCESS] Model: {model}")
                        print(f"Question: {parsed['question']}")
                        print(f"Topic: {parsed.get('topic')}")
                        print(f"Difficulty: {parsed.get('difficulty')}")
                        return parsed
            except Exception as e:
                print(f"[AI ERROR] Model {model} failed: {e}")
                continue

    print("[WARNING] AI generation failed or repeatedly generated duplicates after all retries.")
    print("Using fallback question.")
    return generate_fallback_question(question_number, candidate_profile, list(all_asked_topics), all_asked_questions)


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

Output STRICT JSON only, without markdown code fences:
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
Use the actual candidate evaluations to calculate the categories mathematically.

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
            raw_text = extract_content(data)
            parsed = safe_json_parse(raw_text)
            if parsed:
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
        "temperature": 0.4, # Slightly increased to encourage diversity
        "max_tokens": 1000,
    }
    return url, headers, payload


def extract_content(data):
    if "choices" in data and len(data["choices"]) > 0:
        return data["choices"][0]["message"]["content"]
    elif "candidates" in data and len(data["candidates"]) > 0:
        return data["candidates"][0]["content"]["parts"][0]["text"]
    return "{}"


def generate_fallback_question(question_number, candidate_profile, asked_topics=None, all_asked_questions=None):
    skills = candidate_profile.get("skills", [])
    topic = skills[0] if skills else "programming"
    asked_topics = asked_topics or []
    all_asked_questions = all_asked_questions or []

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

    # Filter out topics AND specific duplicate question strings
    filtered = []
    for q in all_questions:
        if q["topic"] not in asked_topics and not is_duplicate_question(q["question"], all_asked_questions):
            filtered.append(q)
            
    if not filtered:
        # If all are exhausted, fallback to taking anything that isn't an exact duplicate
        filtered = [q for q in all_questions if not is_duplicate_question(q["question"], all_asked_questions)]
        if not filtered:
            filtered = all_questions # Absolute worst case, just pick one

    selected = filtered[question_number % len(filtered)]
    selected["id"] = f"q{question_number}"
    return selected