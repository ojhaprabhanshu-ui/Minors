def generate_recommendations(
    resume_info,
    job_info,
    semantic_matches
):

    recommendations = []

    resume_skills = {
        skill.lower()
        for skill in resume_info["skills"]
    }

    required_skills = {
        skill.lower()
        for skill in job_info["required_skills"]
    }

    # =========================
    # MISSING SKILLS
    # =========================

    missing_skills = (
        required_skills - resume_skills
    )

    for skill in sorted(missing_skills):

        recommendations.append(
            f"Consider highlighting {skill} if you genuinely have experience with it."
        )

    # =========================
    # WEAK SEMANTIC EVIDENCE
    # =========================

    for match in semantic_matches:

        similarity = match["similarity"]
        requirement = match["requirement"].lower()

        # Only recommend stronger evidence
        # when the skill isn't already missing.
        if (
            similarity < 60
            and requirement not in missing_skills
        ):

            recommendations.append(
                f"Add stronger evidence for {requirement} in your resume, such as a project or work example."
            )

    # =========================
    # RESUME STRUCTURE
    # =========================

    sections = resume_info["sections"]

    if not sections["education"]:

        recommendations.append(
            "Consider adding an Education section."
        )

    if not sections["experience"]:

        recommendations.append(
            "Consider adding a clear Experience section."
        )

    if not sections["projects"]:

        recommendations.append(
            "Add relevant projects to demonstrate practical experience."
        )

    if not sections["skills"]:

        recommendations.append(
            "Add a dedicated Skills section."
        )

    # =========================
    # EXPERIENCE
    # =========================

    required_experience = (
        job_info["required_experience"]
    )

    resume_experience = (
        resume_info["experience_years"]
    )

    if (
        required_experience > 0
        and resume_experience < required_experience
    ):

        recommendations.append(
            f"The job asks for {required_experience:g} years of experience, while {resume_experience:g} years were detected."
        )

    # =========================
    # DEFAULT
    # =========================

    if not recommendations:

        recommendations.append(
            "Your resume aligns well with the provided job description. Focus on adding measurable achievements to strengthen it further."
        )

    # =========================
    # REMOVE DUPLICATES
    # =========================

    return list(
        dict.fromkeys(
            recommendations
        )
    )