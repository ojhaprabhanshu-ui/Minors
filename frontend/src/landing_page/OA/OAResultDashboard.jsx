import React from "react";

export default function OAResultDashboard({ result, onRestart }) {
  if (!result) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary me-2"></div> Loading Assessment Results...
      </div>
    );
  }

  const score = result.score || 0;
  const qualified = result.qualified || false;
  const breakdown = result.performanceBreakdown || {};
  const integrity = result.integrity || {};
  const feedback = result.aiFeedback || {};
  const questions = result.questionResults || [];

  return (
    <div className="container py-5" style={{ maxWidth: "950px" }}>
      <div
        className="card border-0 shadow-lg overflow-hidden"
        style={{ borderRadius: "24px", background: "#ffffff" }}
      >
        {/* ========================================================= */}
        {/* DASHBOARD HEADER & SCORE BADGE */}
        {/* ========================================================= */}
        <div
          className="p-5 text-center text-white"
          style={{
            background: qualified
              ? "linear-[#10b981], #059669"
              : "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
            backgroundColor: qualified ? "#059669" : "#1e293b",
          }}
        >
          <span
            className="badge px-3 py-2 fw-bold text-uppercase mb-3"
            style={{ backgroundColor: "rgba(255,255,255,0.2)", fontSize: "0.85rem" }}
          >
            Round 1 — Online Assessment Result
          </span>

          <div className="display-3 fw-bold mb-2">{score} / 100</div>

          <div className="d-flex justify-content-center mb-3">
            {qualified ? (
              <span className="badge bg-light text-success fs-6 px-4 py-2 shadow-sm rounded-pill fw-bold">
                ✓ QUALIFIED FOR TECHNICAL ROUND
              </span>
            ) : (
              <span className="badge bg-warning text-dark fs-6 px-4 py-2 shadow-sm rounded-pill fw-bold">
                NOT QUALIFIED (THRESHOLD: {result.passingThreshold || 70}%)
              </span>
            )}
          </div>

          <p className="small mb-0 text-white-50">
            {qualified
              ? "Congratulations! You have demonstrated strong problem-solving fundamentals and qualified for Round 2."
              : "Keep practicing! Focus on foundational DSA data structures and edge-case testing to improve your score."}
          </p>
        </div>

        <div className="card-body p-4 p-md-5">
          {/* ========================================================= */}
          {/* QUESTION PERFORMANCE BREAKDOWN */}
          {/* ========================================================= */}
          <div className="mb-5">
            <h5 className="fw-bold text-dark mb-3 border-bottom pb-2">
              <i className="fa-solid fa-list-check text-primary me-2"></i> Question Performance
            </h5>

            <div className="row g-3">
              {questions.map((q, idx) => (
                <div key={idx} className="col-md-4">
                  <div className="p-3 rounded-3 bg-light border h-100">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="fw-bold text-dark">Q{idx + 1}: {q.title}</span>
                      <span className="badge bg-primary px-2 py-1">{q.score} pts</span>
                    </div>

                    <div className="text-muted small mb-2">{q.topic} • {q.difficulty}</div>

                    <div className="d-flex align-items-center justify-content-between small text-secondary mb-1">
                      <span>Tests Passed:</span>
                      <strong className="text-dark">{q.testsPassed} / {q.totalTests}</strong>
                    </div>

                    <div className="progress" style={{ height: "6px" }}>
                      <div
                        className="progress-bar bg-success"
                        role="progressbar"
                        style={{ width: `${q.totalTests ? (q.testsPassed / q.totalTests) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ========================================================= */}
          {/* PERFORMANCE & INTEGRITY GRID */}
          {/* ========================================================= */}
          <div className="row g-4 mb-5">
            {/* SUB-CATEGORY METRICS */}
            <div className="col-md-6">
              <div className="p-4 rounded-3 border bg-light h-100">
                <h6 className="fw-bold text-dark mb-3">
                  <i className="fa-solid fa-chart-pie text-success me-2"></i> Performance Metrics
                </h6>

                <div className="d-flex flex-column gap-3">
                  <div>
                    <div className="d-flex justify-content-between small fw-bold mb-1">
                      <span>Correctness</span>
                      <span>{breakdown.correctness || 0}%</span>
                    </div>
                    <div className="progress" style={{ height: "8px" }}>
                      <div className="progress-bar bg-success" style={{ width: `${breakdown.correctness || 0}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="d-flex justify-content-between small fw-bold mb-1">
                      <span>Problem Solving</span>
                      <span>{breakdown.problemSolving || 0}%</span>
                    </div>
                    <div className="progress" style={{ height: "8px" }}>
                      <div className="progress-bar bg-info" style={{ width: `${breakdown.problemSolving || 0}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="d-flex justify-content-between small fw-bold mb-1">
                      <span>Time Management</span>
                      <span>{breakdown.timeManagement || 0}%</span>
                    </div>
                    <div className="progress" style={{ height: "8px" }}>
                      <div className="progress-bar bg-warning" style={{ width: `${breakdown.timeManagement || 0}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="d-flex justify-content-between small fw-bold mb-1">
                      <span>Code Quality</span>
                      <span>{breakdown.codeQuality || 0}%</span>
                    </div>
                    <div className="progress" style={{ height: "8px" }}>
                      <div className="progress-bar bg-primary" style={{ width: `${breakdown.codeQuality || 0}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* INTEGRITY RISK & TIMELINE */}
            <div className="col-md-6">
              <div className="p-4 rounded-3 border bg-light h-100">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h6 className="fw-bold text-dark mb-0">
                    <i className="fa-solid fa-shield-halved text-warning me-2"></i> Integrity & Proctoring
                  </h6>
                  <span
                    className={`badge px-3 py-1 ${
                      integrity.riskLevel === "LOW"
                        ? "bg-success"
                        : integrity.riskLevel === "MEDIUM"
                        ? "bg-warning text-dark"
                        : "bg-danger"
                    }`}
                  >
                    Risk Level: {integrity.riskLevel || "LOW"}
                  </span>
                </div>

                <p className="text-secondary small mb-3">
                  Detected events: <strong>{integrity.totalEvents || 0}</strong> recorded proctoring signals.
                </p>

                {integrity.timeline && integrity.timeline.length > 0 ? (
                  <div className="d-flex flex-column gap-2 overflow-auto" style={{ maxHeight: "160px" }}>
                    {integrity.timeline.map((evt, idx) => (
                      <div key={idx} className="p-2 rounded bg-white border small d-flex justify-content-between">
                        <span className="fw-bold text-secondary">{evt.timestamp}</span>
                        <span className="text-dark">{evt.type}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-success small p-3 bg-white rounded border text-center">
                    ✓ Clean Proctoring Record — No suspicious tab switching or screen share disruptions detected.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* GEMINI AI QUALITATIVE FEEDBACK */}
          {/* ========================================================= */}
          <div className="p-4 rounded-3 border" style={{ backgroundColor: "#f8fafc" }}>
            <h5 className="fw-bold text-dark mb-3">
              <i className="fa-solid fa-robot me-2" style={{ color: "#794ea1" }}></i> Gemini AI Coach Feedback
            </h5>

            <div className="row g-4">
              <div className="col-md-6">
                <h6 className="fw-bold text-success mb-2">Strengths</h6>
                <ul className="ps-3 text-secondary small mb-0">
                  {feedback.strengths?.map((s, i) => (
                    <li key={i} className="mb-1">{s}</li>
                  ))}
                </ul>
              </div>

              <div className="col-md-6">
                <h6 className="fw-bold text-danger mb-2">Areas for Improvement</h6>
                <ul className="ps-3 text-secondary small mb-0">
                  {feedback.weaknesses?.map((w, i) => (
                    <li key={i} className="mb-1">{w}</li>
                  ))}
                </ul>
              </div>

              <div className="col-12 border-top pt-3">
                <h6 className="fw-bold text-dark mb-1">Recommended Preparation Topics</h6>
                <div className="d-flex flex-wrap gap-2 pt-1">
                  {feedback.recommendedPreparation?.map((topic, i) => (
                    <span key={i} className="badge bg-white text-dark border px-3 py-2">
                      🎯 {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 text-center">
            <button
              onClick={onRestart}
              className="btn btn-outline-secondary px-5 py-3 fw-bold shadow-sm"
              style={{ borderRadius: "12px" }}
            >
              Start New Assessment <i className="fa-solid fa-rotate-right ms-2"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
