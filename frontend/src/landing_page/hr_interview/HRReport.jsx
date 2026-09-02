import React from "react";

const SOFT_SKILL_LABELS = {
  communication: "Communication",
  clarity: "Clarity",
  confidence: "Confidence",
  professionalism: "Professionalism",
  relevance: "Relevance",
  self_awareness: "Self-Awareness",
  depth: "Depth of Reflection",
};

const FIT_STYLES = {
  "Strong Fit": { bg: "#00d084", color: "#ffffff", label: "Strong Cultural Fit" },
  "Good Fit": { bg: "#84cc16", color: "#ffffff", label: "Good Cultural Fit" },
  "Moderate Fit": { bg: "#f59e0b", color: "#ffffff", label: "Moderate Fit — Follow-up Recommended" },
  "Needs Improvement": { bg: "#ef4444", color: "#ffffff", label: "Needs Improvement" },
};

export default function HRReport({ report, onBack, onRestart }) {
  if (!report) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3">Loading report...</p>
      </div>
    );
  }

  const decision = report.recommendation?.decision || report.decision || "Moderate Fit";
  const decisionStyle = FIT_STYLES[decision] || FIT_STYLES["Moderate Fit"];
  const softSkills = report.soft_skills_summary || report.categories || {};
  const resumeAlignment = report.resume_alignment || {};
  const strengthsGaps = report.strengths_and_knowledge_gaps || {
    strengths: report.strengths || [],
    knowledge_gaps: report.improvements || [],
  };

  return (
    <div className="container py-5" style={{ maxWidth: "960px" }}>
      <div className="text-center mb-5">
        <span
          className="badge px-3 py-2 fw-bold text-uppercase mb-2"
          style={{ backgroundColor: "#fce7f3", color: "#9d174d", fontSize: "0.85rem", borderRadius: "8px" }}
        >
          Round 3 — HR Assessment
        </span>
        <h2 className="fw-bold text-dark mb-2">HR Interview Report</h2>
        <p className="text-muted">A detailed analysis of your behavioral, communication, and culture-fit signals.</p>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-5">
          <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: "20px" }}>
            <h5 className="fw-bold text-dark mb-3">Overall HR Score</h5>
            <div className="d-flex align-items-center gap-3">
              <span
                className="fw-bold d-flex align-items-center justify-content-center"
                style={{
                  backgroundColor: decisionStyle.bg,
                  color: decisionStyle.color,
                  fontSize: "2rem",
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                }}
              >
                {report.overall_score ?? 0}
              </span>
              <div>
                <h6 className="fw-bold text-dark mb-0">{decisionStyle.label}</h6>
                <p className="text-muted small mb-0">Score / 100</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-7">
          <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: "20px" }}>
            <h5 className="fw-bold text-dark mb-3">Final Recommendation</h5>
            <p className="small text-secondary mb-2" style={{ lineHeight: "1.6" }}>
              {report.recommendation?.rationale || report.summary || "Recommendation rationale unavailable."}
            </p>
            {Array.isArray(report.recommendation?.evidence) && report.recommendation.evidence.length > 0 && (
              <div>
                <p className="small fw-bold text-dark mb-1">Supporting Evidence:</p>
                <ul className="small text-secondary mb-0">
                  {report.recommendation.evidence.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {Object.keys(softSkills).length > 0 && (
        <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: "20px" }}>
          <h5 className="fw-bold text-dark mb-3">Soft Skills Summary</h5>
          <div className="row g-3">
            {Object.entries(SOFT_SKILL_LABELS).map(([key, label]) => {
              const raw = softSkills[key];
              if (raw === undefined) return null;
              const value = typeof raw === "number" ? (raw <= 10 ? raw * 10 : raw) : 0;
              return (
                <div className="col-md-6" key={key}>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="small text-dark">{label}</span>
                    <span className="small fw-bold text-dark">{Math.round(value)}%</span>
                  </div>
                  <div className="progress" style={{ height: "8px", borderRadius: "4px" }}>
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{ width: `${value}%`, backgroundColor: "#ec4899" }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {Object.keys(resumeAlignment).length > 0 && (
        <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: "20px" }}>
          <h5 className="fw-bold text-dark mb-3">Resume Alignment</h5>
          {typeof resumeAlignment === "object" && (
            <div className="row g-3">
              {Object.entries(resumeAlignment).map(([k, v]) => (
                <div className="col-md-6" key={k}>
                  <p className="small fw-bold text-dark mb-1">{k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</p>
                  <p className="small text-secondary mb-0" style={{ lineHeight: "1.6" }}>{String(v)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
            <h5 className="fw-bold text-dark mb-3">Areas to Develop</h5>
            {strengthsGaps.knowledge_gaps && strengthsGaps.knowledge_gaps.length > 0 ? (
              <ul className="small text-secondary mb-0" style={{ lineHeight: "1.7" }}>
                {strengthsGaps.knowledge_gaps.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            ) : (
              <p className="small text-muted mb-0">No critical development areas identified.</p>
            )}
          </div>
        </div>
      </div>

      {report.question_performance && report.question_performance.length > 0 && (
        <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: "20px" }}>
          <h5 className="fw-bold text-dark mb-3">Question-by-Question Performance</h5>
          {report.question_performance.map((qp, idx) => {
            // The HR backend historically stored the candidate's transcript
            // under `transcript`; the front-end used to read `candidate_answer`.
            // Read both so we never silently drop the candidate's words.
            const candidateAnswer =
              qp.candidate_answer ||
              qp.transcript ||
              (qp.evaluation && qp.evaluation.transcript) ||
              "";
            const strengths =
              qp.strengths || (qp.evaluation && qp.evaluation.strengths) || [];
            const weaknesses =
              qp.weaknesses || (qp.evaluation && qp.evaluation.weaknesses) || [];
            const feedback = qp.feedback || (qp.evaluation && qp.evaluation.feedback) || "";
            return (
              <div key={idx} className="p-3 bg-light rounded-3 mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                  <span className="fw-bold text-dark">
                    Q{idx + 1} — {qp.topic || "HR Question"}
                  </span>
                  <span className="badge text-white px-3 py-2" style={{ backgroundColor: "#ec4899" }}>
                    {qp.score ?? 0}/10
                  </span>
                </div>
                {qp.question && (
                  <p className="small text-muted mb-1">
                    <strong>Q:</strong> {qp.question}
                  </p>
                )}
                {candidateAnswer ? (
                  <div className="p-2 mt-2 mb-2 rounded-2" style={{ backgroundColor: "#fff7fb", border: "1px solid #fbcfe8" }}>
                    <p className="small fw-bold text-uppercase text-muted mb-1" style={{ letterSpacing: "0.5px", fontSize: "0.7rem" }}>
                      Your answer (transcript)
                    </p>
                    <p className="small text-dark mb-0" style={{ lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                      {candidateAnswer}
                    </p>
                  </div>
                ) : (
                  <p className="small text-muted fst-italic mb-1">
                    (No transcript was captured for this question.)
                  </p>
                )}
                {feedback && (
                  <p className="small text-secondary mb-1">
                    <strong>Feedback:</strong> {feedback}
                  </p>
                )}
                {strengths.length > 0 && (
                  <p className="small text-success mb-1">
                    <strong>Strengths:</strong>{" "}
                    {strengths.map((s, i) => (
                      <span key={i}>{s}{i < strengths.length - 1 ? "; " : ""}</span>
                    ))}
                  </p>
                )}
                {weaknesses.length > 0 && (
                  <p className="small text-danger mb-0">
                    <strong>Areas to Develop:</strong>{" "}
                    {weaknesses.map((w, i) => (
                      <span key={i}>{w}{i < weaknesses.length - 1 ? "; " : ""}</span>
                    ))}
                  </p>
                )}
              </div>
            );
          })}
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

      <div className="d-flex flex-column flex-md-row gap-3 mt-4 flex-wrap">
        <button onClick={onBack} className="btn btn-primary fw-bold py-2 px-4" style={{ borderRadius: "10px" }}>
          Return to Dashboard
        </button>
        <button onClick={onRestart} className="btn btn-outline-secondary fw-bold py-2 px-4" style={{ borderRadius: "10px" }}>
          Retake HR Interview
        </button>
      </div>
    </div>
  );
}
