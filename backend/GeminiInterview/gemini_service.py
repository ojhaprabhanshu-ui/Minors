import os
import json
import re

from google import genai
from openai import OpenAI

from question_bank import get_resume_question


# =========================================================
# API CLIENTS
# =========================================================

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


gemini_client = None
openai_client = None


if GEMINI_API_KEY:
    gemini_client = genai.Client(
        api_key=GEMINI_API_KEY
    )


if OPENAI_API_KEY:
    openai_client = OpenAI(
        api_key=OPENAI_API_KEY
    )


# =========================================================
# GEMINI
# =========================================================

def generate_questions_gemini(resume_text):

    if gemini_client is None:
        raise Exception("GEMINI_API_KEY is not configured")

    prompt = f"""
You are a technical interviewer.

Analyze the following resume and generate exactly 5
technical interview questions.

IMPORTANT:
- Questions must be based ONLY on skills/projects mentioned
  in the resume.
- Cover different skills when possible.
- Do not ask questions about technologies not present in
  the resume.
- Return ONLY valid JSON.
- Do not use markdown.

Return this format:

{{
    "questions": [
        {{
            "question": "...",
            "topic": "...",
            "difficulty": "easy"
        }},
        {{
            "question": "...",
            "topic": "...",
            "difficulty": "medium"
        }}
    ]
}}

Resume:
{resume_text}
"""

    response = gemini_client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt
    )

    text = response.text.strip()

    return parse_questions(text)


# =========================================================
# OPENAI
# =========================================================

def generate_questions_openai(resume_text):

    if openai_client is None:
        raise Exception("OPENAI_API_KEY is not configured")

    prompt = f"""
You are a technical interviewer.

Analyze this resume and generate exactly 5 technical
interview questions.

Rules:
1. Questions must be based on skills/projects in the resume.
2. Cover different skills when possible.
3. Do not invent technologies.
4. Questions should test actual technical understanding.
5. Return ONLY valid JSON.

Format:

{{
    "questions": [
        {{
            "question": "...",
            "topic": "...",
            "difficulty": "easy"
        }}
    ]
}}

Resume:
{resume_text}
"""

    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": "You are an expert technical interviewer."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.7
    )

    text = response.choices[0].message.content.strip()

    return parse_questions(text)


# =========================================================
# JSON PARSER
# =========================================================

def parse_questions(text):

    # Remove markdown code fences if model adds them
    text = re.sub(
        r"```json\s*",
        "",
        text,
        flags=re.IGNORECASE
    )

    text = re.sub(
        r"```\s*",
        "",
        text
    )

    text = text.strip()

    try:

        data = json.loads(text)

        if isinstance(data, dict) and "questions" in data:

            questions = data["questions"]

            if isinstance(questions, list):
                return {
                    "questions": questions,
                    "source": "ai"
                }

    except json.JSONDecodeError:
        pass

    # Try to find JSON object inside response
    match = re.search(
        r'\{.*\}',
        text,
        re.DOTALL
    )

    if match:

        try:

            data = json.loads(match.group())

            if "questions" in data:

                return {
                    "questions": data["questions"],
                    "source": "ai"
                }

        except json.JSONDecodeError:
            pass

    raise Exception(
        "AI returned invalid JSON"
    )


# =========================================================
# QUESTION BANK FALLBACK
# =========================================================

def generate_questions_from_bank(resume_text):

    questions = []
    used_questions = set()

    # Try to generate 5 DIFFERENT questions
    for _ in range(30):

        if len(questions) >= 5:
            break

        result = get_resume_question(
            resume_text,
            difficulty="medium"
        )

        question = result["next_question"]

        # Prevent duplicates
        if question in used_questions:
            continue

        used_questions.add(question)

        questions.append({
            "question": question,
            "topic": result["topic"],
            "difficulty": result["difficulty"]
        })

    # Extremely unlikely safety fallback
    if not questions:

        result = get_resume_question(
            resume_text,
            difficulty="easy"
        )

        questions.append({
            "question": result["next_question"],
            "topic": result["topic"],
            "difficulty": result["difficulty"]
        })

    return {
        "questions": questions,
        "source": "question_bank"
    }


# =========================================================
# MAIN QUESTION GENERATOR
# =========================================================

def generate_questions(resume_text):

    # -----------------------------------------------------
    # 1. GEMINI
    # -----------------------------------------------------

    try:

        print("\n================================")
        print("Trying Gemini...")
        print("================================")

        result = generate_questions_gemini(
            resume_text
        )

        print("Gemini SUCCESS")

        return result

    except Exception as e:

        print("Gemini FAILED:")
        print(e)


    # -----------------------------------------------------
    # 2. OPENAI
    # -----------------------------------------------------

    try:

        print("\n================================")
        print("Trying OpenAI...")
        print("================================")

        result = generate_questions_openai(
            resume_text
        )

        print("OpenAI SUCCESS")

        return result

    except Exception as e:

        print("OpenAI FAILED:")
        print(e)


    # -----------------------------------------------------
    # 3. QUESTION BANK
    # -----------------------------------------------------

    print("\n================================")
    print("Using Question Bank fallback...")
    print("================================")

    result = generate_questions_from_bank(
        resume_text
    )

    return result


# =========================================================
# NEXT ADAPTIVE QUESTION
# =========================================================

def generate_next_question(
    resume_text,
    previous_question="",
    previous_answer="",
    topic="",
    difficulty="medium"
):

    # -----------------------------------------------------
    # Try Gemini
    # -----------------------------------------------------

    try:

        if gemini_client is None:
            raise Exception(
                "Gemini API not configured"
            )

        prompt = f"""
You are conducting a technical interview.

Resume:
{resume_text}

Previous question:
{previous_question}

Candidate's answer:
{previous_answer}

Current topic:
{topic}

Current difficulty:
{difficulty}

Generate ONE next technical interview question.

Rules:
- Base it on the resume.
- Consider the candidate's previous answer.
- If the answer was strong, increase difficulty.
- If the answer was weak, ask a simpler follow-up.
- Stay relevant to the topic.
- Return ONLY valid JSON.

Format:

{{
    "next_question": "...",
    "topic": "...",
    "difficulty": "easy"
}}
"""

        response = gemini_client.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt
        )

        text = response.text.strip()

        text = re.sub(
            r"```json\s*",
            "",
            text,
            flags=re.IGNORECASE
        )

        text = re.sub(
            r"```\s*",
            "",
            text
        )

        data = json.loads(text)

        return {
            "next_question": data["next_question"],
            "topic": data.get(
                "topic",
                topic
            ),
            "difficulty": data.get(
                "difficulty",
                difficulty
            ),
            "source": "gemini"
        }

    except Exception as e:

        print("Gemini next-question failed:")
        print(e)


    # -----------------------------------------------------
    # OpenAI fallback
    # -----------------------------------------------------

    try:

        if openai_client is None:
            raise Exception(
                "OpenAI API not configured"
            )

        prompt = f"""
You are conducting a technical interview.

Resume:
{resume_text}

Previous question:
{previous_question}

Candidate answer:
{previous_answer}

Topic:
{topic}

Difficulty:
{difficulty}

Generate ONE relevant follow-up question.

Return ONLY JSON:

{{
    "next_question": "...",
    "topic": "...",
    "difficulty": "easy"
}}
"""

        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a technical interviewer."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7
        )

        text = response.choices[0].message.content.strip()

        text = re.sub(
            r"```json\s*",
            "",
            text,
            flags=re.IGNORECASE
        )

        text = re.sub(
            r"```\s*",
            "",
            text
        )

        data = json.loads(text)

        return {
            "next_question": data["next_question"],
            "topic": data.get(
                "topic",
                topic
            ),
            "difficulty": data.get(
                "difficulty",
                difficulty
            ),
            "source": "openai"
        }

    except Exception as e:

        print("OpenAI next-question failed:")
        print(e)


    # -----------------------------------------------------
    # Question Bank fallback
    # -----------------------------------------------------

    print("Using Question Bank for next question...")

    result = get_resume_question(
        resume_text,
        difficulty=difficulty
    )

    return {
        "next_question": result["next_question"],
        "topic": result["topic"],
        "difficulty": result["difficulty"],
        "source": "question_bank"
    }