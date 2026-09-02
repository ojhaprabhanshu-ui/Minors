import React from "react";

const PROFICIENCY_LABELS = {
  data_structures_and_algorithms: "Data Structures & Algorithms",
  system_design_and_architecture: "System Design & Architecture",
  databases_and_storage: "Databases & Storage",
  networking_and_os: "Networking & OS",
  language_specific_depth: "Language-Specific Depth",
  distributed_systems_thinking: "Distributed Systems Thinking",
};

const DECISION_STYLES = {
  Hire: { bg: "#00d084", label: "Recommended to Hire" },
  "Follow-up Required": { bg: "#f59e0b", label: "Follow-up Required" },
  "No Hire": { bg: "#ef4444", label: "Not Recommended" },
};

export default function TechnicalReport({ report, onBack, onRestart }) {
  if (!report) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3">Loading report...</p>
      </div>
    );
  }

  const proficiency = report.technical_proficiency_summary || {};
  const depth = report.depth_of_understanding || {};
  const strengthsGaps = report.strengths_and_knowledge_gaps || {};
  const recommendation = report.recommendation || {};
  const decision = recommendation.decision || "Follow-up Required";
  const decisionStyle = DECISION_STYLES[decision] || DECISION_STYLES["Follow-up Required"];

  return (
    <div className="container py-5" style={{ maxWidth: "960px" }}>
      <div className="text-center mb-5">
        <span
          className="badge px-3 py-2 fw-bold text-uppercase mb-2"
          style={{ backgroundColor: "#dbeafe", color: "#1e40af", fontSize: "0.85rem", borderRadius: "8px" }}
        >
          Round 2 Technical Assessment
        </span>
        <h2 className="fw-bold text-dark mb-2">Technical Assessment Report</h2>
        <p className="text-muted">A detailed analysis of your technical performance, depth, and final recommendation.</p>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-5">
          <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: "20px" }}>
            <h5 className="fw-bold text-dark mb-3">Overall Score</h5>
            <div className="d-flex align-items-center gap-3">
              <span
                className="fw-bold text-white px-4 py-3 rounded-circle"
                style={{
                  backgroundColor:
                    (report.overall_score || 0) >= 80
                      ? "#00d084"
                      : (report.overall_score || 0) >= 60
                      ? "#f59e0b"
                      : "#ef4444",
                  fontSize: "2rem",
                  width: "80px",
                  height: "80px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {report.overall_score ?? 0}
              </span>
              <div>
                <h6 className="fw-bold text-dark mb-0">{report.verdict || "Performance Summary"}</h6>
                <p className="text-muted small mb-0">{decisionStyle.label}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-7">
          <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: "20px" }}>
            <div className="d-flex align-items-center gap-2 mb-3">
              <h5 className="fw-bold text-dark mb-0">Final Recommendation</h5>
              <span
                className="badge text-white px-3 py-2"
                style={{ backgroundColor: decisionStyle.bg, borderRadius: "8px" }}
              >
                {decision}
              </span>
            </div>
            <p className="small text-secondary mb-2" style={{ lineHeight: "1.6" }}>
              {recommendation.rationale || "Recommendation rationale unavailable."}
            </p>
            {Array.isArray(recommendation.evidence) && recommendation.evidence.length > 0 && (
              <div>
                <p className="small fw-bold text-dark mb-1">Supporting Evidence:</p>
                <ul className="small text-secondary mb-0">
                  {recommendation.evidence.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: "20px" }}>
        <h5 className="fw-bold text-dark mb-3">Technical Proficiency Summary</h5>
        <div className="row g-3">
          {Object.entries(PROFICIENCY_LABELS).map(([key, label]) => {
            const value = proficiency[key] ?? 0;
            return (
              <div key={key} className="col-md-6">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="small text-dark">{label}</span>
                  <span className="small fw-bold text-dark">{value}%</span>
                </div>
                <div className="progress" style={{ height: "8px", borderRadius: "4px" }}>
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{ width: `${value}%`, backgroundColor: "#2563eb" }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: "20px" }}>
        <div className="d-flex align-items-center justify-content-between mb-2">
          <h5 className="fw-bold text-dark mb-0">Depth of Understanding</h5>
          <span
            className="badge text-white px-3 py-2"
            style={{
              backgroundColor: depth.level === "WHY" ? "#00d084" : depth.level === "HOW" ? "#f59e0b" : "#94a3b8",
              borderRadius: "8px",
            }}
          >
            {depth.level || "SHALLOW"} — {depth.score ?? 0}/100
          </span>
        </div>
        <p className="small text-secondary mb-2" style={{ lineHeight: "1.6" }}>
          {depth.analysis || "Depth analysis unavailable."}
        </p>
        {Array.isArray(depth.evidence) && depth.evidence.length > 0 && (
          <ul className="small text-secondary mb-0">
            {depth.evidence.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: "20px" }}>
            <h5 className="fw-bold text-dark mb-3">Strengths</h5>
            {strengthsGaps.strengths && strengthsGaps.strengths.length > 0 ? (
              <ul className="small text-secondary mb-0" style={{ lineHeight: "1.7" }}>
                {strengthsGaps.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            ) : (
              <p className="small text-muted mb-0">No standout strengths identified.</p>
            )}
          </div>
        </div>
        <div className="col-md-6">
          <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: "20px" }}>
            <h5 className="fw-bold text-dark mb-3">Knowledge Gaps</h5>
            {strengthsGaps.knowledge_gaps && strengthsGaps.knowledge_gaps.length > 0 ? (
              <ul className="small text-secondary mb-0" style={{ lineHeight: "1.7" }}>
                {strengthsGaps.knowledge_gaps.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            ) : (
              <p className="small text-muted mb-0">No critical knowledge gaps identified.</p>
            )}
          </div>
        </div>
      </div>

      {report.question_performance && report.question_performance.length > 0 && (
        <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: "20px" }}>
          <h5 className="fw-bold text-dark mb-3">Question-by-Question Performance</h5>
          {report.question_performance.map((qp, idx) => (
            <div key={idx} className="p-3 bg-light rounded-3 mb-2">
              <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                <span className="fw-bold text-dark">
                  Q{idx + 1} — {qp.topic}
                  {qp.difficulty ? ` (${qp.difficulty})` : ""}
                </span>
                <span className="badge bg-primary px-3 py-2">{qp.score ?? 0}/10</span>
              </div>
              {qp.question && (
                <p className="small text-muted mb-1"><strong>Q:</strong> {qp.question}</p>
              )}
              {qp.candidate_answer && (
                <p className="small text-dark mb-1"><strong>Your Answer:</strong> {qp.candidate_answer}</p>
              )}
              {qp.feedback && (
                <p className="small text-secondary mb-0"><strong>Feedback:</strong> {qp.feedback}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {report.integrity_summary && (
        <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: "20px" }}>
          <h5 className="fw-bold text-dark mb-3">Assessment Integrity</h5>
          <p className="small text-secondary mb-0">{report.integrity_summary}</p>
        </div>
      )}

      {report.summary && (
        <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: "20px" }}>
          <h5 className="fw-bold text-dark mb-3">Interview Summary</h5>
          <p className="small text-secondary mb-0" style={{ lineHeight: "1.6" }}>{report.summary}</p>
        </div>
      )}

      <div className="d-flex flex-column flex-md-row gap-3 mt-4">
        <button onClick={onBack} className="btn btn-primary fw-bold py-2 px-4" style={{ borderRadius: "10px" }}>
          Return to Dashboard
        </button>
        <button onClick={onRestart} className="btn btn-outline-secondary fw-bold py-2 px-4" style={{ borderRadius: "10px" }}>
          Use Round 2 Again
        </button>
      </div>
    </div>
  );
}
