import React from "react";

export default function InterviewComplete({ report, onViewReport, onRestart, onReturnToDashboard }) {
  if (!report) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-warning" role="status"></div>
        <p className="mt-3">Generating your HR interview report...</p>
      </div>
    );
  }

  const categories = report.categories || {};
  const categoryLabels = {
    communication: "Communication",
    clarity: "Clarity",
    confidence: "Confidence",
    professionalism: "Professionalism",
    teamwork: "Teamwork",
    leadership: "Leadership",
    problem_solving: "Problem Solving",
    adaptability: "Adaptability",
    self_awareness: "Self Awareness",
    motivation: "Motivation",
  };

  return (
    <div className="container py-5" style={{ maxWidth: "800px" }}>
      <div className="text-center mb-5">
        <span
          className="badge px-3 py-2 fw-bold text-uppercase mb-2"
          style={{ backgroundColor: "#fef3c7", color: "#92400e", fontSize: "0.85rem", borderRadius: "8px" }}
        >
          Round 3 — HR Interview
        </span>
        <h2 className="fw-bold text-dark mb-2">HR Interview Complete</h2>
        <p className="text-muted">Here's how you performed.</p>
      </div>

      <div
        className="card border-0 shadow-lg p-4 p-md-5 mb-4"
        style={{ borderRadius: "24px", backgroundColor: "#ffffff" }}
      >
        <div className="text-center mb-4">
          <div
            className="mx-auto d-flex align-items-center justify-content-center fw-bold text-white"
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              backgroundColor:
                report.overall_score >= 80 ? "#00d084" : report.overall_score >= 60 ? "#f59e0b" : "#ef4444",
              fontSize: "2.5rem",
            }}
          >
            {report.overall_score}
          </div>
          <h4 className="fw-bold text-dark mt-3">{report.verdict}</h4>
          <p className="text-muted small">Overall HR Score / 100</p>
        </div>

        <div className="row g-3 mb-4">
          {Object.entries(categories).map(([key, value]) => (
            <div className="col-6 col-md-4" key={key}>
              <div className="p-3 bg-light rounded-3 border text-center h-100">
                <h6 className="fw-bold text-dark mb-1">{categoryLabels[key] || key}</h6>
                <div className="fw-bold text-warning">{value}%</div>
              </div>
            </div>
          ))}
        </div>

        {report.topics_covered && report.topics_covered.length > 0 && (
          <div className="mb-4">
            <h6 className="fw-bold text-dark mb-2">Topics Covered</h6>
            <div className="d-flex flex-wrap gap-2">
              {report.topics_covered.map((topic, idx) => (
                <span key={idx} className="badge bg-success px-3 py-2">
                  ✓ {topic}
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

        {report.question_performance && report.question_performance.length > 0 && (
          <div className="mb-4">
            <h6 className="fw-bold text-dark mb-2">Question Performance</h6>
            {report.question_performance.map((qp, idx) => (
              <div
                key={idx}
                className="d-flex justify-content-between align-items-center p-2 bg-light rounded-3 mb-2"
              >
                <span className="small text-dark">
                  Question {idx + 1} — {qp.topic}
                </span>
                <span className="badge bg-warning text-dark px-3 py-2">{qp.score}/10</span>
              </div>
            ))}
          </div>
        )}

        {report.summary && (
          <div className="p-3 bg-light rounded-3 border mb-4">
            <h6 className="fw-bold text-dark mb-1">HR Interview Summary</h6>
            <p className="small text-secondary mb-0" style={{ lineHeight: "1.6" }}>
              {report.summary}
            </p>
          </div>
        )}

        {report.resume_alignment && (
          <div className="p-3 bg-light rounded-3 border mb-4">
            <h6 className="fw-bold text-dark mb-1">Resume & Response Alignment</h6>
            <p className="small text-secondary mb-0" style={{ lineHeight: "1.6" }}>
              {report.resume_alignment}
            </p>
          </div>
        )}

        {report.recommendation && (
          <div className="p-3 rounded-3 border mb-4" style={{ backgroundColor: "#ecfdf5" }}>
            <h6 className="fw-bold text-dark mb-1">Recommendation</h6>
            <p className="small text-secondary mb-0" style={{ lineHeight: "1.6" }}>
              {report.recommendation}
            </p>
          </div>
        )}

        <div className="d-flex flex-column flex-md-row gap-3 mt-4">
          <button onClick={onViewReport} className="btn btn-primary fw-bold py-2 px-4" style={{ borderRadius: "10px" }}>
            View Detailed Report
          </button>
          <button onClick={onRestart} className="btn btn-outline-secondary fw-bold py-2 px-4" style={{ borderRadius: "10px" }}>
            Use Round 3 Again
          </button>
          <button
            onClick={onReturnToDashboard}
            className="btn btn-success fw-bold py-2 px-4 d-flex align-items-center justify-content-center gap-2"
            style={{ borderRadius: "10px" }}
          >
            <i className="fa-solid fa-house"></i>
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
