import json
import os
import time
import random
import requests
import re

from dotenv import load_dotenv



from .question_bank import (
    get_resume_question,
    get_fallback_question
)

from .skill_detector import detect_skills


load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")


# =========================================================
# JSON HELPERS
# =========================================================

def repair_json_string(raw_text: str) -> str:
    raw_text = re.sub(
        r"```json",
        "",
        raw_text,
        flags=re.IGNORECASE
    )
    raw_text = re.sub(
        r"```",
        "",
        raw_text
    )
    raw_text = re.sub(
        r"\n+",
        " ",
        raw_text
    )
    raw_text = re.sub(
        r"\s+",
        " ",
        raw_text
    )
    return raw_text.strip()


def safe_json_parse(raw_text: str):
    if not raw_text:
        return {}

    try:
        return json.loads(raw_text)
    except json.JSONDecodeError:
        try:
            repaired = repair_json_string(raw_text)
            return json.loads(repaired)
        except json.JSONDecodeError:
            return {}


# =========================================================
# RESUME CONTEXT
# =========================================================

def build_resume_context(candidate_profile, resume_text):

    candidate_profile = candidate_profile or {}

    skills = candidate_profile.get("skills", [])
    projects = candidate_profile.get("projects", [])
    experience = candidate_profile.get("experience", [])
    education = candidate_profile.get("education", [])

    target_role = candidate_profile.get(
        "targetRole",
        "Software Engineer"
    )

    context = f"Candidate Target Role: {target_role}\n"

    if skills:
        context += f"Skills: {', '.join(map(str, skills))}\n"

    if projects:
        context += "Projects:\n"

        for p in projects[:3]:
            context += (
                f"- {p.get('title', 'Project')}: "
                f"{p.get('description', '')}\n"
            )

    if experience:
        context += "Experience:\n"

        for e in experience[:2]:
            context += (
                f"- {e.get('role', 'Role')} at "
                f"{e.get('company', 'Company')}: "
                f"{e.get('description', '')}\n"
            )

    if education:
        context += (
            f"Education: "
            f"{education[0].get('degree', '')} from "
            f"{education[0].get('institution', '')}\n"
        )

    if resume_text:
        context += (
            "Resume Excerpt:\n"
            f"{resume_text[:5000]}\n"
        )

    return context


# =========================================================
# AI PROVIDER REQUEST
# =========================================================

def call_ai_provider(provider, prompt):

    if provider == "groq":

        url = "https://api.groq.com/openai/v1/chat/completions"

        api_key = GROQ_API_KEY

        model = "openai/gpt-oss-20b"

    elif provider == "mistral":

        url = "https://api.mistral.ai/v1/chat/completions"

        api_key = MISTRAL_API_KEY

        model = "mistral-small-latest"

    else:

        return ""

    if not api_key:

        print(
            f"[AI Interview] "
            f"{provider.upper()} API key missing."
        )

        return ""

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": model,
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": 0.7,
        "max_tokens": 150,
    }

    try:

        print(
            f"[AI Interview] "
            f"Calling {provider.upper()}..."
        )

        response = requests.post(
            url,
            headers=headers,
            json=payload,
            timeout=15
        )

        print(
            f"[AI Interview] "
            f"{provider.upper()} status: "
            f"{response.status_code}"
        )

        if response.status_code != 200:

            print(
                f"[AI Interview] "
                f"{provider.upper()} error: "
                f"{response.text[:500]}"
            )

            return ""

        data = response.json()

        return extract_content(data)

    except Exception as e:

        print(
            f"[AI Interview] "
            f"{provider.upper()} failed: {e}"
        )

        return ""



# =========================================================
# EXTRACT MODEL CONTENT
# =========================================================

def extract_content(data):

    # OpenRouter / OpenAI-style response
    if (
        "choices" in data
        and len(data["choices"]) > 0
    ):
        return (
            data["choices"][0]
            .get("message", {})
            .get("content", "")
        )

    # Gemini-style response
    if (
        "candidates" in data
        and len(data["candidates"]) > 0
    ):
        try:
            return (
                data["candidates"][0]
                ["content"]
                ["parts"][0]
                ["text"]
            )
        except (KeyError, IndexError, TypeError):
            return ""

    return ""


# =========================================================
# AI QUESTION GENERATOR
#
# FLOW:
#
# Resume
#   ↓
# Resume context
#   ↓
# Gemini / OpenRouter
#   ↓
# AI-generated personalized question
#   ↓
# If API fails → fallback question bank
# =========================================================

def generate_first_question(
    candidate_profile,
    resume_text,
    previous_answers=None,
    questions=None
):
    candidate_profile = candidate_profile or {}
    previous_answers = previous_answers or []
    questions = questions or []

    question_number = len(questions) + 1

    # =====================================================
    # QUESTIONS ALREADY ASKED
    # =====================================================

    asked_questions = [
        q.get("question", "")
        for q in questions
        if q.get("question")
    ]

    # =====================================================
    # FULL RESUME
    #
    # IMPORTANT:
    # The AI receives the complete extracted resume.
    # Question bank is NOT used here.
    # =====================================================

    full_resume = (resume_text or "").strip()

    print("\n========== RESUME RECEIVED ==========")
    print(full_resume)
    print("=====================================\n")

    # =====================================================
    # PREVIOUS QUESTIONS + ANSWERS
    # =====================================================

    answer_history = ""

    if previous_answers:
        answer_history = (
            "\nPREVIOUS INTERVIEW QUESTIONS AND ANSWERS:\n"
        )

        for i, ans in enumerate(
            previous_answers[-5:],
            1
        ):
            q_text = ans.get(
                "question",
                ""
            )

            transcript = ans.get(
                "transcript",
                ""
            )

            answer_history += (
                f"\nQuestion {i}: {q_text}\n"
                f"Candidate Answer {i}: "
                f"{transcript[:1500]}\n"
            )

    # =====================================================
    # DIFFICULTY PROGRESSION
    # =====================================================

    if question_number <= 2:
        difficulty = "Easy to Medium"

    elif question_number <= 4:
        difficulty = "Medium"

    elif question_number <= 6:
        difficulty = "Medium to Hard"

    else:
        difficulty = "Hard"

    # =====================================================
    # AI PROMPT
    #
    # Resume → AI
    #
    # NO QUESTION BANK SELECTION HERE
    # =====================================================

    prompt = f"""
You are the technical interviewer for VIREZA.

You are conducting a technical interview with a candidate.

QUESTION NUMBER:
{question_number} of 7

TARGET DIFFICULTY:
{difficulty}

CANDIDATE'S FULL RESUME:
--------------------------------------------------
{full_resume}
--------------------------------------------------

{answer_history}

QUESTIONS ALREADY ASKED:
{json.dumps(asked_questions)}

IMPORTANT RULES:

1. Read the candidate's resume carefully.

2. Generate EXACTLY ONE technical interview question.

3. The question MUST be based on information explicitly
   present in the candidate's resume.

4. The question may be based on:
   - skills
   - technologies
   - programming languages
   - frameworks
   - databases
   - projects
   - work experience
   - internships
   - technical responsibilities
   - technical achievements
   - education-related technical subjects

5. NEVER invent a technology that is not present in the resume.

6. NEVER assume the candidate knows Python, Java, SQL,
   React, Node.js, Flask, Django, or any other technology
   unless that technology is actually supported by the resume.

7. If the resume contains a project, prefer asking about
   that project and the technologies used in it.

8. If the resume contains technical skills, ask about
   those actual skills.

9. For later questions, use the candidate's previous answer
   to create a meaningful follow-up when appropriate.

10. Gradually increase the difficulty.

11. NEVER repeat an already asked question.

12. Do not ask a generic programming question when the
    resume contains specific technical information.

13. Do not mention that you are an AI.

14. Do not provide the answer.

15. Return STRICT JSON only.

16. Do not use markdown.

17. Do not use a ```json code block.

OUTPUT FORMAT:

{{
    "question": "One technical interview question",
    "topic": "Actual skill, technology, or project from resume",
    "difficulty": "Easy|Medium|Hard",
    "questionType": "resume|concept|project|dsa|system-design",
    "ttsText": "Natural spoken version of the question"
}}
"""

    # =====================================================
    # AI PROVIDERS
    #
    # GROQ = PRIMARY
    # MISTRAL = BACKUP
    # QUESTION BANK = ONLY FINAL FALLBACK
    # =====================================================

    providers = [
        "groq",
        "mistral"
    ]

    for provider in providers:

        try:
            print(
                f"\n[AI Interview] "
                f"Trying provider: {provider.upper()}"
            )

            raw_text = call_ai_provider(
                provider,
                prompt
            )

            if not raw_text:
                print(
                    f"[AI Interview] "
                    f"{provider.upper()} returned no response."
                )
                continue

            # =================================================
            # PARSE AI RESPONSE
            # =================================================

            parsed = safe_json_parse(
                raw_text
            )

            if not parsed:
                print(
                    f"[AI Interview] "
                    f"{provider.upper()} returned invalid JSON."
                )
                continue

            # =================================================
            # GET QUESTION
            # =================================================

            question = str(
                parsed.get(
                    "question",
                    ""
                )
            ).strip()

            if not question:
                print(
                    f"[AI Interview] "
                    f"{provider.upper()} returned no question."
                )
                continue

            # =================================================
            # PREVENT DUPLICATE QUESTIONS
            # =================================================

            already_asked = {
                q.strip().lower()
                for q in asked_questions
            }

            if question.lower() in already_asked:

                print(
                    "[AI Interview] "
                    "AI returned a duplicate question."
                )

                continue

            # =================================================
            # BUILD FINAL QUESTION OBJECT
            # =================================================

            parsed["id"] = (
                f"q{question_number}"
            )

            parsed["question"] = question

            parsed.setdefault(
                "topic",
                "resume"
            )

            parsed.setdefault(
                "difficulty",
                "Medium"
            )

            parsed.setdefault(
                "questionType",
                "resume"
            )

            parsed.setdefault(
                "ttsText",
                question
            )

            print(
                f"[AI Interview] "
                f"{provider.upper()} generated question:"
            )

            print(
                parsed["question"]
            )

            return parsed

        except Exception as e:

            print(
                f"[AI Interview] "
                f"{provider.upper()} failed: {e}"
            )

            continue

    # =====================================================
    # BOTH AI PROVIDERS FAILED
    #
    # ONLY NOW USE QUESTION BANK
    # =====================================================

    print(
        "\n[AI Interview] "
        "Groq and Mistral both failed."
    )

    print(
        "[AI Interview] "
        "Using resume-based question bank fallback."
    )

    fallback = get_resume_question(
        resume_text=full_resume,
        difficulty="medium",
        asked_questions=asked_questions
    )

    fallback_question = fallback.get(
        "next_question",
        ""
    )

    # =====================================================
    # VALID RESUME-BASED FALLBACK FOUND
    # =====================================================

    if fallback_question:

        return {
            "id": f"q{question_number}",

            "question": fallback_question,

            "topic": fallback.get(
                "topic",
                "resume"
            ),

            "difficulty": fallback.get(
                "difficulty",
                "medium"
            ).capitalize(),

            "questionType": "resume",

            "ttsText": fallback_question
        }

    # =====================================================
    # NO RESUME-BASED FALLBACK AVAILABLE
    #
    # IMPORTANT:
    # Do NOT randomly ask Python.
    # =====================================================

    print(
        "[AI Interview] "
        "No suitable resume-based fallback question found."
    )

    fallback_question = (
        "Please explain one of the technical projects "
        "or technologies mentioned in your resume."
    )

    return {
        "id": f"q{question_number}",

        "question": fallback_question,

        "topic": "resume",

        "difficulty": difficulty,

        "questionType": "resume",

        "ttsText": fallback_question
    }

# =========================================================
# ANSWER EVALUATION
# =========================================================

def evaluate_answer(
    question_text,
    transcript,
    candidate_profile,
    resume_text
):

    transcript_clean = transcript.strip().lower()

    no_answer_phrases = [
        "i don't know",
        "i dont know",
        "don't know",
        "dont know",
        "no idea",
        "i have no idea",
        "not sure",
        "i am not sure",
        "i'm not sure",
        "skip",
        "pass"
    ]

    if not transcript_clean or any(
        phrase in transcript_clean
        for phrase in no_answer_phrases
    ):
        return {
            "score": 1,
            "technical_correctness": 1,
            "depth": 1,
            "communication": 3,
            "relevance": 1,
            "problem_solving": 1,
            "feedback": (
                "The candidate was unable to answer "
                "this question."
            ),
            "strengths": [],
            "weaknesses": [
                "Review the underlying concept.",
                "Practice explaining the topic."
            ]
        }

    context = build_resume_context(
        candidate_profile,
        resume_text
    )
    prompt = f"""
You are an expert technical interviewer.

Evaluate the candidate's answer.

QUESTION:
{question_text}

CANDIDATE ANSWER:
{transcript}

RESUME:
{context}

Evaluate from 1-10:

technical_correctness
depth
communication
relevance
problem_solving

Also provide:

feedback:
1-2 concise professional sentences.

strengths:
2-3 specific strengths.

weaknesses:
2-3 specific improvements.

Output STRICT JSON only.

{{
    "score": 8,
    "technical_correctness": 8,
    "depth": 7,
    "communication": 8,
    "relevance": 8,
    "problem_solving": 7,
    "feedback": "Good explanation...",
    "strengths": [
        "Clear understanding",
        "Correct terminology"
    ],
    "weaknesses": [
        "Could explain deeper",
        "Could mention edge cases"
    ]
}}
"""
        # =====================================================
    # AI EVALUATION PROVIDERS
    #
    # Groq = primary
    # Mistral = backup
    # Local fallback = final fallback
    # =====================================================

    providers = [
        "groq",
        "mistral",
    ]

    for provider in providers:

        try:

            print(
                f"[Evaluation] "
                f"Trying {provider.upper()}..."
            )

            raw_text = call_ai_provider(
                provider,
                prompt
            )

            if not raw_text:
                continue

            parsed = safe_json_parse(raw_text)

            if (
                parsed
                and "score" in parsed
            ):

                print(
                    f"[Evaluation] "
                    f"{provider.upper()} evaluation successful."
                )

                return parsed

        except Exception as e:

            print(
                f"[Evaluation] "
                f"{provider.upper()} failed: {e}"
            )

    # -----------------------------------------------------
    # Evaluation fallback
    # -----------------------------------------------------

    return {
        "score": 6,
        "technical_correctness": 6,
        "depth": 6,
        "communication": 6,
        "relevance": 6,
        "problem_solving": 6,
        "feedback": (
            "Answer recorded and under review."
        ),
        "strengths": [
            "Candidate provided a response"
        ],
        "weaknesses": [
            "Further evaluation pending"
        ],
    }


# =========================================================
# FINAL REPORT
# =========================================================

def generate_final_report(session):

    if not GROQ_API_KEY and not MISTRAL_API_KEY:
        return generate_fallback_report(session)

    answers = session.get(
        "answers",
        []
    )

    questions = session.get(
        "questions",
        []
    )

    qa_pairs = []

    for answer in answers:

        question_text = next(
            (
                q.get("question", "")
                for q in questions
                if q.get("id")
                == answer.get("questionId")
            ),
            "Unknown question"
        )

        qa_pairs.append({
            "question": question_text,
            "transcript": answer.get(
                "transcript",
                ""
            )[:1000],
            "evaluation": answer.get(
                "evaluation",
                {}
            ),
        })

    scores = [
        answer.get(
            "evaluation",
            {}
        ).get(
            "score",
            0
        )
        for answer in answers
    ]

    overall = (
        round(
            sum(scores) / len(scores)
        )
        if scores
        else 0
    )

    prompt = f"""
You are an expert technical interviewer.

Generate a final performance report.

Overall Score:
{overall}/10

Questions Answered:
{len(qa_pairs)}

Candidate Role:
{session.get(
    'targetRole',
    'Software Engineer'
)}

Q&A:
{json.dumps(
    qa_pairs,
    indent=2
)}

Output STRICT JSON only.

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
    "topics_covered": [],
    "strengths": [],
    "improvements": [],
    "question_performance": [],
    "summary": "Overall performance summary.",
    "integrity_summary":
        "All proctoring checks maintained throughout the interview.",
    "recommendation":
        "Recommended for next round"
}}
"""

        # =====================================================
    # AI REPORT PROVIDERS
    #
    # Groq = primary
    # Mistral = backup
    # Local fallback = final fallback
    # =====================================================

    for provider in ["groq", "mistral"]:

        try:

            print(
                f"[Report Generator] "
                f"Trying {provider.upper()}..."
            )

            raw_text = call_ai_provider(
                provider,
                prompt
            )

            if not raw_text:
                continue

            parsed = safe_json_parse(raw_text)

            if parsed:

                print(
                    f"[Report Generator] "
                    f"{provider.upper()} report generated."
                )

                return parsed

        except Exception as e:

            print(
                f"[Report Generator] "
                f"{provider.upper()} failed: {e}"
            )

    return generate_fallback_report(session)



# =========================================================
# FALLBACK REPORT
# =========================================================

def generate_fallback_report(session):

    answers = session.get(
        "answers",
        []
    )

    questions = session.get(
        "questions",
        []
    )

    total = len(answers)

    scores = [
        answer.get(
            "evaluation",
            {}
        ).get(
            "score",
            6
        )
        for answer in answers
    ]

    overall = (
        round(sum(scores) / len(scores))
        if scores
        else 0
    )

    question_performance = []

    for answer in answers:

        question = next(
            (
                q
                for q in questions
                if q.get("id")
                == answer.get("questionId")
            ),
            {}
        )

        evaluation = answer.get(
            "evaluation",
            {}
        )

        question_performance.append({
            "topic": question.get(
                "topic",
                "General"
            ),
            "score": evaluation.get(
                "score",
                6
            ),
            "question": question.get(
                "question",
                ""
            ),
            "transcript": answer.get(
                "transcript",
                ""
            ),
            "evaluation": evaluation,
        })

    integrity_events = session.get(
        "integrityEvents",
        []
    )

    if integrity_events:

        integrity_summary = (
            f"{len(integrity_events)} "
            "monitoring events detected "
            "during the interview."
        )

    else:

        integrity_summary = (
            "All proctoring checks maintained "
            "throughout the interview."
        )

    if overall >= 8:

        verdict = (
            "Strong Technical Performance"
        )

        recommendation = (
            "Recommended for next round"
        )

    elif overall >= 6:

        verdict = (
            "Satisfactory Technical Performance"
        )

        recommendation = (
            "Consider further evaluation"
        )

    else:

        verdict = "Needs Improvement"

        recommendation = (
            "Further technical practice "
            "recommended"
        )

    topics = list({
        q.get(
            "topic",
            "General"
        )
        for q in questions
    })

    return {
        "overall_score": overall,
        "verdict": verdict,

        "categories": {
            "technical_knowledge":
                min(100, overall * 10 + 3),

            "problem_solving":
                min(100, overall * 10 + 5),

            "communication":
                max(0, overall * 10 - 2),

            "depth_of_understanding":
                min(100, overall * 10 + 1),

            "resume_knowledge":
                min(100, overall * 10 + 6),

            "adaptability":
                min(100, overall * 10 + 2),
        },

        "topics_covered": topics,

        "strengths": [
            "Demonstrated understanding "
            "of core concepts",
            "Provided structured "
            "technical responses",
        ],

        "improvements": [
            "Explore deeper edge cases "
            "and trade-offs",
            "Strengthen communication "
            "on complex topics",
        ],

        "question_performance":
            question_performance,

        "summary": (
            f"The candidate answered "
            f"{total} questions with an "
            f"average score of "
            f"{overall}/10."
        ),

        "integrity_summary":
            integrity_summary,

        "recommendation":
            recommendation,
    }


# =========================================================
# END OF FILE
# =========================================================

