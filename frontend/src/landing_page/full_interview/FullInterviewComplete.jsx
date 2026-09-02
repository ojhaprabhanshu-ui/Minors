import React from "react";

const RECOMMENDATION_STYLES = {
  "Strong Hire": { bg: "#00d084", icon: "fa-rocket" },
  "Hire": { bg: "#22c55e", icon: "fa-thumbs-up" },
  "Follow-up Required": { bg: "#f59e0b", icon: "fa-magnifying-glass" },
  "No Hire": { bg: "#ef4444", icon: "fa-circle-xmark" },
};

export default function FullInterviewComplete({ session, onViewReport, onBack }) {
  if (!session) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3">Synthesizing your final report...</p>
      </div>
    );
  }

  const overall = session.overall_score;
  const recommendation = session.final_recommendation || "Follow-up Required";
  const style = RECOMMENDATION_STYLES[recommendation] || RECOMMENDATION_STYLES["Follow-up Required"];

  return (
    <div className="container py-5" style={{ maxWidth: "800px" }}>
      <div className="text-center mb-5">
        <span
          className="badge px-3 py-2 fw-bold text-uppercase mb-2"
          style={{ backgroundColor: "#ede9fe", color: "#5b21b6", fontSize: "0.85rem", borderRadius: "8px" }}
        >
          Full Interview Complete
        </span>
        <h2 className="fw-bold text-dark mb-2">All rounds completed.</h2>
        <p className="text-muted">Here is your overall performance profile.</p>
      </div>

      <div className="card border-0 shadow-lg p-4 p-md-5 mb-4" style={{ borderRadius: "24px" }}>
        <div className="text-center mb-4">
          <div
            className="mx-auto d-flex align-items-center justify-content-center fw-bold"
            style={{
              width: "140px",
              height: "140px",
              borderRadius: "50%",
              backgroundColor: style.bg,
              color: "#ffffff",
              fontSize: "2.5rem",
              flexDirection: "column",
            }}
          >
            <span style={{ fontSize: "2.5rem" }}>{Math.round(overall || 0)}</span>
            <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>/ 100</span>
          </div>
          <h4 className="fw-bold text-dark mt-3 mb-1">
            <i className={`fa-solid ${style.icon} me-2`}></i>
            {recommendation}
          </h4>
          <p className="text-muted small mb-0">Weighted across all rounds</p>
        </div>

        <div className="d-flex flex-column flex-md-row gap-3 mt-4 flex-wrap justify-content-center">
          <button
            onClick={onViewReport}
            className="btn text-white fw-bold py-2 px-4"
            style={{ backgroundColor: "#7c3aed", borderRadius: "10px" }}
          >
            <i className="fa-solid fa-chart-pie me-2"></i>
            View Detailed Report
          </button>
          <button
            onClick={onBack}
            className="btn btn-primary fw-bold py-2 px-4"
            style={{ borderRadius: "10px" }}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
