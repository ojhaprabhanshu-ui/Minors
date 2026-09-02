"""
Skills extraction service.

A deterministic, fast (no LLM call) skill profiler that:
  1. Starts from any skills the candidate declared (in their profile or ATS result)
  2. Scans the resume text for the same skills plus additional skills from a
     curated taxonomy
  3. Categorizes each skill as primary / supporting / exposure
  4. Returns a normalized `skill_profile` dict that the orchestrator injects
     into every round's question-generation prompt

This solves two problems:
  * Even if the candidate's profile.skills is empty (because the signup flow
    doesn't collect skills), the resume still yields a meaningful profile.
  * Every round (OA, Technical, HR) sees the SAME normalized skill profile,
    so questions are coherent across rounds and the cumulative report can
    measure declared-vs-demonstrated skill coverage.
"""

import re
from collections import Counter
from typing import Any, Dict, Iterable, List, Optional, Set, Tuple

# ----------------------------------------------------------------------------
# Curated taxonomy
# ----------------------------------------------------------------------------
# Each entry: canonical name -> {category, aliases, weight_hint}
# weight_hint is the typical importance for software engineering roles
# (higher = more central to the role). The orchestrator uses this to decide
# which skills to probe first when generating questions.

SKILL_TAXONOMY: Dict[str, Dict[str, Any]] = {
    # Programming languages
    "python": {"category": "language", "weight": 0.9, "aliases": ["python3", "py"]},
    "javascript": {"category": "language", "weight": 0.85, "aliases": ["js", "es6", "ecmascript"]},
    "typescript": {"category": "language", "weight": 0.85, "aliases": ["ts"]},
    "java": {"category": "language", "weight": 0.85, "aliases": ["jdk", "jvm"]},
    "kotlin": {"category": "language", "weight": 0.7, "aliases": []},
    "swift": {"category": "language", "weight": 0.6, "aliases": []},
    "go": {"category": "language", "weight": 0.8, "aliases": ["golang"]},
    "rust": {"category": "language", "weight": 0.7, "aliases": []},
    "c++": {"category": "language", "weight": 0.8, "aliases": ["cpp", "c plus plus"]},
    "c": {"category": "language", "weight": 0.7, "aliases": []},
    "c#": {"category": "language", "weight": 0.75, "aliases": ["csharp", ".net", "dotnet"]},
    "ruby": {"category": "language", "weight": 0.6, "aliases": []},
    "php": {"category": "language", "weight": 0.55, "aliases": []},
    "scala": {"category": "language", "weight": 0.6, "aliases": []},
    "r": {"category": "language", "weight": 0.5, "aliases": ["rlang"]},
    "sql": {"category": "language", "weight": 0.85, "aliases": ["t-sql", "plsql"]},
    "bash": {"category": "language", "weight": 0.5, "aliases": ["shell", "sh", "zsh"]},

    # Frontend frameworks
    "react": {"category": "frontend", "weight": 0.9, "aliases": ["reactjs", "react.js"]},
    "angular": {"category": "frontend", "weight": 0.7, "aliases": ["angularjs"]},
    "vue": {"category": "frontend", "weight": 0.7, "aliases": ["vuejs", "vue.js"]},
    "svelte": {"category": "frontend", "weight": 0.5, "aliases": []},
    "next.js": {"category": "frontend", "weight": 0.8, "aliases": ["nextjs", "next"]},
    "redux": {"category": "frontend", "weight": 0.7, "aliases": []},
    "tailwind": {"category": "frontend", "weight": 0.6, "aliases": ["tailwindcss"]},
    "html": {"category": "frontend", "weight": 0.7, "aliases": ["html5"]},
    "css": {"category": "frontend", "weight": 0.7, "aliases": ["css3"]},

    # Backend frameworks
    "node.js": {"category": "backend", "weight": 0.85, "aliases": ["nodejs", "node"]},
    "express": {"category": "backend", "weight": 0.7, "aliases": ["expressjs", "express.js"]},
    "django": {"category": "backend", "weight": 0.75, "aliases": []},
    "flask": {"category": "backend", "weight": 0.7, "aliases": []},
    "fastapi": {"category": "backend", "weight": 0.7, "aliases": []},
    "spring": {"category": "backend", "weight": 0.8, "aliases": ["spring boot", "springboot"]},
    "rails": {"category": "backend", "weight": 0.6, "aliases": ["ruby on rails"]},
    "laravel": {"category": "backend", "weight": 0.5, "aliases": []},
    "graphql": {"category": "backend", "weight": 0.7, "aliases": ["apollo graphql"]},

    # Databases
    "postgresql": {"category": "database", "weight": 0.85, "aliases": ["postgres", "psql"]},
    "mysql": {"category": "database", "weight": 0.8, "aliases": []},
    "mongodb": {"category": "database", "weight": 0.7, "aliases": ["mongo"]},
    "redis": {"category": "database", "weight": 0.75, "aliases": []},
    "elasticsearch": {"category": "database", "weight": 0.65, "aliases": ["elastic search"]},
    "dynamodb": {"category": "database", "weight": 0.65, "aliases": []},
    "cassandra": {"category": "database", "weight": 0.5, "aliases": []},
    "bigquery": {"category": "database", "weight": 0.6, "aliases": []},
    "snowflake": {"category": "database", "weight": 0.6, "aliases": []},

    # Cloud & DevOps
    "aws": {"category": "cloud", "weight": 0.85, "aliases": ["amazon web services"]},
    "azure": {"category": "cloud", "weight": 0.8, "aliases": ["microsoft azure"]},
    "gcp": {"category": "cloud", "weight": 0.8, "aliases": ["google cloud", "google cloud platform"]},
    "docker": {"category": "devops", "weight": 0.8, "aliases": []},
    "kubernetes": {"category": "devops", "weight": 0.8, "aliases": ["k8s"]},
    "terraform": {"category": "devops", "weight": 0.7, "aliases": []},
    "ansible": {"category": "devops", "weight": 0.55, "aliases": []},
    "jenkins": {"category": "devops", "weight": 0.6, "aliases": []},
    "ci/cd": {"category": "devops", "weight": 0.7, "aliases": ["cicd", "continuous integration"]},
    "linux": {"category": "devops", "weight": 0.7, "aliases": []},

    # CS fundamentals (interview-relevant)
    "data structures": {"category": "fundamentals", "weight": 0.95, "aliases": ["ds", "data structures and algorithms"]},
    "algorithms": {"category": "fundamentals", "weight": 0.95, "aliases": ["algo", "dsa"]},
    "system design": {"category": "fundamentals", "weight": 0.95, "aliases": ["system-design", "hld", "lld", "high level design", "low level design"]},
    "object-oriented programming": {"category": "fundamentals", "weight": 0.8, "aliases": ["oop", "object oriented"]},
    "design patterns": {"category": "fundamentals", "weight": 0.75, "aliases": []},
    "operating systems": {"category": "fundamentals", "weight": 0.7, "aliases": ["os"]},
    "computer networks": {"category": "fundamentals", "weight": 0.6, "aliases": ["networking", "computer network"]},
    "distributed systems": {"category": "fundamentals", "weight": 0.85, "aliases": []},
    "microservices": {"category": "fundamentals", "weight": 0.8, "aliases": []},
    "rest api": {"category": "fundamentals", "weight": 0.75, "aliases": ["rest", "restful"]},

    # Data / ML
    "machine learning": {"category": "data", "weight": 0.85, "aliases": ["ml"]},
    "deep learning": {"category": "data", "weight": 0.8, "aliases": ["dl"]},
    "tensorflow": {"category": "data", "weight": 0.7, "aliases": []},
    "pytorch": {"category": "data", "weight": 0.7, "aliases": []},
    "pandas": {"category": "data", "weight": 0.65, "aliases": []},
    "numpy": {"category": "data", "weight": 0.6, "aliases": []},
    "data engineering": {"category": "data", "weight": 0.7, "aliases": []},
    "etl": {"category": "data", "weight": 0.6, "aliases": []},

    # Mobile
    "android": {"category": "mobile", "weight": 0.6, "aliases": []},
    "ios": {"category": "mobile", "weight": 0.6, "aliases": []},
    "react native": {"category": "mobile", "weight": 0.6, "aliases": ["reactnative"]},
    "flutter": {"category": "mobile", "weight": 0.6, "aliases": []},

    # Soft / process (HR-relevant)
    "agile": {"category": "process", "weight": 0.5, "aliases": ["scrum", "kanban"]},
    "leadership": {"category": "process", "weight": 0.5, "aliases": ["mentorship", "team lead"]},
    "code review": {"category": "process", "weight": 0.5, "aliases": []},
    "testing": {"category": "process", "weight": 0.6, "aliases": ["unit testing", "integration testing"]},
}

# Build a flat alias -> canonical map for O(1) lookup during scanning
_ALIAS_TO_CANONICAL: List[Tuple[str, str]] = []
for canonical, meta in SKILL_TAXONOMY.items():
    _ALIAS_TO_CANONICAL.append((canonical, canonical))
    for alias in meta.get("aliases", []):
        _ALIAS_TO_CANONICAL.append((alias, canonical))

# Sort by alias length descending so the longest match wins during scanning
# (e.g. "react native" before "react", "spring boot" before "spring")
_ALIAS_TO_CANONICAL.sort(key=lambda x: -len(x[0]))


# ----------------------------------------------------------------------------
# Public API
# ----------------------------------------------------------------------------

def extract_skill_profile(
    profile: Optional[Dict[str, Any]],
    resume_text: Optional[str],
) -> Dict[str, Any]:
    """
    Build a normalized skill profile for the candidate.

    Inputs:
        profile: candidate_profile dict (may contain a 'skills' key)
        resume_text: full resume text (may be empty)

    Returns:
        {
            "primary":    [skill_name, ...]   # top skills the candidate declared or emphasized
            "supporting": [skill_name, ...]   # secondary skills
            "exposure":   [skill_name, ...]   # mentioned briefly
            "categories": {category: [skill, ...], ...}
            "raw_declared": [skill_name, ...] # whatever the user typed
            "source":     "declared+resume" | "declared" | "resume" | "default"
        }
    """
    declared: List[str] = []
    if isinstance(profile, dict):
        s = profile.get("skills") or []
        if isinstance(s, list):
            declared = [str(x).strip() for x in s if str(x).strip()]
        elif isinstance(s, str):
            declared = [x.strip() for x in re.split(r"[,;|]", s) if x.strip()]

    resume_text = (resume_text or "").strip()
    resume_counts: Counter = _scan_resume(resume_text)

    canonical_declared = [_canonicalize(s) for s in declared]
    canonical_declared = [c for c in canonical_declared if c]

    # Combine declared + resume. Declared skills get +2 weight, resume hits +1.
    combined: Dict[str, float] = {}
    for c in canonical_declared:
        meta = SKILL_TAXONOMY.get(c, {})
        combined[c] = combined.get(c, 0) + 2.0 + float(meta.get("weight", 0.5))
    for c, count in resume_counts.items():
        meta = SKILL_TAXONOMY.get(c, {})
        combined[c] = combined.get(c, 0) + (count * 0.5) + float(meta.get("weight", 0.5))

    if not combined:
        # Last-resort default to keep the round generators from failing
        combined = {k: SKILL_TAXONOMY[k]["weight"] for k in ("python", "data structures", "algorithms", "system design") if k in SKILL_TAXONOMY}

    sorted_skills = sorted(combined.items(), key=lambda kv: -kv[1])

    primary = [s for s, _ in sorted_skills[:3]]
    supporting = [s for s, _ in sorted_skills[3:8]]
    exposure = [s for s, _ in sorted_skills[8:15]]

    categories: Dict[str, List[str]] = {}
    for s in (primary + supporting + exposure):
        cat = SKILL_TAXONOMY.get(s, {}).get("category", "other")
        categories.setdefault(cat, []).append(s)

    if declared and resume_counts:
        source = "declared+resume"
    elif declared:
        source = "declared"
    elif resume_counts:
        source = "resume"
    else:
        source = "default"

    return {
        "primary": primary,
        "supporting": supporting,
        "exposure": exposure,
        "categories": categories,
        "raw_declared": declared,
        "source": source,
    }


def skill_profile_for_prompt(skill_profile: Dict[str, Any]) -> str:
    """Render the skill profile as a short prompt block the question
    generators can append to their context. Keeps the prompt compact while
    giving the LLM a clear priority order."""
    lines = ["=== CANDIDATE SKILL PROFILE (dynamic, from resume) ==="]
    lines.append(f"Source: {skill_profile.get('source', 'unknown')}")
    if skill_profile.get("primary"):
        lines.append(f"Primary skills (probe first): {', '.join(skill_profile['primary'])}")
    if skill_profile.get("supporting"):
        lines.append(f"Supporting skills: {', '.join(skill_profile['supporting'])}")
    if skill_profile.get("exposure"):
        lines.append(f"Exposure (brief mention): {', '.join(skill_profile['exposure'])}")
    cats = skill_profile.get("categories", {})
    if cats:
        cat_summary = "; ".join(f"{k}={', '.join(v[:4])}" for k, v in cats.items())
        lines.append(f"By category: {cat_summary}")
    return "\n".join(lines)


# ----------------------------------------------------------------------------
# Internals
# ----------------------------------------------------------------------------

def _canonicalize(raw: str) -> Optional[str]:
    """Return the canonical skill name for a free-text string, or None."""
    if not raw:
        return None
    needle = raw.lower().strip()
    for alias, canonical in _ALIAS_TO_CANONICAL:
        if alias == needle:
            return canonical
    # Substring fallback (only match if the alias is a clear substring)
    for alias, canonical in _ALIAS_TO_CANONICAL:
        if len(alias) >= 3 and alias in needle:
            return canonical
    return None


def _scan_resume(resume_text: str) -> Counter:
    """Scan the resume for occurrences of any known skill (canonical form)."""
    if not resume_text:
        return Counter()
    text = " " + resume_text.lower() + " "
    counts: Counter = Counter()
    for alias, canonical in _ALIAS_TO_CANONICAL:
        # Use word boundaries for short aliases to avoid false positives
        if len(alias) <= 3:
            pattern = r"(?<![\w])" + re.escape(alias) + r"(?![\w])"
        else:
            pattern = r"(?<![\w])" + re.escape(alias) + r"(?![\w])"
        matches = re.findall(pattern, text)
        if matches:
            # Cap at 5 to prevent a single mention in a project list from
            # dominating the ranking
            counts[canonical] = min(5, len(matches))
    return counts
