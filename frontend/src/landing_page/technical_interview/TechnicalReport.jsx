import React from "react";

export default function TechnicalReport({ report, onBack, onRestart }) {
  if (!report) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3">Loading report...</p>
      </div>
    );
  }

  const categories = report.categories || {};
  const categoryLabels = {
    technical_knowledge: "Technical Knowledge",
    problem_solving: "Problem Solving",
    communication: "Communication",
    depth_of_understanding: "Depth of Understanding",
    resume_knowledge: "Resume Knowledge",
    adaptability: "Adaptability",
  };

  return (
    <div className="container py-5" style={{ maxWidth: "900px" }}>
      <div className="text-center mb-5">
        <span
          className="badge px-3 py-2 fw-bold text-uppercase mb-2"
          style={{ backgroundColor: "#dbeafe", color: "#1e40af", fontSize: "0.85rem", borderRadius: "8px" }}
        >
          Technical Interview Report
        </span>
        <h2 className="fw-bold text-dark mb-2">Performance Analysis</h2>
        <p className="text-muted">Detailed breakdown of your technical interview performance.</p>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: "20px", backgroundColor: "#ffffff" }}>
            <h5 className="fw-bold text-dark mb-3">Overall Score</h5>
            <div className="d-flex align-items-center gap-3">
              <span
                className="fw-bold text-white px-4 py-3 rounded-circle"
                style={{
                  backgroundColor: report.overall_score >= 80 ? "#00d084" : report.overall_score >= 60 ? "#f59e0b" : "#ef4444",
                  fontSize: "2rem",
                  width: "80px",
                  height: "80px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {report.overall_score}
              </span>
              <div>
                <h6 className="fw-bold text-dark mb-0">{report.verdict}</h6>
                <p className="text-muted small mb-0">{report.recommendation}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: "20px", backgroundColor: "#ffffff" }}>
            <h5 className="fw-bold text-dark mb-3">Category Breakdown</h5>
            <div className="d-flex flex-column gap-2">
              {Object.entries(categories).map(([key, value]) => (
                <div key={key} className="d-flex justify-content-between align-items-center">
                  <span className="small text-dark">{categoryLabels[key] || key}</span>
                  <div className="d-flex align-items-center gap-2">
                    <div className="progress" style={{ width: "120px", height: "8px", borderRadius: "4px" }}>
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{ width: `${value}%`, backgroundColor: "#00d084" }}
                      ></div>
                    </div>
                    <span className="small fw-bold text-dark">{value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {report.question_performance && report.question_performance.length > 0 && (
        <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: "20px", backgroundColor: "#ffffff" }}>
          <h5 className="fw-bold text-dark mb-3">Question Performance</h5>
          {report.question_performance.map((qp, idx) => (
            <div key={idx} className="p-3 bg-light rounded-3 mb-2">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-bold text-dark">Question {idx + 1} — {qp.topic}</span>
                <span className="badge bg-primary px-3 py-2">{qp.score}/10</span>
              </div>
              {qp.question && (
                <p className="small text-muted mb-1"><strong>Q:</strong> {qp.question}</p>
              )}
              {qp.transcript && (
                <p className="small text-dark mb-1"><strong>Your Answer:</strong> {qp.transcript}</p>
              )}
              {qp.evaluation?.feedback && (
                <p className="small text-secondary mb-0"><strong>Feedback:</strong> {qp.evaluation.feedback}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {report.integrity_summary && (
        <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: "20px", backgroundColor: "#ffffff" }}>
          <h5 className="fw-bold text-dark mb-3">Assessment Integrity</h5>
          <p className="small text-secondary mb-0">{report.integrity_summary}</p>
        </div>
      )}

      {report.summary && (
        <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: "20px", backgroundColor: "#ffffff" }}>
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
