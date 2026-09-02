from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import re
import os

# =========================
# LOAD MODEL
# =========================

# Disable Hugging Face Hub warning
os.environ['HF_HUB_DISABLE_TELEMETRY'] = '1'

model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)


# =========================
# BASIC SEMANTIC SIMILARITY
# =========================

def calculate_semantic_similarity(text1, text2):

    embedding1 = model.encode([text1])
    embedding2 = model.encode([text2])

    similarity = cosine_similarity(
        embedding1,
        embedding2
    )[0][0]

    return round(similarity * 100)


# =========================
# CLEAN RESUME TEXT
# =========================

def clean_text(text):

    # Normalize spaces
    text = re.sub(
        r"\s+",
        " ",
        text
    )

    return text.strip()


# =========================
# SPLIT INTO EVIDENCE CHUNKS
# =========================

def split_into_sentences(text):

    # First normalize line breaks
    text = text.replace(
        "\r",
        "\n"
    )

    # Split on common resume separators
    chunks = re.split(
        r"\n+|(?<=[.!?])\s+|(?<=;)\s+",
        text
    )

    cleaned = []

    for chunk in chunks:

        chunk = clean_text(chunk)

        # Ignore tiny fragments
        if len(chunk) >= 15:

            cleaned.append(chunk)

    return cleaned


# =========================
# REQUIREMENT MATCHING
# =========================

def calculate_requirement_matches(
    requirements,
    resume_text
):

    evidence_chunks = split_into_sentences(
        resume_text
    )

    results = []

    for requirement in requirements:

        best_similarity = 0

        best_evidence = ""

        requirement_lower = (
            requirement.lower()
        )

        # -------------------------
        # Compare with every chunk
        # -------------------------

        for chunk in evidence_chunks:

            similarity = (
                calculate_semantic_similarity(
                    requirement,
                    chunk
                )
            )

            # Exact phrase = strong evidence
            if requirement_lower in chunk.lower():

                similarity = max(
                    similarity,
                    85
                )

            if similarity > best_similarity:

                best_similarity = similarity

                best_evidence = chunk

        # -------------------------
        # Clean evidence
        # -------------------------

        best_evidence = clean_text(
            best_evidence
        )

        # Limit extremely long evidence
        if len(best_evidence) > 250:

            best_evidence = (
                best_evidence[:250]
                + "..."
            )

        results.append({

            "requirement":
                requirement,

            "similarity":
                best_similarity,

            "evidence":
                best_evidence

        })

    return results