from flask import Flask, request, jsonify
from gemini_service import generate_questions, generate_next_question

from PyPDF2 import PdfReader
from docx import Document


app = Flask(__name__)


def extract_pdf_text(file):
    reader = PdfReader(file)

    text = ""

    for page in reader.pages:
        page_text = page.extract_text()

        if page_text:
            text += page_text + "\n"

    return text


def extract_docx_text(file):
    document = Document(file)

    text = ""

    for paragraph in document.paragraphs:
        text += paragraph.text + "\n"

    return text


def extract_resume_text(file):
    filename = file.filename.lower()

    if filename.endswith(".pdf"):
        return extract_pdf_text(file)

    elif filename.endswith(".docx"):
        return extract_docx_text(file)

    else:
        raise ValueError("Only PDF and DOCX resumes are supported")


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "Gemini Interview API is running"
    })


@app.route("/generate-questions", methods=["POST"])
def generate_interview_questions():

    if "resume" not in request.files:
        return jsonify({
            "success": False,
            "error": "No resume file provided"
        }), 400

    resume = request.files["resume"]

    if resume.filename == "":
        return jsonify({
            "success": False,
            "error": "No file selected"
        }), 400

    try:
        resume_text = extract_resume_text(resume)

        if not resume_text.strip():
            return jsonify({
                "success": False,
                "error": "Could not extract text from resume"
            }), 400

        questions = generate_questions(resume_text)

        return jsonify({
            "success": True,
            "questions": questions
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route("/next-question", methods=["POST"])
def next_question():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "error": "JSON body is required"
        }), 400

    question = data.get("question")
    answer = data.get("answer")

    if not question or not answer:
        return jsonify({
            "success": False,
            "error": "Both question and answer are required"
        }), 400

    try:
        result = generate_next_question(question, answer)

        return jsonify({
            "success": True,
            "result": result
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )