from flask import (
    Flask,
    request,
    jsonify
)

from flask_cors import CORS

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


# =========================
# RUN SERVER
# =========================

if __name__ == "__main__":

    app.run(

        debug=True,

        port=5001

    )