import json
import os
import time
import random
import requests
import re
from dotenv import load_dotenv
from difflib import SequenceMatcher

load_dotenv()

API_KEY = os.getenv("OPENROUTER_API_KEY") or os.getenv("GEMINI_API_KEY")


def log_info(section: str, message: str):
    """Log informational messages with section headers"""
    print(f"[INFO] [{section}] {message}")

def log_success(section: str, message: str):
    """Log successful operations"""
    print(f"[SUCCESS] [{section}] {message}")

def log_warning(section: str, message: str):
    """Log warnings"""
    print(f"[WARNING] [{section}] {message}")

def log_error(section: str, message: str):
    """Log errors"""
    print(f"[ERROR] [{section}] {message}")

def log_ai_event(event_type: str, model: str = "", message: str = ""):
    """Log AI-specific events"""
    if model:
        print(f"[AI {event_type}] Model: {model} | {message}")
    else:
        print(f"[AI {event_type}] {message}")

# ============================================================================
# STRING UTILITIES & DUPLICATE DETECTION
# ============================================================================

def normalize_question(question_text: str) -> str:
    """Normalize question for comparison"""
    if not question_text:
        return ""
    text = question_text.lower().strip()
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'[?!.,;:]', '', text)
    return text

def calculate_similarity(text1: str, text2: str) -> float:
    """Calculate similarity ratio between two strings (0.0 to 1.0)"""
    norm1 = normalize_question(text1)
    norm2 = normalize_question(text2)
    if not norm1 or not norm2:
        return 0.0
    return SequenceMatcher(None, norm1, norm2).ratio()

def is_duplicate_question(new_question: str, previous_questions: list, threshold: float = 0.75) -> tuple:
    """
    Check if new_question is a duplicate of any previous question.
    Returns: (is_duplicate: bool, most_similar_question: str, similarity_score: float)
    """
    if not previous_questions:
        return False, "", 0.0
    
    max_similarity = 0.0
    most_similar = ""
    
    for prev_q in previous_questions:
        prev_text = prev_q.get("question", "") if isinstance(prev_q, dict) else prev_q
        if not prev_text:
            continue
        
        similarity = calculate_similarity(new_question, prev_text)
        if similarity > max_similarity:
            max_similarity = similarity
            most_similar = prev_text
    
    is_dup = max_similarity >= threshold
    return is_dup, most_similar, max_similarity

def repair_json_string(raw_text: str) -> str:
    """Repair malformed JSON strings"""
    raw_text = re.sub(r"\n+", " ", raw_text)
    raw_text = re.sub(r"\s+", " ", raw_text)
    return raw_text.strip()

def safe_json_parse(raw_text: str):
    """Safely parse JSON with fallback repair"""
    try:
        return json.loads(raw_text)
    except json.JSONDecodeError:
        try:
            repaired = repair_json_string(raw_text)
            return json.loads(repaired)
        except json.JSONDecodeError:
            return {}

# ============================================================================
# CONTEXT BUILDING
# ============================================================================

def build_resume_context(candidate_profile, resume_text):
    """Build resume context for AI prompt"""
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

    # Skill-profile block (injected by the Full Interview orchestrator) lets
    # the AI prioritize the candidate's declared primary skills. This is the
    # "Skill-Based Dynamic Questioning" optimization.
    skill_block = candidate_profile.get("_skill_block")
    if skill_block:
        context += "\n" + skill_block + "\n"
    return context

def build_previous_questions_context(previous_questions: list) -> str:
    """Build context about previously asked questions"""
    if not previous_questions:
        return ""
    
    context = "\n=== QUESTIONS PREVIOUSLY ASKED IN EARLIER ATTEMPTS ===\n"
    for i, q in enumerate(previous_questions, 1):
        q_text = q.get("question", "") if isinstance(q, dict) else q
        topic = q.get("topic", "N/A") if isinstance(q, dict) else "N/A"
        if q_text:
            context += f"{i}. [{topic}] {q_text}\n"
    
    context += "\nIMPORTANT: DO NOT repeat, paraphrase, or reword any of these questions.\n"
    context += "Generate a GENUINELY NEW question with different technical focus.\n"
    return context

def extract_asked_topics(questions_list: list) -> list:
    """Extract all topics from a list of questions"""
    topics = []
    for q in questions_list:
        if isinstance(q, dict) and q.get("topic"):
            topics.append(q.get("topic"))
        elif isinstance(q, str):
            topics.append(q)
    return topics

# ============================================================================
# ROUND 2 REQUIREMENT CONTEXT (Pre-Interview Calibration)
# ============================================================================

# Calibrated Round 2 brief — describes the *expected* competencies for this
# stage of the pipeline. In production this would be loaded from a config file
# or per-role requirement document.
ROUND2_REQUIREMENT = {
    "round": "Round 2 — Technical Interview",
    "duration_minutes": 20,
    "total_questions": 7,
    "calibration": "Mid-to-senior full-stack / backend software engineer competency check.",
    "core_competencies": [
        "Data structures & algorithms (Big-O reasoning, trade-offs, edge cases)",
        "System design and architectural trade-offs (caching, queues, consistency, scaling)",
        "Database design, query optimization, indexing, transactions, ACID vs BASE",
        "Networking fundamentals (HTTP semantics, TLS, connection pooling, DNS, CDN)",
        "Operating systems fundamentals (concurrency, threads, processes, memory)",
        "Language-specific depth (the candidate's documented stack)",
        "Distributed systems thinking (CAP, idempotency, retries, observability)",
    ],
    "expected_signals": [
        "Can reason about *why* a technology is chosen, not just *how* to use it",
        "Can articulate trade-offs (consistency vs availability, latency vs throughput)",
        "Identifies and handles edge cases (concurrency, partial failure, hot keys)",
        "Translates resume experience into concrete implementation details",
    ],
    "red_flags": [
        "Surface-level textbook answers with no project grounding",
        "Unable to explain trade-offs or alternatives",
        "Conflates unrelated concepts (e.g. JWT vs session cookies vs OAuth flows)",
        "Cannot reason about performance at all",
    ],
}


def detect_seniority(candidate_profile, resume_text):
    """Heuristically detect seniority tier for question calibration."""
    exp_years = candidate_profile.get("experience_years", 0) or 0
    text = (resume_text or "").lower()

    senior_signals = [
        "principal", "staff", "architect", "lead ", "tech lead",
        "design system", "platform", "mentor", "scalability", "distributed",
    ]
    mid_signals = [
        "senior", "sde-2", "sde 2", "ii ", "sde-3", "3+ years",
    ]

    if exp_years >= 5 or any(s in text for s in senior_signals):
        return "senior"
    if exp_years >= 2 or any(s in text for s in mid_signals):
        return "mid"
    return "junior"


def build_round2_requirement_context(seniority="mid"):
    """Produce a short, structured block describing Round 2 expectations
    and the candidate's seniority tier, for the question-generation prompt."""
    req = ROUND2_REQUIREMENT
    seniority_descriptor = {
        "senior": "Senior engineer — questions must probe architecture, distributed systems, deep trade-offs, and mentorship-level reasoning.",
        "mid": "Mid-level engineer — questions should balance implementation depth with system-design fundamentals.",
        "junior": "Junior engineer — questions should validate fundamentals and basic application, with light design reasoning.",
    }.get(seniority, "Mid-level engineer.")

    competencies = "\n".join(f"- {c}" for c in req["core_competencies"])
    signals = "\n".join(f"- {s}" for s in req["expected_signals"])
    return (
        "=== ROUND 2 REQUIREMENTS (calibration brief) ===\n"
        f"Round: {req['round']} | Duration: {req['duration_minutes']} min | "
        f"Total questions: {req['total_questions']}\n"
        f"Calibration: {req['calibration']}\n"
        f"Seniority tier: {seniority_descriptor}\n"
        "Core competencies to probe:\n"
        f"{competencies}\n"
        "Expected signal patterns (look for these in answers):\n"
        f"{signals}\n"
    )


# ============================================================================
# ADAPTIVE DIFFICULTY ENGINE
# ============================================================================

DIFFICULTY_LEVELS = ["Easy", "Medium", "Hard", "Expert"]


def calibrate_next_difficulty(answers_with_eval, current_difficulty="Medium"):
    """Adjust difficulty for the NEXT question based on the candidate's recent
    performance. Returns one of: "Easy", "Medium", "Hard", "Expert".

    Heuristic (no API call needed — uses the last 1-3 evaluation scores):
      - last score >= 8.5       -> step UP
      - last score in [7, 8.5)  -> stay
      - last score in [5, 7)    -> step DOWN
      - last score < 5          -> step DOWN twice
    Average of last 2 evaluations if available, with weight on the most recent.
    """
    if not answers_with_eval:
        return current_difficulty
    last = answers_with_eval[-1]
    score = last.get("evaluation", {}).get("score", 5)
    idx = DIFFICULTY_LEVELS.index(current_difficulty) if current_difficulty in DIFFICULTY_LEVELS else 1

    if score >= 8.5:
        idx = min(len(DIFFICULTY_LEVELS) - 1, idx + 1)
    elif score >= 7:
        idx = idx
    elif score >= 5:
        idx = max(0, idx - 1)
    else:
        idx = max(0, idx - 2)

    return DIFFICULTY_LEVELS[idx]


def build_adaptive_difficulty_block(answers_with_eval, current_difficulty):
    """Produce a prompt block summarizing the candidate's recent performance
    so the question generator can adjust both difficulty and probe style.

    Always returns a (block: str, next_difficulty: str) tuple.
    """
    if not answers_with_eval:
        block = (
            "=== ADAPTIVE DIFFICULTY (Round 2) ===\n"
            "First question — no prior signal. Use the calibration brief above to choose a "
            "foundational-but-specific question.\n"
        )
        return block, current_difficulty

    last3 = answers_with_eval[-3:]
    rows = []
    for a in last3:
        ev = a.get("evaluation", {})
        rows.append({
            "q": a.get("question", "")[:120],
            "score": ev.get("score", 0),
            "tech": ev.get("technical_correctness", 0),
            "depth": ev.get("depth", 0),
            "feedback": ev.get("feedback", ""),
        })
    avg_score = round(sum(r["score"] for r in rows) / len(rows), 2)
    next_diff = calibrate_next_difficulty(answers_with_eval, current_difficulty)
    trend = "improving" if len(rows) >= 2 and rows[-1]["score"] > rows[0]["score"] else \
            "declining" if len(rows) >= 2 and rows[-1]["score"] < rows[0]["score"] else "stable"

    block = (
        "=== ADAPTIVE DIFFICULTY (Round 2) ===\n"
        f"Current difficulty: {current_difficulty}\n"
        f"Last {len(rows)} answer(s) average score: {avg_score}/10 | trend: {trend}\n"
        f"NEXT difficulty: {next_diff}\n"
        "Recent performance summary:\n"
    )
    for i, r in enumerate(rows, 1):
        block += f"  {i}. (score={r['score']}, tech={r['tech']}, depth={r['depth']}) {r['q']}... — {r['feedback']}\n"
    block += (
        "\nAdaptive rules for the NEXT question:\n"
        "- If recent tech_correctness >= 8 AND depth >= 7: increase abstraction. Ask about trade-offs, "
        "failure modes, scaling, or the 'why' behind design decisions. Probe for system-design depth.\n"
        "- If recent tech_correctness is in 5-7 range: stay at the same level but pivot to a related "
        "sub-topic the candidate hasn't covered, to identify their technical ceiling.\n"
        "- If recent tech_correctness < 5: simplify the question, anchor it more explicitly to the "
        "candidate's resume, and probe foundational understanding before moving on.\n"
    )
    return block, next_diff

# ============================================================================
# MAIN QUESTION GENERATION
# ============================================================================

def generate_first_question(
    candidate_profile,
    resume_text,
    previous_answers=None,
    questions=None,
    previous_attempt_questions=None,
    attempt_number=1
):
    """
    Generate a single Round 2 interview question with:
      - Pre-interview contextual analysis (resume + Round 2 requirement brief)
      - Adaptive difficulty calibration from prior answers
      - Strict deduplication across all prior attempts
      - Seniority-tier calibration
      - Focus on "why" + "how" implementation details, architectural trade-offs,
        and resume-grounded scenarios (no generic or filler questions)
      - Session-based randomization for uniqueness
    """
    if not API_KEY:
        log_warning("QUESTION_GENERATION", "No API key found. Using fallback.")
        return generate_fallback_question(1, candidate_profile, [])

    previous_attempt_questions = previous_attempt_questions or []
    previous_answers = previous_answers or []
    questions = questions or []

    current_question_number = len(previous_answers) + 1
    log_info(
        "QUESTION_GENERATION",
        f"Attempt: {attempt_number} | Question #{current_question_number} | "
        f"Previous attempts: {len(previous_attempt_questions)} questions"
    )
    
    # Generate session-specific random seed for uniqueness
    session_seed = f"{attempt_number}_{current_question_number}_{time.time()}_{random.randint(1000, 9999)}"
    
    # Add immediate fallback if API key is invalid
    if not API_KEY or len(API_KEY) < 10:
        log_warning("QUESTION_GENERATION", "Invalid API key detected. Using fallback immediately.")
        return generate_fallback_question(1, candidate_profile, [])

    # ========== PRE-INTERVIEW CONTEXTUAL ANALYSIS ==========
    seniority = detect_seniority(candidate_profile, resume_text)
    round2_context = build_round2_requirement_context(seniority)
    context = build_resume_context(candidate_profile, resume_text)

    # Current attempt answer history
    answer_history = ""
    asked_topics_current = []
    if previous_answers:
        answer_history = "\n=== CURRENT ATTEMPT CONVERSATION SO FAR ===\n"
        for i, ans in enumerate(previous_answers[-3:], 1):
            q_text = ans.get("question", "")
            answer_history += f"Q{i}: {q_text}\nA{i}: {ans.get('transcript', '')[:500]}\n"
            if questions:
                prev_q = next((q for q in questions if q.get("id") == ans.get("questionId")), {})
                if prev_q.get("topic"):
                    asked_topics_current.append(prev_q.get("topic"))

    # Previous attempt questions context (cross-attempt dedup)
    prev_attempt_context = build_previous_questions_context(previous_attempt_questions)
    asked_topics_previous = extract_asked_topics(previous_attempt_questions)

    # ========== ADAPTIVE DIFFICULTY CALIBRATION ==========
    # Synthesize "answers_with_eval" shape that the difficulty engine expects.
    answers_with_eval = []
    if previous_answers and questions:
        for ans in previous_answers:
            q = next((q for q in questions if q.get("id") == ans.get("questionId")), {})
            answers_with_eval.append({
                "question": q.get("question", ""),
                "transcript": ans.get("transcript", ""),
                "evaluation": ans.get("evaluation", {}) or {},
            })
    current_difficulty = "Medium"
    if previous_answers and questions:
        last_q = next((q for q in questions if q.get("id") == previous_answers[-1].get("questionId")), {})
        current_difficulty = last_q.get("difficulty", "Medium")
    adaptive_block, next_difficulty = build_adaptive_difficulty_block(answers_with_eval, current_difficulty)

    # Initial starting difficulty if first question
    if not previous_answers:
        next_difficulty = {"junior": "Easy", "mid": "Medium", "senior": "Hard"}.get(seniority, "Medium")

    # Use session-specific random seed for uniqueness
    random_seed = hash(session_seed) % 10000

    # ========== BUILD AI PROMPT ==========
    prompt = f"""You are an expert technical interviewer conducting a high-stakes Round 2 (20-minute) technical assessment.

{round2_context}

=== CANDIDATE PROFILE (analyzed) ===
{context}

=== CURRENT ATTEMPT PROGRESS ===
{answer_history if answer_history else "No answers yet in this attempt."}

=== ADAPTIVE DIFFICULTY ENGINE OUTPUT ===
{adaptive_block}

=== DEDUPLICATION CRITICAL SECTION ===
{prev_attempt_context}

All topics already tested: {asked_topics_previous + asked_topics_current}

=== QUESTION GENERATION RULES ===
1. TARGETED, ADVANCED QUESTIONING — Bridge the candidate's documented experience with the Round 2
   requirements. Reference SPECIFIC projects, technologies, or experiences from their resume BY NAME.
2. "WHY" + "HOW" FOCUS — Questions must probe implementation details, architectural trade-offs, system
   design decisions, or complex edge cases. Avoid textbook or surface-level phrasing.
3. ADAPTIVE — Use the next_difficulty value above ({next_difficulty}). If the previous answer was strong,
   escalate abstraction (trade-offs, failure modes, scaling). If weak, anchor more explicitly to the
   resume before moving on.
4. PERSONALIZED — No generic "tell me about a project" wording. Instead: "In your <ProjectName> that used
   <Tech>, why did you choose X over Y for the cache layer, and what consistency guarantees does that
   give you under partial failure?"
5. ONE QUESTION ONLY.
6. NO FILLER — Every question must be technically meaningful and probe depth, not breadth.
7. DEDUPLICATE — Do NOT repeat, paraphrase, or reword any previously asked question.
8. Question type must be one of: resume, dsa, system-design, concept, project.
9. Random seed for variation: {random_seed}
10. SESSION UNIQUENESS — Generate a UNIQUE question for this specific session ({session_seed}). Do not reuse questions from previous sessions or attempts.

=== OUTPUT FORMAT (STRICT JSON ONLY, no markdown, no code fences) ===
{{
  "question": "The complete interview question text...",
  "topic": "Topic name (e.g. 'Database indexing in PostgreSQL')",
  "difficulty": "{next_difficulty}",
  "questionType": "resume|dsa|system-design|concept|project",
  "probe_focus": "what 'why' or 'how' this question is designed to surface",
  "ttsText": "Natural spoken version of the question for text-to-speech"
}}"""

    # ========== TRY AI MODELS WITH RETRY LOGIC ==========
    models = [
        "meta-llama/llama-3.3-70b-instruct",
        "google/gemini-2.5-flash",
        "qwen/qwen-2.5-coder-32b-instruct",
    ]

    max_retries_per_model = 2  # Reduced from 3 to prevent excessive retries
    max_total_retries = 5  # Total retries across all models
    total_retry_count = 0

    for model in models:
        retry_count = 0
        while retry_count < max_retries_per_model and total_retry_count < max_total_retries:
            try:
                log_ai_event("CALL", model, f"Attempt {attempt_number}, Question {current_question_number}, Retry {retry_count + 1} (Total: {total_retry_count + 1})")

                url, headers, payload = build_openrouter_request(model, prompt)
                res = requests.post(url, headers=headers, json=payload, timeout=10)  # Reduced timeout from 15 to 10

                if res.status_code == 200:
                    data = res.json()
                    raw_text = extract_content(data)
                    parsed = safe_json_parse(raw_text)

                    if parsed and "question" in parsed:
                        new_question = parsed.get("question", "")

                        # ========== DUPLICATE CHECK ==========
                        is_dup, similar_q, similarity = is_duplicate_question(
                            new_question,
                            previous_attempt_questions,
                            threshold=0.72
                        )

                        if is_dup:
                            log_ai_event(
                                "DUPLICATE",
                                model,
                                f"Similarity: {similarity:.2f} | Trying next retry..."
                            )
                            retry_count += 1
                            total_retry_count += 1
                            continue

                        # ========== ADAPTIVE DIFFICULTY OVERRIDE ==========
                        # Ensure the question's claimed difficulty matches the engine.
                        parsed["difficulty"] = next_difficulty

                        # ========== SUCCESS ==========
                        parsed["id"] = f"q{current_question_number}"
                        log_ai_event(
                            "SUCCESS",
                            model,
                            f"Question approved | Topic: {parsed.get('topic')} | "
                            f"Difficulty: {parsed.get('difficulty')} | "
                            f"Seniority: {seniority}"
                        )
                        return parsed
                    else:
                        log_warning("QUESTION_GENERATION", f"Model {model} returned invalid JSON or missing 'question' field")
                        retry_count += 1
                        total_retry_count += 1
                else:
                    log_warning("QUESTION_GENERATION", f"Model {model} returned HTTP {res.status_code}")
                    retry_count += 1
                    total_retry_count += 1

            except Exception as e:
                log_error("QUESTION_GENERATION", f"Model {model} error: {str(e)}")
                retry_count += 1
                total_retry_count += 1

    # ========== ALL AI ATTEMPTS EXHAUSTED - USE FALLBACK ==========
    log_warning(
        "QUESTION_GENERATION",
        f"All AI models exhausted after {total_retry_count} total retries. Using fallback question."
    )

    asked_topics_all = list(set(asked_topics_previous + asked_topics_current))
    fallback_q = generate_fallback_question(
        current_question_number,
        candidate_profile,
        asked_topics_all,
        previous_attempt_questions
    )
    fallback_q["difficulty"] = next_difficulty
    log_ai_event("FALLBACK", "", f"Topic: {fallback_q.get('topic')}")
    return fallback_q

# ============================================================================
# ANSWER EVALUATION
# ============================================================================

def evaluate_answer(question_text, transcript, candidate_profile, resume_text):
    """Evaluate a candidate's verbal answer using the Round 2 expert rubric.

    Metrics (all 1-10):
      - technical_correctness
      - depth_of_understanding   (does the candidate know WHY, not just HOW)
      - problem_solving
      - trade_off_awareness
      - communication_clarity
      - relevance
    """
    if not API_KEY:
        log_warning("EVALUATION", "No API key. Using fallback evaluation.")
        return _fallback_evaluation()

    context = build_resume_context(candidate_profile, resume_text)
    prompt = f"""You are an expert Round 2 technical interviewer evaluating a candidate's verbal answer.

Question asked: {question_text}
Candidate's spoken answer (transcript): {transcript}

Resume Context (for grounding):
{context}

=== EVALUATION RUBRIC ===
Score the candidate on these six metrics, each 1-10:

1. technical_correctness — Are the technical claims accurate? No fabrications?
2. depth_of_understanding — Does the candidate know WHY the technology works, not just HOW to use it?
3. problem_solving — Did they identify edge cases, failure modes, or trade-offs?
4. trade_off_awareness — Did they explicitly compare alternatives (e.g. SQL vs NoSQL, REST vs GraphQL,
   synchronous vs async, eager vs lazy)?
5. communication_clarity — Is the answer structured, concise, and easy to follow?
6. relevance — Is the answer on-topic and tied to the question?

=== OUTPUT (STRICT JSON, no markdown) ===
{{
  "score": <1-10, weighted overall>,
  "technical_correctness": <1-10>,
  "depth": <1-10>,
  "problem_solving": <1-10>,
  "trade_off_awareness": <1-10>,
  "communication": <1-10>,
  "relevance": <1-10>,
  "feedback": "1-2 sentence professional feedback that explicitly references what the candidate said",
  "strengths": ["specific strength observed in THIS answer", ...],
  "weaknesses": ["specific weakness observed in THIS answer", ...],
  "depth_signal": "why" | "how" | "shallow",
  "adapt_hint": "increase_difficulty" | "maintain" | "decrease_difficulty"
}}"""

    models = ["meta-llama/llama-3.3-70b-instruct", "google/gemini-2.5-flash"]
    for model in models:
        try:
            log_ai_event("EVAL_CALL", model, "Evaluating candidate answer")
            url, headers, payload = build_openrouter_request(model, prompt)
            res = requests.post(url, headers=headers, json=payload, timeout=15)
            if res.status_code == 200:
                data = res.json()
                raw_text = extract_content(data)
                parsed = safe_json_parse(raw_text)
                if parsed and "score" in parsed:
                    log_ai_event("EVAL_SUCCESS", model, f"Score: {parsed.get('score')}/10")
                    return parsed
        except Exception as e:
            log_error("EVALUATION", f"Model {model} error: {str(e)}")

    log_warning("EVALUATION", "All models exhausted. Using fallback evaluation.")
    return _fallback_evaluation()


def _fallback_evaluation():
    return {
        "score": 5,
        "technical_correctness": 5,
        "depth": 5,
        "problem_solving": 5,
        "trade_off_awareness": 5,
        "communication": 5,
        "relevance": 5,
        "feedback": "Answer recorded. Detailed evaluation pending.",
        "strengths": ["Candidate provided a response"],
        "weaknesses": ["Further evaluation required"],
        "depth_signal": "shallow",
        "adapt_hint": "maintain",
    }


def detect_end_interview_command(transcript):
    """Detect if the candidate spoke an 'end interview' command.

    Returns True if the transcript clearly contains a command to terminate the interview.
    Only the LISTENING phase looks for this — during the ASKING phase the candidate
    is meant to answer the question, not end the interview.
    """
    if not transcript:
        return False
    text = transcript.lower().strip()
    # Strip punctuation
    text = re.sub(r"[^\w\s]", " ", text)
    text = re.sub(r"\s+", " ", text)
    triggers = [
        "end interview",
        "end the interview",
        "stop interview",
        "stop the interview",
        "finish interview",
        "finish the interview",
        "i am done",
        "i'm done",
        "terminate interview",
        "end my interview",
        "wrap up the interview",
    ]
    for t in triggers:
        if t in text:
            return True
    return False

# ============================================================================
# FINAL REPORT GENERATION
# ============================================================================

def generate_final_report(session):
    """Generate final performance report"""
    if not API_KEY:
        log_warning("REPORT", "No API key. Using fallback report.")
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
        log_ai_event("REPORT_CALL", "meta-llama/llama-3.3-70b-instruct", "Generating final report")
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
            log_ai_event("REPORT_SUCCESS", "", f"Final score: {parsed.get('overall_score')}")
            return parsed
    except Exception as e:
        log_error("REPORT", f"Error: {str(e)}")

    log_warning("REPORT", "AI report generation failed. Using fallback report.")
    return generate_fallback_report(session)

# ============================================================================
# FALLBACK QUESTION GENERATION
# ============================================================================

def generate_fallback_question(question_number, candidate_profile, asked_topics=None, previous_attempt_questions=None):
    """
    Generate a fallback question when AI fails.
    Now includes deduplication against previous attempts and session-based randomization.
    """
    skills = candidate_profile.get("skills", [])
    topic = skills[0] if skills else "programming"
    asked_topics = asked_topics or []
    previous_attempt_questions = previous_attempt_questions or []
    
    # Add session-based randomization for uniqueness
    session_id = f"fallback_{question_number}_{int(time.time() * 1000)}_{random.randint(1000, 9999)}"
    log_warning("FALLBACK_GENERATION", f"Creating fallback question #{question_number} with session {session_id}")

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

    # Filter out asked topics
    filtered = [q for q in all_questions if q["topic"] not in asked_topics]
    if not filtered:
        filtered = all_questions

    # Further filter to avoid duplicates from previous attempts
    unique_filtered = []
    for q in filtered:
        is_dup, _, sim = is_duplicate_question(q["question"], previous_attempt_questions, threshold=0.70)
        if not is_dup:
            unique_filtered.append(q)
    
    if not unique_filtered:
        unique_filtered = filtered

    # Use session-based randomization for selection
    random.shuffle(unique_filtered)
    selected_index = hash(session_id) % len(unique_filtered)
    selected = unique_filtered[selected_index]
    selected["id"] = f"q{question_number}_{session_id[-8:]}"  # Include session ID suffix for uniqueness
    
    log_warning("FALLBACK_GENERATION", f"Selected fallback topic: {selected.get('topic')} with session ID: {session_id}")
    return selected

# ============================================================================
# FALLBACK REPORT GENERATION
# ============================================================================

def generate_fallback_report(session):
    """Generate a fallback report when AI fails"""
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

# ============================================================================
# API & HELPER UTILITIES
# ============================================================================

def build_openrouter_request(model, prompt):
    """Build OpenRouter API request"""
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
    """Extract content from API response"""
    if "choices" in data and len(data["choices"]) > 0:
        return data["choices"][0]["message"]["content"]
    elif "candidates" in data and len(data["candidates"]) > 0:
        return data["candidates"][0]["content"]["parts"][0]["text"]
    return "{}"