from flask import Flask, request, jsonify
from flask_cors import CORS
import uuid
import os
import sys
from datetime import datetime
from dotenv import load_dotenv




BACKEND_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BACKEND_ROOT)

load_dotenv()

from ats.parser import (
    extract_text_from_pdf,
    extract_text_from_docx,
    extract_resume_info,
    analyze_job_description
)

from ats.scorer import (
    calculate_ats_score
)

from ats.recommendations import (
    generate_recommendations
)

from oa.session_store import (
    create_oa_session,
    get_oa_session,
    start_oa_session,
    oa_sessions
)
from oa.gemini_generator import generate_dsa_questions
from oa.code_runner import run_candidate_code
from oa.scoring_engine import (
    calculate_oa_objective_score,
    generate_gemini_oa_feedback
)


# =========================
# FLASK APP
# =========================

app = Flask(__name__)

CORS(app)


# =========================
# HOME
# =========================

@app.route("/")
def home():

    return jsonify({

        "status": "success",

        "message":
            "Vireza ATS API is running"

    })


# =========================
# ATS ENDPOINT
# =========================

@app.route(
    "/ats",
    methods=["POST"]
)
def ats():

    try:

        # =========================
        # RESUME
        # =========================

        text = ""

        if "resume" in request.files:

            resume = request.files[
                "resume"
            ]

            if resume.filename == "":

                return jsonify({

                    "status": "error",

                    "message":
                        "No file selected"

                }), 400

            filename = (
                resume.filename.lower()
            )

            if filename.endswith(".pdf"):

                text = (
                    extract_text_from_pdf(
                        resume
                    )
                )

            elif filename.endswith(".docx"):

                text = (
                    extract_text_from_docx(
                        resume
                    )
                )

            else:

                return jsonify({

                    "status": "error",

                    "message":
                        "Only PDF and DOCX files are supported"

                }), 400

        elif "resume_text" in request.form:

            text = request.form[
                "resume_text"
            ]

        else:

            return jsonify({

                "status": "error",

                "message":
                    "Please provide a resume file or resume_text"

            }), 400


        # =========================
        # VALIDATE RESUME
        # =========================

        if not text.strip():

            return jsonify({

                "status": "error",

                "message":
                    "Could not extract text from resume"

            }), 400


        # =========================
        # JOB DESCRIPTION
        # =========================

        job_description = (
            request.form.get(
                "job_description",
                ""
            )
        )

        if not job_description.strip():

            return jsonify({

                "status": "error",

                "message":
                    "Please provide a job_description"

            }), 400


        # =========================
        # RESUME ANALYSIS
        # =========================

        resume_info = (
            extract_resume_info(
                text
            )
        )


        # =========================
        # JOB ANALYSIS
        # =========================

        job_info = (
            analyze_job_description(
                job_description
            )
        )


        # =========================
        # ATS SCORE
        # =========================

        result = calculate_ats_score(

            resume_info,

            job_info,

            text,

            job_description

        )


        # =========================
        # RECOMMENDATIONS
        # =========================

        recommendations = (
            generate_recommendations(

                resume_info,

                job_info,

                result[
                    "semantic_matches"
                ]

            )
        )


        # =========================
        # FINAL RESPONSE
        # =========================

        return jsonify({

            "status":
                "success",

            "ats_score":
                result[
                    "ats_score"
                ],

            "score_breakdown":
                result[
                    "score_breakdown"
                ],

            "matched_skills":
                result[
                    "matched_skills"
                ],

            "missing_skills":
                result[
                    "missing_skills"
                ],

            "semantic_matches":
                result[
                    "semantic_matches"
                ],

            "recommendations":
                recommendations,

            "resume_analysis": {

                "skills":
                    resume_info[
                        "skills"
                    ],

                "experience_years":
                    resume_info[
                        "experience_years"
                    ],

                "sections":
                    resume_info[
                        "sections"
                    ]

            },

            "job_analysis": {

                "required_skills":
                    job_info[
                        "required_skills"
                    ],

                "required_experience":
                    job_info[
                        "required_experience"
                    ]

            }

        })


    except Exception as e:

        return jsonify({

            "status":
                "error",

            "message":
                str(e)

        }), 500



# =========================================================
# ROUND 1 — DSA ONLINE ASSESSMENT (OA) API ENDPOINTS
# =========================================================

@app.route("/api/oa/start", methods=["POST"])
def oa_start():
    try:
        text = ""
        if "resume" in request.files:
            resume = request.files["resume"]
            if resume.filename.endswith(".pdf"):
                text = extract_text_from_pdf(resume)
            elif resume.filename.endswith(".docx"):
                text = extract_text_from_docx(resume)
        elif "resume_text" in request.form:
            text = request.form["resume_text"]
        elif request.is_json and "resume_text" in request.json:
            text = request.json["resume_text"]

        if not text or not text.strip():
            # Fallback default resume profile if text is brief
            text = "Software engineer candidate with Python, JavaScript, and Java experience."

        # Extract Candidate Technical Profile
        candidate_profile = extract_resume_info(text)

        # Generate 3 DSA Questions via Gemini
        questions = generate_dsa_questions(candidate_profile)

        # Initialize Session
        session_id = str(uuid.uuid4())
        session = create_oa_session(session_id, candidate_profile, questions)

        return jsonify({
            "status": "success",
            "sessionId": session_id,
            "session": session
        })
    except Exception as e:
        print("[OA API Start Error]", str(e))
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/oa/<session_id>", methods=["GET"])
def oa_get_session(session_id):
    session = get_oa_session(session_id)
    if not session:
        return jsonify({"status": "error", "message": "OA Session not found"}), 404
    return jsonify({"status": "success", "session": session})


@app.route("/api/oa/<session_id>/start-timer", methods=["POST"])
def oa_start_timer(session_id):
    session = start_oa_session(session_id)
    if not session:
        return jsonify({"status": "error", "message": "OA Session not found"}), 404

    return jsonify({
        "status": "success",
        "startedAt": session["startedAt"],
        "endsAt": session["endsAt"],
        "session": session
    })


@app.route("/api/oa/<session_id>/autosave", methods=["POST"])
def oa_autosave(session_id):
    session = get_oa_session(session_id)
    if not session:
        return jsonify({"status": "error", "message": "OA Session not found"}), 404

    body = request.get_json() or {}
    q_id = body.get("questionId")
    lang = body.get("language", "python").lower()
    code = body.get("code", "")

    if q_id and q_id in session["codeByQuestion"]:
        session["codeByQuestion"][q_id][lang] = code

    return jsonify({"status": "success"})


@app.route("/api/oa/<session_id>/run", methods=["POST"])
def oa_run_code(session_id):
    session = get_oa_session(session_id)
    if not session:
        return jsonify({"status": "error", "message": "OA Session not found"}), 404

    body = request.get_json() or {}
    q_id = body.get("questionId")
    lang = body.get("language", "python")
    code = body.get("code", "")

    question = next((q for q in session["questions"] if q["id"] == q_id), None)
    if not question:
        return jsonify({"status": "error", "message": "Question not found"}), 404

    public_tests = question["testCases"]["public"]
    run_res = run_candidate_code(lang, code, public_tests, question)

    session["runResults"][q_id] = run_res
    return jsonify({"status": "success", "runResult": run_res})


@app.route("/api/oa/<session_id>/submit", methods=["POST"])
def oa_submit_code(session_id):
    session = get_oa_session(session_id)
    if not session:
        return jsonify({"status": "error", "message": "OA Session not found"}), 404

    body = request.get_json() or {}
    q_id = body.get("questionId")
    lang = body.get("language", "python")
    code = body.get("code", "")

    question = next((q for q in session["questions"] if q["id"] == q_id), None)
    if not question:
        return jsonify({"status": "error", "message": "Question not found"}), 404

    # Run combined Public + Hidden test cases for official submission
    all_tests = question["testCases"]["public"] + question["testCases"]["hidden"]
    sub_res = run_candidate_code(lang, code, all_tests, question)
    sub_res["publicCount"] = len(question["testCases"]["public"])
    sub_res["hiddenCount"] = len(question["testCases"]["hidden"])

    session["submissions"][q_id] = sub_res
    session["codeByQuestion"][q_id][lang] = code

    return jsonify({"status": "success", "submissionResult": sub_res})


@app.route("/api/oa/<session_id>/integrity", methods=["POST"])
def oa_integrity(session_id):
    session = get_oa_session(session_id)
    if not session:
        return jsonify({"status": "error", "message": "OA Session not found"}), 404

    body = request.get_json() or {}
    evt = {
        "type": body.get("type", "UNKNOWN"),
        "timestamp": datetime.now().strftime("%H:%M:%S"),
        "details": body.get("details", "")
    }
    session["integrityEvents"].append(evt)
    return jsonify({"status": "success", "totalEvents": len(session["integrityEvents"])})


@app.route("/api/oa/<session_id>/finish", methods=["POST"])
def oa_finish(session_id):
    session = get_oa_session(session_id)
    if not session:
        return jsonify({"status": "error", "message": "OA Session not found"}), 404

    # Objective performance scoring
    objective_res = calculate_oa_objective_score(session)

    # Gemini qualitative feedback
    gemini_feedback = generate_gemini_oa_feedback(objective_res, session["candidateProfile"])

    final_result = {
        "round": "OA",
        "score": objective_res["overallScore"],
        "qualified": objective_res["qualified"],
        "passingThreshold": objective_res["passingThreshold"],
        "questionResults": objective_res["questionResults"],
        "performanceBreakdown": objective_res["performanceBreakdown"],
        "integrity": objective_res["integrity"],
        "aiFeedback": gemini_feedback
    }

    session["status"] = "COMPLETED"
    session["finalResult"] = final_result
    session["score"] = objective_res["overallScore"]
    session["qualified"] = objective_res["qualified"]

    return jsonify({"status": "success", "result": final_result})


@app.route("/api/oa/<session_id>/result", methods=["GET"])
def oa_get_result(session_id):
    session = get_oa_session(session_id)
    if not session:
        return jsonify({"status": "error", "message": "OA Session not found"}), 404

    if not session.get("finalResult"):
        objective_res = calculate_oa_objective_score(session)
        gemini_feedback = generate_gemini_oa_feedback(objective_res, session["candidateProfile"])
        session["finalResult"] = {
            "round": "OA",
            "score": objective_res["overallScore"],
            "qualified": objective_res["qualified"],
            "passingThreshold": objective_res["passingThreshold"],
            "questionResults": objective_res["questionResults"],
            "performanceBreakdown": objective_res["performanceBreakdown"],
            "integrity": objective_res["integrity"],
            "aiFeedback": gemini_feedback
        }

    return jsonify({"status": "success", "result": session["finalResult"]})


from technical_interview.routes import register_technical_interview_routes

register_technical_interview_routes(app)


# =========================
# RUN SERVER
# =========================

if __name__ == "__main__":
    app.run(debug=True, port=5001)