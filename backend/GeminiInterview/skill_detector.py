import re


# ============================================================
# SKILL ALIASES
# ============================================================

SKILL_ALIASES = {

    # Programming Languages
    "python": ["python"],
    "c": ["c programming", "language c"],
    "c++": ["c++", "cpp"],
    "c#": ["c#", "c sharp"],
    "java": ["java"],
    "javascript": ["javascript", "js"],
    "typescript": ["typescript", "ts"],
    "go": ["golang", "go language"],
    "rust": ["rust"],
    "kotlin": ["kotlin"],
    "swift": ["swift"],
    "php": ["php"],
    "ruby": ["ruby"],
    "scala": ["scala"],

    # Python / Data Libraries
    "pandas": ["pandas"],
    "numpy": ["numpy"],
    "matplotlib": ["matplotlib"],
    "seaborn": ["seaborn"],
    "scipy": ["scipy"],
    "plotly": ["plotly"],
    "streamlit": ["streamlit"],

    # Databases
    "sql": ["sql"],
    "mysql": ["mysql"],
    "postgresql": ["postgresql", "postgres"],
    "sqlite": ["sqlite"],
    "oracle": ["oracle database"],
    "mongodb": ["mongodb", "mongo db"],
    "redis": ["redis"],
    "firebase": ["firebase"],
    "cassandra": ["cassandra"],

    # Frontend
    "html": ["html", "html5"],
    "css": ["css", "css3"],
    "react": ["react", "react.js", "reactjs"],
    "angular": ["angular", "angular.js"],
    "vue": ["vue", "vue.js"],
    "next.js": ["next.js", "nextjs"],
    "tailwind css": ["tailwind", "tailwind css"],
    "bootstrap": ["bootstrap"],

    # Backend
    "node.js": ["node.js", "nodejs", "node js"],
    "express.js": ["express.js", "expressjs", "express js"],
    "flask": ["flask"],
    "django": ["django"],
    "fastapi": ["fastapi", "fast api"],
    "spring": ["spring framework"],
    "spring boot": ["spring boot"],
    "asp.net": ["asp.net", "asp net"],
    "laravel": ["laravel"],

    # APIs
    "rest api": [
        "rest api",
        "restful api",
        "restful apis"
    ],
    "graphql": ["graphql"],
    "api": ["api", "apis"],
    "websocket": ["websocket", "web sockets"],

    # AI / ML
    "machine learning": [
        "machine learning",
        "machine-learning"
    ],
    "deep learning": [
        "deep learning",
        "deep-learning"
    ],
    "nlp": [
        "nlp",
        "natural language processing"
    ],
    "computer vision": [
        "computer vision"
    ],
    "tensorflow": ["tensorflow"],
    "pytorch": ["pytorch"],
    "keras": ["keras"],
    "scikit-learn": [
        "scikit-learn",
        "sklearn"
    ],
    "opencv": ["opencv"],
    "hugging face": [
        "hugging face",
        "huggingface"
    ],

    # Data / Analytics
    "power bi": [
        "power bi",
        "powerbi"
    ],
    "tableau": ["tableau"],
    "excel": [
        "excel",
        "microsoft excel"
    ],
    "statistics": [
        "statistics",
        "statistical analysis"
    ],
    "data analysis": [
        "data analysis",
        "data analytics"
    ],
    "data visualization": [
        "data visualization"
    ],

    # Cloud
    "aws": [
        "aws",
        "amazon web services"
    ],
    "azure": [
        "azure",
        "microsoft azure"
    ],
    "google cloud": [
        "google cloud",
        "gcp"
    ],
    "cloud computing": [
        "cloud computing"
    ],

    # DevOps
    "git": ["git"],
    "github": ["github"],
    "gitlab": ["gitlab"],
    "docker": ["docker"],
    "kubernetes": [
        "kubernetes",
        "k8s"
    ],
    "jenkins": ["jenkins"],
    "ci/cd": [
        "ci/cd",
        "continuous integration",
        "continuous deployment"
    ],
    "terraform": ["terraform"],
    "ansible": ["ansible"],

    # Computer Science Fundamentals
    "data structures": [
        "data structures",
        "data structure"
    ],
    "algorithms": [
        "algorithms",
        "algorithm"
    ],
    "dsa": ["dsa"],
    "object oriented programming": [
        "object oriented programming",
        "object-oriented programming",
        "oop"
    ],
    "operating systems": [
        "operating systems",
        "operating system"
    ],
    "computer networks": [
        "computer networks",
        "computer networking",
        "networking"
    ],
    "database management": [
        "database management",
        "dbms",
        "database management systems"
    ],
    "computer architecture": [
        "computer architecture"
    ],

    # Software Engineering
    "system design": ["system design"],
    "design patterns": ["design patterns"],
    "software engineering": ["software engineering"],
    "unit testing": ["unit testing"],
    "pytest": ["pytest"],
    "junit": ["junit"],
    "agile": ["agile"],
    "scrum": ["scrum"],

    # Security
    "cybersecurity": [
        "cybersecurity",
        "cyber security"
    ],
    "authentication": ["authentication"],
    "authorization": ["authorization"],
    "oauth": [
        "oauth",
        "oauth2"
    ],
    "jwt": [
        "jwt",
        "json web token"
    ],

    # Mobile
    "android": ["android"],
    "android development": [
        "android development"
    ],
    "ios": ["ios"],
    "react native": ["react native"],
    "flutter": ["flutter"],
    "dart": ["dart"],

    # Big Data
    "spark": [
        "apache spark",
        "spark"
    ],
    "hadoop": ["hadoop"],
    "kafka": [
        "kafka",
        "apache kafka"
    ],
    "airflow": [
        "airflow",
        "apache airflow"
    ],

    # Other useful technologies
    "linux": ["linux"],
    "bash": [
        "bash",
        "shell scripting"
    ],
    "json": ["json"],
    "xml": ["xml"],
    "yaml": ["yaml"],
    "regex": [
        "regex",
        "regular expressions"
    ],
}


# ============================================================
# DETECT SKILLS
# ============================================================

def detect_skills(resume_text):
    """
    Detect technical skills mentioned in resume text.

    Returns:
        list[str]: detected skills
    """

    if not resume_text:
        return []

    text = resume_text.lower()

    detected_skills = []

    for skill, aliases in SKILL_ALIASES.items():

        for alias in aliases:

            pattern = (
                r"(?<!\w)"
                + re.escape(alias.lower())
                + r"(?!\w)"
            )

            if re.search(pattern, text):
                detected_skills.append(skill)
                break

    return detected_skills


# ============================================================
# TEST
# ============================================================

if __name__ == "__main__":

    test_resume = """
    AI and Data Science student with experience in Python,
    Pandas, NumPy, SQL, PostgreSQL, Flask and REST APIs.

    Built a React and JavaScript web application.
    Used Git and GitHub for version control.

    Also worked on Machine Learning, NLP, Scikit-Learn,
    Power BI, Docker and AWS.
    """

    skills = detect_skills(test_resume)

    print("\nDetected skills:\n")

    for skill in skills:
        print("-", skill)

    print("\nTotal skills detected:", len(skills))