import React from "react";
import { Link } from "react-router-dom";

export default function ResumeATSResults({ result, onReset }) {
  if (!result) return null;

  const {
    ats_score = 0,
    score_breakdown = {},
    matched_skills = [],
    missing_skills = [],
    recommendations = [],
    resume_analysis = {},
    job_analysis = {},
    semantic_matches = [],
  } = result;

  // Determine score status and color
  const getScoreTheme = (score) => {
    if (score >= 75) {
      return {
        label: "Excellent Match",
        badgeBg: "#d1fae5",
        badgeColor: "#065f46",
        circleColor: "#00d084",
        message: "Your resume is highly optimized for this role and has a high likelihood of passing ATS filters.",
      };
    } else if (score >= 50) {
      return {
        label: "Moderate Match",
        badgeBg: "#fef3c7",
        badgeColor: "#92400e",
        circleColor: "#f59e0b",
        message: "Your resume meets several key requirements, but adding missing skills and keywords will improve your ranking.",
      };
    } else {
      return {
        label: "Needs Optimization",
        badgeBg: "#fee2e2",
        badgeColor: "#991b1b",
        circleColor: "#ef4444",
        message: "Your resume has notable gaps compared to the job requirements. Review the recommendations below to optimize it.",
      };
    }
  };

  const theme = getScoreTheme(ats_score);

  const sections = resume_analysis.sections || {};
  const sectionList = [
    { key: "contact", label: "Contact Info" },
    { key: "skills", label: "Skills Section" },
    { key: "experience", label: "Experience Section" },
    { key: "education", label: "Education Section" },
    { key: "projects", label: "Projects Section" },
  ];

  return (
    <div className="container my-5" id="ats-results-section">
      <div
        className="p-4 p-md-5 bg-white"
        style={{
          borderRadius: "24px",
          boxShadow: "0 12px 40px rgba(0, 0, 0, 0.08)",
          border: "1px solid #e2e8f0",
        }}
      >
        {/* Top Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center pb-4 mb-4 border-bottom">
          <div>
            <span
              className="badge px-3 py-2 fw-semibold mb-2"
              style={{
                backgroundColor: theme.badgeBg,
                color: theme.badgeColor,
                fontSize: "0.85rem",
                borderRadius: "8px",
              }}
            >
              {theme.label}
            </span>
            <h2 className="fw-bold text-dark mb-1" style={{ fontSize: "1.8rem" }}>
              ATS Evaluation Results
            </h2>
            <p className="text-muted mb-0 small">
              Based on algorithmic parsing against the provided job description
            </p>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="btn btn-outline-secondary mt-3 mt-md-0 fw-semibold px-4 py-2"
            style={{ borderRadius: "10px" }}
          >
            <i className="fa-solid fa-rotate-left me-2"></i> Check Another Resume
          </button>
        </div>

        {/* Round 1 DSA OA Banner CTA */}
        <div
          className="p-4 mb-5 text-white rounded-3 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 shadow-sm"
          style={{
            background: "linear-gradient(135deg, #794ea1 0%, #4b226e 100%)",
            borderRadius: "16px",
          }}
        >
          <div>
            <span className="badge bg-warning text-dark fw-bold text-uppercase mb-2" style={{ fontSize: "0.75rem" }}>
              Next Step: Round 1 Assessment
            </span>
            <h4 className="fw-bold mb-1">Proceed to Round 1 — DSA Online Assessment (OA)</h4>
            <p className="small mb-0 opacity-75">
              Your candidate profile has been analyzed. Start your 90-minute DSA coding assessment now.
            </p>
          </div>
          <Link
            to="/oa"
            className="btn text-white fw-bold px-4 py-3 shadow"
            style={{
              backgroundColor: "#00d084",
              borderRadius: "12px",
              whiteSpace: "nowrap",
              fontSize: "1rem",
            }}
          >
            START ROUND 1 OA <i className="fa-solid fa-arrow-right ms-2"></i>
          </Link>
        </div>

        {/* Hero Score Card */}
        <div className="row g-4 align-items-center mb-5">
          <div className="col-lg-4 text-center">
            <div
              className="p-4 d-inline-flex flex-column align-items-center justify-content-center"
              style={{
                width: "220px",
                height: "220px",
                borderRadius: "50%",
                background: `radial-gradient(circle, #ffffff 60%, ${theme.badgeBg} 100%)`,
                border: `8px solid ${theme.circleColor}`,
                boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
              }}
            >
              <span className="text-muted small text-uppercase fw-bold">ATS Score</span>
              <h1 className="display-4 fw-bold mb-0" style={{ color: theme.circleColor }}>
                {ats_score}
                <span className="fs-5 text-muted">/100</span>
              </h1>
              <span
                className="badge mt-2 px-2 py-1"
                style={{ backgroundColor: theme.badgeBg, color: theme.badgeColor }}
              >
                {theme.label}
              </span>
            </div>
          </div>

          <div className="col-lg-8">
            <h4 className="fw-bold text-dark mb-2">Summary Evaluation</h4>
            <p className="text-secondary mb-4" style={{ lineHeight: "1.7" }}>
              {theme.message}
            </p>

            {/* Score Breakdown Grid */}
            <div className="row g-3">
              <div className="col-sm-6">
                <div className="p-3 bg-light rounded-3 border">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="fw-semibold small text-dark">Exact Skills Match</span>
                    <span className="fw-bold text-dark">{score_breakdown.skills ?? 0} / 50</span>
                  </div>
                  <div className="progress" style={{ height: "8px" }}>
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{
                        width: `${Math.min(100, ((score_breakdown.skills ?? 0) / 50) * 100)}%`,
                        backgroundColor: "#00d084",
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="col-sm-6">
                <div className="p-3 bg-light rounded-3 border">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="fw-semibold small text-dark">Semantic Relevance</span>
                    <span className="fw-bold text-dark">{score_breakdown.semantic ?? 0} / 20</span>
                  </div>
                  <div className="progress" style={{ height: "8px" }}>
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{
                        width: `${Math.min(100, ((score_breakdown.semantic ?? 0) / 20) * 100)}%`,
                        backgroundColor: "#3b82f6",
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="col-sm-6">
                <div className="p-3 bg-light rounded-3 border">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="fw-semibold small text-dark">Experience Alignment</span>
                    <span className="fw-bold text-dark">{score_breakdown.experience ?? 0} / 15</span>
                  </div>
                  <div className="progress" style={{ height: "8px" }}>
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{
                        width: `${Math.min(100, ((score_breakdown.experience ?? 0) / 15) * 100)}%`,
                        backgroundColor: "#8b5cf6",
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="col-sm-6">
                <div className="p-3 bg-light rounded-3 border">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="fw-semibold small text-dark">Resume Structure</span>
                    <span className="fw-bold text-dark">{score_breakdown.structure ?? 0} / 15</span>
                  </div>
                  <div className="progress" style={{ height: "8px" }}>
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{
                        width: `${Math.min(100, ((score_breakdown.structure ?? 0) / 15) * 100)}%`,
                        backgroundColor: "#f59e0b",
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Skills Comparison */}
        <div className="row g-4 mb-5">
          {/* Matched Skills */}
          <div className="col-md-6">
            <div
              className="p-4 h-100 rounded-4"
              style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}
            >
              <div className="d-flex align-items-center mb-3">
                <div
                  className="d-flex align-items-center justify-content-center me-2"
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    backgroundColor: "#00d084",
                    color: "#fff",
                  }}
                >
                  <i className="fa-solid fa-check" style={{ fontSize: "12px" }}></i>
                </div>
                <h5 className="fw-bold text-dark mb-0">
                  Matched Skills ({matched_skills.length})
                </h5>
              </div>
              <p className="text-muted small mb-3">
                Skills found in both your resume and the job description.
              </p>
              <div className="d-flex flex-wrap gap-2">
                {matched_skills.length > 0 ? (
                  matched_skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="badge px-3 py-2 fw-medium text-capitalize"
                      style={{
                        backgroundColor: "#dcfce7",
                        color: "#166534",
                        border: "1px solid #86efac",
                        borderRadius: "8px",
                        fontSize: "0.85rem",
                      }}
                    >
                      ✓ {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-muted small italic">No matching keywords detected.</span>
                )}
              </div>
            </div>
          </div>

          {/* Missing Skills */}
          <div className="col-md-6">
            <div
              className="p-4 h-100 rounded-4"
              style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca" }}
            >
              <div className="d-flex align-items-center mb-3">
                <div
                  className="d-flex align-items-center justify-content-center me-2"
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    backgroundColor: "#ef4444",
                    color: "#fff",
                  }}
                >
                  <i className="fa-solid fa-xmark" style={{ fontSize: "12px" }}></i>
                </div>
                <h5 className="fw-bold text-dark mb-0">
                  Missing Skills ({missing_skills.length})
                </h5>
              </div>
              <p className="text-muted small mb-3">
                Keywords requested in the job description that were not detected in your resume.
              </p>
              <div className="d-flex flex-wrap gap-2">
                {missing_skills.length > 0 ? (
                  missing_skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="badge px-3 py-2 fw-medium text-capitalize"
                      style={{
                        backgroundColor: "#fee2e2",
                        color: "#991b1b",
                        border: "1px solid #fca5a5",
                        borderRadius: "8px",
                        fontSize: "0.85rem",
                      }}
                    >
                      + {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-success small fw-semibold">
                    🎉 Excellent! No required skills are missing.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actionable Recommendations */}
        <div className="mb-5">
          <div
            className="p-4 rounded-4"
            style={{
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
            }}
          >
            <div className="d-flex align-items-center mb-3">
              <div
                className="d-flex align-items-center justify-content-center me-2"
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  backgroundColor: "#794ea1",
                  color: "#fff",
                }}
              >
                <i className="fa-solid fa-lightbulb" style={{ fontSize: "12px" }}></i>
              </div>
              <h5 className="fw-bold text-dark mb-0">Actionable Recommendations</h5>
            </div>
            <p className="text-muted small mb-3">
              Follow these steps to boost your ATS match and recruiter visibility:
            </p>

            <div className="d-flex flex-column gap-2">
              {recommendations.length > 0 ? (
                recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white rounded-3 border d-flex align-items-start gap-3"
                    style={{ transition: "all 0.2s ease" }}
                  >
                    <span
                      className="badge rounded-circle p-1 mt-1"
                      style={{
                        backgroundColor: "#ede9fe",
                        color: "#794ea1",
                        minWidth: "22px",
                        height: "22px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "11px",
                      }}
                    >
                      {idx + 1}
                    </span>
                    <span className="text-secondary small fw-medium" style={{ lineHeight: "1.5" }}>
                      {rec}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-3 bg-white rounded-3 border text-success small">
                  Your resume meets all automated evaluation criteria cleanly.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Resume Structure & Experience Audit */}
        <div className="row g-4">
          <div className="col-md-6">
            <div className="p-4 bg-white rounded-4 border h-100">
              <h6 className="fw-bold text-dark mb-3">
                <i className="fa-solid fa-list-check me-2 text-primary"></i> Section Presence Audit
              </h6>
              <div className="d-flex flex-column gap-2">
                {sectionList.map((sec) => {
                  const isPresent = sections[sec.key];
                  return (
                    <div
                      key={sec.key}
                      className="d-flex justify-content-between align-items-center py-2 px-3 rounded-2"
                      style={{ backgroundColor: isPresent ? "#f0fdf4" : "#fef2f2" }}
                    >
                      <span className="small fw-medium text-dark">{sec.label}</span>
                      <span
                        className={`badge ${
                          isPresent ? "bg-success" : "bg-danger"
                        } px-2 py-1`}
                        style={{ fontSize: "10px" }}
                      >
                        {isPresent ? "Detected" : "Missing"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="p-4 bg-white rounded-4 border h-100">
              <h6 className="fw-bold text-dark mb-3">
                <i className="fa-solid fa-briefcase me-2 text-info"></i> Experience Comparison
              </h6>
              <div className="p-3 rounded-3 mb-3" style={{ backgroundColor: "#f8fafc" }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="small text-muted">Detected Resume Experience:</span>
                  <span className="fw-bold text-dark">
                    {resume_analysis.experience_years ?? 0} years
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="small text-muted">Job Required Experience:</span>
                  <span className="fw-bold text-dark">
                    {job_analysis.required_experience ?? 0} years
                  </span>
                </div>
              </div>

              {semantic_matches.length > 0 && (
                <div>
                  <span className="small fw-semibold text-muted text-uppercase d-block mb-2">
                    Top Requirement Match Evidence
                  </span>
                  <div style={{ maxHeight: "150px", overflowY: "auto" }}>
                    {semantic_matches.slice(0, 3).map((item, i) => (
                      <div key={i} className="mb-2 p-2 bg-light rounded border small">
                        <div className="d-flex justify-content-between fw-semibold">
                          <span className="text-capitalize">{item.requirement}</span>
                          <span className="text-primary">{item.similarity}% match</span>
                        </div>
                        {item.evidence && (
                          <div className="text-muted mt-1 fst-italic" style={{ fontSize: "11px" }}>
                            "{item.evidence}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
