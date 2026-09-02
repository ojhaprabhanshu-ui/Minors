import React from "react";

const DECISION_STYLES = {
  "Strong Fit": { bg: "#00d084", color: "#ffffff" },
  "Good Fit": { bg: "#84cc16", color: "#ffffff" },
  "Moderate Fit": { bg: "#f59e0b", color: "#ffffff" },
  "Needs Improvement": { bg: "#ef4444", color: "#ffffff" },
};

export default function HRInterviewComplete({ report, onViewReport, onRestart, onBack }) {
  if (!report) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3">Generating your HR interview report...</p>
      </div>
    );
  }

  const decision = report.recommendation?.decision || report.decision || "Moderate Fit";
  const decisionStyle = DECISION_STYLES[decision] || DECISION_STYLES["Moderate Fit"];
  const categories = report.categories || report.soft_skills_summary || {};

  return (
    <div className="container py-5" style={{ maxWidth: "800px" }}>
      <div className="text-center mb-5">
        <span
          className="badge px-3 py-2 fw-bold text-uppercase mb-2"
          style={{ backgroundColor: "#fce7f3", color: "#9d174d", fontSize: "0.85rem", borderRadius: "8px" }}
        >
          Round 3 — HR Interview
        </span>
        <h2 className="fw-bold text-dark mb-2">HR Interview Complete</h2>
        <p className="text-muted">Here's how you performed on the behavioral assessment.</p>
      </div>

      <div className="card border-0 shadow-lg p-4 p-md-5 mb-4" style={{ borderRadius: "24px", backgroundColor: "#ffffff" }}>
        <div className="text-center mb-4">
          <div
            className="mx-auto d-flex align-items-center justify-content-center fw-bold"
            style={{
              width: "140px",
              height: "140px",
              borderRadius: "50%",
              backgroundColor: decisionStyle.bg,
              color: decisionStyle.color,
              fontSize: "1.5rem",
              flexDirection: "column",
            }}
          >
            <span style={{ fontSize: "2.5rem" }}>{report.overall_score ?? 0}</span>
            <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>/ 100</span>
          </div>
          <h4 className="fw-bold text-dark mt-3 mb-1">{decision}</h4>
          <p className="text-muted small mb-0">Overall HR Score</p>
        </div>

        {Object.keys(categories).length > 0 && (
          <div className="row g-3 mb-4">
            {Object.entries(categories).map(([key, value]) => {
              const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
              return (
                <div className="col-6 col-md-4" key={key}>
                  <div className="p-3 bg-light rounded-3 border text-center h-100">
                    <h6 className="fw-bold text-dark mb-1 small">{label}</h6>
                    <div className="fw-bold" style={{ color: "#9d174d" }}>{value}{typeof value === "number" && value <= 10 ? "/10" : "%"}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {report.topics_covered && report.topics_covered.length > 0 && (
          <div className="mb-4">
            <h6 className="fw-bold text-dark mb-2">Topics Covered</h6>
            <div className="d-flex flex-wrap gap-2">
              {report.topics_covered.map((topic, idx) => (
                <span key={idx} className="badge px-3 py-2" style={{ backgroundColor: "#fce7f3", color: "#9d174d" }}>
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {report.strengths && report.strengths.length > 0 && (
          <div className="mb-4">
            <h6 className="fw-bold text-dark mb-2">Strengths</h6>
            <ul className="ps-3">
              {report.strengths.map((s, idx) => (
                <li key={idx} className="text-dark small mb-1">✓ {s}</li>
              ))}
            </ul>
          </div>
        )}

        {report.improvements && report.improvements.length > 0 && (
          <div className="mb-4">
            <h6 className="fw-bold text-dark mb-2">Areas to Improve</h6>
            <ul className="ps-3">
              {report.improvements.map((item, idx) => (
                <li key={idx} className="text-dark small mb-1">• {item}</li>
              ))}
            </ul>
          </div>
        )}

        {report.summary && (
          <div className="p-3 bg-light rounded-3 border mb-4">
            <h6 className="fw-bold text-dark mb-1">Interview Summary</h6>
            <p className="small text-secondary mb-0" style={{ lineHeight: "1.6" }}>{report.summary}</p>
          </div>
        )}

        <div className="d-flex flex-column flex-md-row gap-3 mt-4 flex-wrap">
          <button onClick={onViewReport} className="btn text-white fw-bold py-2 px-4" style={{ backgroundColor: "#ec4899", borderRadius: "10px" }}>
            View Detailed Report
          </button>
          <button onClick={onBack} className="btn btn-primary fw-bold py-2 px-4" style={{ borderRadius: "10px" }}>
            Return to Dashboard
          </button>
          <button onClick={onRestart} className="btn btn-outline-secondary fw-bold py-2 px-4" style={{ borderRadius: "10px" }}>
            Retake HR Interview
          </button>
        </div>
      </div>
    </div>
  );
}
