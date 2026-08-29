from ats.semantic import (
    calculate_requirement_matches
)


def calculate_ats_score(
    resume_info,
    job_info,
    resume_text,
    job_description
):

    # =========================
    # RESUME SKILLS
    # =========================

    resume_skills = {
        skill.lower()
        for skill in resume_info["skills"]
    }

    # =========================
    # REQUIRED SKILLS
    # =========================

    required_skills = {
        skill.lower()
        for skill in job_info["required_skills"]
    }

    # =========================
    # EXACT SKILL MATCH
    # 50 POINTS
    # =========================

    if required_skills:

        matched_skills = (
            resume_skills
            .intersection(
                required_skills
            )
        )

        missing_skills = (
            required_skills
            - resume_skills
        )

        skill_score = (

            len(matched_skills)
            /
            len(required_skills)

        ) * 50

    else:

        matched_skills = set()

        missing_skills = set()

        skill_score = 50


    # =========================
    # SEMANTIC MATCH
    # 20 POINTS
    # =========================

    semantic_matches = (
        calculate_requirement_matches(
            required_skills,
            resume_text
        )
    )

    # Exact skill match should not
    # receive an artificially low
    # semantic score.

    for match in semantic_matches:

        requirement = (
            match["requirement"]
            .lower()
        )

        if requirement in resume_skills:

            match["similarity"] = max(
                match["similarity"],
                85
            )

    if semantic_matches:

        average_similarity = (

            sum(
                item["similarity"]
                for item in semantic_matches
            )

            /

            len(semantic_matches)

        )

    else:

        average_similarity = 100

    semantic_score = (

        average_similarity
        /
        100

    ) * 20


    # =========================
    # EXPERIENCE
    # 15 POINTS
    # =========================

    resume_experience = (
        resume_info[
            "experience_years"
        ]
    )

    required_experience = (
        job_info[
            "required_experience"
        ]
    )

    if required_experience == 0:

        experience_score = 15

    elif (
        resume_experience
        >= required_experience
    ):

        experience_score = 15

    else:

        experience_score = (

            resume_experience
            /
            required_experience

        ) * 15

        experience_score = max(
            0,
            min(
                experience_score,
                15
            )
        )


    # =========================
    # STRUCTURE
    # 15 POINTS
    # =========================

    sections = resume_info[
        "sections"
    ]

    section_count = sum(
        sections.values()
    )

    structure_score = (

        section_count
        /
        5

    ) * 15

    structure_score = min(
        structure_score,
        15
    )


    # =========================
    # FINAL SCORE
    # =========================

    final_score = (

        skill_score
        +
        semantic_score
        +
        experience_score
        +
        structure_score

    )

    final_score = round(
        min(
            final_score,
            100
        )
    )


    # =========================
    # RETURN
    # =========================

    return {

        "ats_score":
            final_score,

        "matched_skills":
            sorted(
                matched_skills
            ),

        "missing_skills":
            sorted(
                missing_skills
            ),

        "semantic_matches":
            semantic_matches,

        "score_breakdown": {

            "skills":
                round(
                    skill_score
                ),

            "semantic":
                round(
                    semantic_score
                ),

            "experience":
                round(
                    experience_score
                ),

            "structure":
                round(
                    structure_score
                )

        }

    }