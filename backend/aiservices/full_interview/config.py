"""
Centralized configuration for the Full Interview orchestrator.

The orchestrator is intentionally configuration-driven so that:
  * Individual rounds can be enabled / disabled without code changes.
  * Round weights can be tuned per cohort or per role.
  * Final-recommendation thresholds can be calibrated independently.

The single source of truth for the *sequence* of rounds is
`ENABLED_ROUNDS`. Reordering this list reorders the candidate's experience.
"""

# Order in which rounds are presented to the candidate.
ROUND_ORDER = ["oa", "technical", "hr"]

# Which rounds are active. Disable a round here to skip it entirely; the
# orchestrator will mark it SKIPPED and exclude it from the weighted score.
ENABLED_ROUNDS = ["oa", "technical", "hr"]


# ----------------------------------------------------------------------------
# Weights — must sum to 1.0 (validated at import time below)
# ----------------------------------------------------------------------------
# The candidate sees one number. The orchestrator computes it as a weighted
# average of the per-round normalized scores.
FULL_INTERVIEW_WEIGHTS = {
    "oa": 0.30,        # Coding / DSA fundamentals
    "technical": 0.40, # Verbal technical depth
    "hr": 0.30,        # Behavioral / culture fit
}


def _validate_weights():
    total = sum(FULL_INTERVIEW_WEIGHTS.get(r, 0) for r in ROUND_ORDER)
    if abs(total - 1.0) > 1e-6:
        # Auto-normalize to keep the orchestrator resilient to misconfiguration
        if total <= 0:
            norm = {r: 1 / len(ROUND_ORDER) for r in ROUND_ORDER}
        else:
            norm = {r: FULL_INTERVIEW_WEIGHTS.get(r, 0) / total for r in ROUND_ORDER}
        FULL_INTERVIEW_WEIGHTS.clear()
        FULL_INTERVIEW_WEIGHTS.update(norm)


_validate_weights()


# ----------------------------------------------------------------------------
# Per-round metadata used by the orchestrator
# ----------------------------------------------------------------------------
# Each round already has its own duration config inside its own module. The
# values here are *informational* and used for the global "approximate
# interview length" calculation + the progress indicator. They are NOT used
# for timer enforcement — that remains the responsibility of each round.
ROUND_METADATA = {
    "oa": {
        "label": "Round 1 — Coding (DSA)",
        "duration_minutes": 90,
        "passing_threshold": 70,  # from oa.scoring_engine.OA_PASSING_SCORE
        "color": "#f59e0b",
        "icon": "fa-code",
    },
    "technical": {
        "label": "Round 2 — Technical",
        "duration_minutes": 20,
        "passing_threshold": 60,
        "color": "#2563eb",
        "icon": "fa-microchip",
    },
    "hr": {
        "label": "Round 3 — HR",
        "duration_minutes": 30,
        "passing_threshold": 60,
        "color": "#9d174d",
        "icon": "fa-user-tie",
    },
}


# ----------------------------------------------------------------------------
# Final recommendation thresholds (over the weighted overall_score 0-100)
# ----------------------------------------------------------------------------
RECOMMENDATION_THRESHOLDS = {
    "Strong Hire": 85,
    "Hire": 75,
    "Follow-up Required": 60,
    "No Hire": 0,
}


def recommendation_for(overall_score: int) -> str:
    """Map an overall score to a final recommendation label."""
    for label, threshold in RECOMMENDATION_THRESHOLDS.items():
        if overall_score >= threshold:
            return label
    return "No Hire"


# ----------------------------------------------------------------------------
# Integrity risk thresholds (count of HIGH-severity events)
# ----------------------------------------------------------------------------
INTEGRITY_RISK_THRESHOLDS = {
    "LOW": 0,
    "MEDIUM": 2,
    "HIGH": 5,
}
