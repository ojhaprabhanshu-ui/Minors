import json
import os
import time
import random
import requests
import re
from dotenv import load_dotenv

# Reuse duplicate detection helpers from technical interview module
from technical_interview.ai_interviewer import (
    calculate_similarity,
    is_duplicate_question,
    build_previous_questions_context,
    extract_asked_topics,
    build_resume_context,
    safe_json_parse,
    build_openrouter_request,
    extract_content,
)

load_dotenv()
API_KEY = os.getenv("OPENROUTER_API_KEY") or os.getenv("GEMINI_API_KEY")


# ============================================================================
# PROMPTS
# ============================================================================

HR_TOPIC_BUCKETS = [
    "introduction",
    "career goals",
    "motivation",
    "resume experience",
    "project experience",
    "teamwork",
    "leadership",
    "conflict management",
    "failure and learning",
    "strengths and weaknesses",
    "adaptability",
    "pressure handling",
    "time management",
    "communication",
    "decision making",
    "problem solving",
    "work ethic",
    "role motivation",
    "career plans",
    "achievements",
]

# ============================================================================
# AI QUESTION GENERATION
# ============================================================================

def generate_hr_question(
    candidate_profile,
    resume_text,
    previous_questions=None,
    current_attempt_questions=None,
    previous_answer=None,
    previous_question_text=None,
):
    """
    Generate a fresh HR question that:
      - Is personalized from the candidate's resume
      - Is NOT semantically similar to previously asked questions
      - Avoids the same topic as the just-asked question (to keep conversation adaptive)
    Returns a dict: { question, topic, questionType, ttsText, id }
    """
    previous_questions = previous_questions or []
    current_attempt_questions = current_attempt_questions or []

    # Build the exclusion context
    excluded_questions_text = [q.get("text", q.get("question", "")) for q in previous_questions if q.get("text") or q.get("question")]
    excluded_questions_text += [q.get("question", "") for q in current_attempt_questions if q.get("question")]
    excluded_topics = set(extract_asked_topics(previous_questions) + extract_asked_topics(current_attempt_questions))

    # Pick a topic that hasn't been covered (or fallback to random)
    available_topics = [t for t in HR_TOPIC_BUCKETS if t.lower() not in {x.lower() for x in excluded_topics}]
    chosen_topic = random.choice(available_topics) if available_topics else random.choice(HR_TOPIC_BUCKETS)

    # Build answer context for adaptive follow-ups
    answer_context = ""
    if previous_answer and previous_question_text:
        answer_context = (
            f"\nThe previous question was: \"{previous_question_text}\"\n"
            f"The candidate answered: \"{previous_answer[:1200]}\"\n"
            "Generate a follow-up that probes deeper into the candidate's experience, "
            "or pivot to a meaningfully different HR topic if the previous answer is complete.\n"
        )

    if not API_KEY:
        return _fallback_question(chosen_topic, candidate_profile, excluded_questions_text)

    resume_context = build_resume_context(candidate_profile, resume_text)
    exclusion_block = build_previous_questions_context(previous_questions + current_attempt_questions)

    # Surface resume sections (e.g. projects, internships, leadership) so the AI
    # can explicitly anchor its question to real resume content.
    sections = candidate_profile.get("sections") or []
    sections_block = ""
    if sections:
        sections_block = "\nResume sections detected: " + ", ".join(sections) + "\n"

    skills = candidate_profile.get("skills", [])
    skills_block = ""
    if skills:
        skills_block = "Resume skills: " + ", ".join(skills[:15]) + "\n"

    experience_years = candidate_profile.get("experience_years", 0)
    experience_block = f"Experience: ~{experience_years} year(s)\n" if experience_years else ""

    random_seed = random.randint(1, 99999)

    prompt = f"""You are a professional HR interviewer conducting a 30-minute behavioral HR interview.

STEP 1 — ANALYZE THE RESUME
First, read the candidate's resume context below. Identify concrete, resume-grounded anchors:
- Specific skills / technologies
- Specific projects (name + what they did)
- Internships or work experience
- Leadership or teamwork experiences
- Achievements or certifications
{skills_block}{experience_block}{sections_block}

Full Resume Context:
{resume_context}

STEP 2 — GENERATE A RESUME-DRIVEN QUESTION
You MUST ground the question in something SPECIFIC from the candidate's resume.
- Do NOT ask a generic question that could be asked to any candidate.
- Reference a concrete skill, project, or experience from the resume (by name if possible).
- Example: instead of "tell me about a project", ask "You built <ProjectName> using <Tech>. Walk me through a specific challenge you faced while building it."
- Focus topic for this question: {chosen_topic}
{exclusion_block}
{answer_context}

CRITICAL RULES:
- Do NOT repeat, paraphrase, or reword any previously asked question.
- The question must be a GENUINELY new question — different angle, different framing.
- Make it personalized to the candidate's resume, skills, projects, internships, education, achievements.
- Keep the question conversational and HR-appropriate (behavioral / situational / motivation / career).
- Ask ONE question at a time.
- Do NOT include numbering, bullet points, or preamble.
- Do NOT use markdown. Output STRICT JSON only.

Output format:
{{
  "question": "The interview question text...",
  "topic": "{chosen_topic}",
  "questionType": "behavioral|situational|motivation|career|resume",
  "ttsText": "A natural spoken version of the question for text-to-speech"
}}

Random seed for variation: {random_seed}"""

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
                    parsed["id"] = f"hrq_{int(time.time() * 1000)}"
                    if "ttsText" not in parsed:
                        parsed["ttsText"] = parsed["question"]
                    if "topic" not in parsed:
                        parsed["topic"] = chosen_topic
                    if "questionType" not in parsed:
                        parsed["questionType"] = "behavioral"

                    # Reject duplicates
                    is_dup, _, score = is_duplicate_question(parsed["question"], previous_questions + current_attempt_questions, threshold=0.72)
                    if is_dup:
                        continue
                    return parsed
        except Exception:
            continue

    return _fallback_question(chosen_topic, candidate_profile, excluded_questions_text)


# ============================================================================
# AI ANSWER EVALUATION
# ============================================================================

def evaluate_hr_answer(question_text, transcript, candidate_profile, resume_text):
    """Evaluate candidate's HR answer and return structured scores."""
    if not API_KEY:
        return _fallback_evaluation(transcript)

    resume_context = build_resume_context(candidate_profile, resume_text)

    prompt = f"""You are a professional HR interviewer evaluating a candidate's behavioral answer.

Question: {question_text}
Candidate's spoken answer (transcript): {transcript}

Resume Context:
{resume_context}

Evaluate the answer (each metric 1-10):
- communication
- clarity
- confidence
- professionalism
- relevance
- self_awareness
- depth

Provide:
- feedback: 1-2 sentences of professional feedback
- strengths: array of 2-3 specific strengths
- weaknesses: array of 2-3 specific weaknesses
- resume_alignment: one of "consistent" | "unclear" | "inconsistent"
- resume_notes: short note if anything in the answer doesn't match the resume

Output STRICT JSON only (no markdown):
{{
  "score": 8,
  "communication": 8,
  "clarity": 8,
  "confidence": 8,
  "professionalism": 8,
  "relevance": 8,
  "self_awareness": 7,
  "depth": 7,
  "feedback": "...",
  "strengths": ["..."],
  "weaknesses": ["..."],
  "resume_alignment": "consistent",
  "resume_notes": ""
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

    return _fallback_evaluation(transcript)


# ============================================================================
# FALLBACKS
# ============================================================================

def _fallback_question(topic, candidate_profile, excluded_questions):
    skills = candidate_profile.get("skills", [])
    skill_text = skills[0] if skills else "your field"
    sections = candidate_profile.get("sections") or []
    section_text = ", ".join(sections) if sections else ""
    role = candidate_profile.get("targetRole", "role")

    bank = {
        "introduction": [
            f"Walk me through your journey so far and how it led you to apply for this {role}.",
            f"Tell me about a defining moment in your career that shaped how you work today.",
        ],
        "career goals": [
            f"Where do you see yourself three years from now, and how does this {role} fit into that plan?",
            f"What kind of growth are you looking for in the next role, and what does success look like to you?",
        ],
        "motivation": [
            f"What specifically attracted you to this {role} and our company?",
            f"Describe the moment you decided to pursue a career in {skill_text}.",
        ],
        "resume experience": [
            f"Looking at your resume, which experience do you feel has been most valuable and why?",
            f"Tell me about a project on your resume that you are most proud of contributing to.",
        ],
        "project experience": [
            f"Pick a project from your resume. What was your specific contribution, and what trade-offs did you make?",
            f"Which project on your resume taught you the most, and what did you learn?",
            f"You list {skill_text} as a key skill. Which project on your resume best demonstrates that skill, and what was the impact?",
        ],
        "teamwork": [
            f"Describe a time you had to collaborate with someone whose working style was very different from yours.",
            f"Tell me about a successful team outcome you contributed to. What was your role?",
        ],
        "leadership": [
            f"Give me an example of a time you stepped up to lead without being asked. What happened?",
            f"How do you usually motivate a team when morale is low?",
        ],
        "conflict management": [
            f"Tell me about a disagreement you had with a teammate. How was it resolved?",
            f"Describe a time you had to give tough feedback. How did the person react, and what was the outcome?",
        ],
        "failure and learning": [
            f"Share a meaningful failure. What did you take away from it, and how has it changed how you work?",
            f"What is a recent mistake you made, and what would you do differently today?",
        ],
        "strengths and weaknesses": [
            f"What do you consider your strongest professional strength, and how has it helped you recently?",
            f"What is one area you are actively working to improve, and what steps are you taking?",
        ],
        "adaptability": [
            f"Tell me about a time you had to adapt quickly to a major change at work or school.",
            f"How do you handle situations where priorities shift in the middle of a project?",
        ],
        "pressure handling": [
            f"Describe a high-pressure situation you handled well. What did you do to stay effective?",
            f"Tell me about a time you had multiple competing deadlines. How did you decide what to focus on?",
        ],
        "time management": [
            f"How do you typically plan your week when juggling multiple responsibilities?",
            f"Tell me about a time you had to balance a heavy workload. What system did you use?",
        ],
        "communication": [
            f"Give me an example of a complex idea you had to explain to a non-technical audience.",
            f"How do you tailor your communication when working with different stakeholders?",
        ],
        "decision making": [
            f"Walk me through a difficult decision you made recently. How did you approach it?",
            f"How do you weigh risks versus rewards when making decisions under uncertainty?",
        ],
        "problem solving": [
            f"Tell me about a particularly tricky problem you solved. What made it hard, and how did you crack it?",
            f"Describe a time you had to think outside the box to get something done.",
        ],
        "work ethic": [
            f"What does being reliable at work mean to you, and how do you demonstrate it?",
            f"How do you hold yourself accountable when no one is watching?",
        ],
        "role motivation": [
            f"Why this company, and why now?",
            f"Tell me about an aspect of this role that excites you the most.",
        ],
        "career plans": [
            f"Where do you want your career to be in five years?",
            f"What kind of work environment helps you do your best work?",
        ],
        "achievements": [
            f"Tell me about an achievement you are genuinely proud of.",
            f"What is the most impactful thing you have contributed to so far?",
        ],
    }

    candidates = bank.get(topic, bank["motivation"])
    random.shuffle(candidates)
    for q in candidates:
        is_dup, _, _ = is_duplicate_question(q, [{"question": x} for x in excluded_questions], threshold=0.75)
        if not is_dup:
            return {
                "id": f"hrq_{int(time.time() * 1000)}",
                "question": q,
                "topic": topic,
                "questionType": "behavioral",
                "ttsText": q,
            }

    # last resort
    q = candidates[0]
    return {
        "id": f"hrq_{int(time.time() * 1000)}",
        "question": q,
        "topic": topic,
        "questionType": "behavioral",
        "ttsText": q,
    }


def _fallback_evaluation(transcript):
    word_count = len((transcript or "").split())
    if word_count < 15:
        score = 4
    elif word_count < 50:
        score = 6
    else:
        score = 7
    return {
        "score": score,
        "communication": score,
        "clarity": score,
        "confidence": score,
        "professionalism": score,
        "relevance": score,
        "self_awareness": max(4, score - 1),
        "depth": max(4, score - 1),
        "feedback": "Answer recorded and evaluated.",
        "strengths": ["Provided a spoken response to the question"],
        "weaknesses": ["Could expand with more specific examples"],
        "resume_alignment": "consistent",
        "resume_notes": "",
    }
