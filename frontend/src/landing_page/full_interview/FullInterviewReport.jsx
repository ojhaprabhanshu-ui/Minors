import React from "react";

const RECOMMENDATION_STYLES = {
  "Strong Hire": { bg: "#00d084", label: "Strong Hire" },
  "Hire": { bg: "#22c55e", label: "Hire" },
  "Follow-up Required": { bg: "#f59e0b", label: "Follow-up Required" },
  "No Hire": { bg: "#ef4444", label: "No Hire" },
};

const ROUND_LABELS = {
  oa: "Coding (DSA)",
  technical: "Technical",
  hr: "HR (Behavioral)",
};

const READINESS_LEVELS = ["Beginner", "Developing", "Proficient", "Advanced"];
const READINESS_COLORS = {
  Beginner: "#ef4444",
  Developing: "#f59e0b",
  Proficient: "#22c55e",
  Advanced: "#00d084",
};

export default function FullInterviewReport({ report, onBack }) {
  if (!report) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3">Loading report...</p>
      </div>
    );
  }

  const recommendation = report.recommendation || "Follow-up Required";
  const style = RECOMMENDATION_STYLES[recommendation] || RECOMMENDATION_STYLES["Follow-up Required"];
  const contributions = report.score_contributions || {};
  const consistency = report.cross_round_analysis || {};
  const integrity = report.integrity_summary || {};
  const readiness = report.workplace_readiness || {};

  return (
    <div className="container py-5" style={{ maxWidth: "1000px" }}>
      <div className="text-center mb-5">
        <span
          className="badge px-3 py-2 fw-bold text-uppercase mb-2"
          style={{ backgroundColor: "#ede9fe", color: "#5b21b6", fontSize: "0.85rem", borderRadius: "8px" }}
        >
          Comprehensive Final Report
        </span>
        <h2 className="fw-bold text-dark mb-2">Full Interview Evaluation</h2>
        <p className="text-muted">Synthesized from all rounds, integrity signals, and resume context.</p>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-5">
          <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: "20px" }}>
            <h5 className="fw-bold text-dark mb-3">Overall Score</h5>
            <div className="d-flex align-items-center gap-3">
              <span
                className="fw-bold d-flex align-items-center justify-content-center"
                style={{
                  backgroundColor: style.bg,
                  color: "#ffffff",
                  fontSize: "2rem",
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                }}
              >
                {Math.round(report.overall_score || 0)}
              </span>
              <div>
                <h6 className="fw-bold text-dark mb-0">{style.label}</h6>
                <p className="text-muted small mb-0">Score / 100</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-7">
          <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: "20px" }}>
            <h5 className="fw-bold text-dark mb-3">Score Breakdown</h5>
            <div className="d-flex flex-column gap-2">
              {(report.round_results || []).map((r) => {
                const label = ROUND_LABELS[r.round] || r.round;
                const contribution = contributions[r.round] || 0;
                const weight = (report.weights_used || {})[r.round] || 0;
                return (
                  <div key={r.round}>
                    <div className="d-flex justify-content-between align-items-center small mb-1">
                      <span className="text-dark">
                        {label}
                        {r.skipped && <span className="badge bg-secondary ms-2">Skipped</span>}
                      </span>
                      <span className="text-muted">
                        {Math.round(r.score || 0)}/100 · weight {Math.round(weight * 100)}% · contributes {Math.round(contribution)} pts
                      </span>
                    </div>
                    <div className="progress" style={{ height: "8px", borderRadius: "4px" }}>
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{
                          width: `${Math.min(100, r.score || 0)}%`,
                          backgroundColor: r.skipped ? "#94a3b8" : "#7c3aed",
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {readiness.notes && (
        <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: "20px" }}>
          <h5 className="fw-bold text-dark mb-3">Workplace Readiness</h5>
          <div className="row g-3 mb-3">
            {["technical_readiness", "communication_readiness", "collaboration_readiness"].map((k) => {
              const level = readiness[k] || "Developing";
              const color = READINESS_COLORS[level] || "#64748b";
              return (
                <div className="col-md-4" key={k}>
                  <div className="p-3 rounded-3 border text-center" style={{ backgroundColor: "#f8fafc" }}>
                    <p className="small text-muted text-uppercase fw-bold mb-1" style={{ letterSpacing: "0.5px" }}>
                      {k.replace("_readiness", "").replace(/_/g, " ")}
                    </p>
                    <span
                      className="badge text-white px-3 py-2"
                      style={{ backgroundColor: color, borderRadius: "8px", fontSize: "0.95rem" }}
                    >
                      {level}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="small text-secondary mb-0" style={{ lineHeight: "1.6" }}>
            {readiness.notes}
          </p>
        </div>
      )}

      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: "20px" }}>
            <h5 className="fw-bold text-dark mb-3">Strengths</h5>
            {Array.isArray(report.strengths) && report.strengths.length > 0 ? (
              <ul className="small text-secondary mb-0" style={{ lineHeight: "1.7" }}>
                {report.strengths.map((s, i) => (
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
            {Array.isArray(report.weaknesses) && report.weaknesses.length > 0 ? (
              <ul className="small text-secondary mb-0" style={{ lineHeight: "1.7" }}>
                {report.weaknesses.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            ) : (
              <p className="small text-muted mb-0">No critical development areas identified.</p>
            )}
          </div>
        </div>
      </div>

      {consistency.notes && consistency.notes.length > 0 && (
        <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: "20px" }}>
          <h5 className="fw-bold text-dark mb-3">Cross-Round Consistency</h5>
          <p className="small text-muted mb-2">
            Level: <strong>{consistency.level || "—"}</strong>
          </p>
          <ul className="small text-secondary mb-0" style={{ lineHeight: "1.7" }}>
            {consistency.notes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </div>
      )}

      {integrity && (
        <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: "20px" }}>
          <div className="d-flex align-items-center justify-content-between mb-2">
            <h5 className="fw-bold text-dark mb-0">Assessment Integrity</h5>
            <span
              className="badge text-white px-3 py-2"
              style={{
                backgroundColor:
                  integrity.risk === "HIGH" ? "#ef4444" : integrity.risk === "MEDIUM" ? "#f59e0b" : "#00d084",
                borderRadius: "8px",
              }}
            >
              Risk: {integrity.risk || "LOW"}
            </span>
          </div>
          <p className="small text-secondary mb-0" style={{ lineHeight: "1.6" }}>
            {integrity.summary || "No assessment-integrity events were recorded during the session."}
          </p>
        </div>
      )}

      {report.summary && (
        <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: "20px" }}>
          <h5 className="fw-bold text-dark mb-3">Summary</h5>
          <p className="small text-secondary mb-0" style={{ lineHeight: "1.6" }}>
            {report.summary}
          </p>
        </div>
      )}

      {report.skill_profile && (report.skill_profile.primary || report.skill_profile.supporting || report.skill_profile.exposure) && (
        <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: "20px" }}>
          <div className="d-flex align-items-center justify-content-between mb-2">
            <h5 className="fw-bold text-dark mb-0">Skills Assessed</h5>
            <span
              className="badge text-white px-3 py-2"
              style={{
                backgroundColor:
                  report.skill_profile.source === "resume" ? "#7c3aed" : "#94a3b8",
                borderRadius: "8px",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {report.skill_profile.source === "resume" ? "Resume-Inferred" : "Profile Defaults"}
            </span>
          </div>
          <p className="small text-muted mb-3">
            This interview was tailored to your declared skills. Questions were weighted toward
            the primary stack and probed for depth in supporting areas.
          </p>
          <div className="row g-3">
            {[
              { key: "primary", title: "Primary", color: "#7c3aed" },
              { key: "supporting", title: "Supporting", color: "#3b82f6" },
              { key: "exposure", title: "Exposure", color: "#94a3b8" },
            ].map((bucket) => {
              const items = report.skill_profile[bucket.key] || [];
              if (items.length === 0) return null;
              return (
                <div className="col-md-4" key={bucket.key}>
                  <div className="p-3 rounded-3 h-100" style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                    <p
                      className="small fw-bold text-uppercase mb-2"
                      style={{ color: bucket.color, letterSpacing: "0.5px", fontSize: "0.7rem" }}
                    >
                      {bucket.title}
                    </p>
                    <div className="d-flex flex-wrap gap-1">
                      {items.map((s, i) => (
                        <span
                          key={i}
                          className="badge"
                          style={{
                            backgroundColor: bucket.color,
                            color: "#ffffff",
                            fontWeight: "500",
                            padding: "0.4rem 0.7rem",
                            borderRadius: "8px",
                            fontSize: "0.75rem",
                          }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {Array.isArray(report.skill_profile.categories) && report.skill_profile.categories.length > 0 && (
            <div className="mt-3">
              <p className="small fw-bold text-uppercase text-muted mb-2" style={{ letterSpacing: "0.5px", fontSize: "0.7rem" }}>
                Categories Covered
              </p>
              <div className="d-flex flex-wrap gap-1">
                {report.skill_profile.categories.map((c, i) => (
                  <span
                    key={i}
                    className="badge bg-light text-secondary border"
                    style={{ fontWeight: "500", padding: "0.35rem 0.65rem", borderRadius: "6px", fontSize: "0.7rem" }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {(report.round_results || []).some((r) => {
        const qp = (r.raw || {}).question_performance || [];
        return qp.length > 0;
      }) && (
        <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: "20px" }}>
          <h5 className="fw-bold text-dark mb-3">Comprehensive Question-by-Question Performance</h5>
          <p className="small text-muted mb-3">
            Every question you answered across all completed rounds, with the AI's evaluation
            and the verbatim transcript of your response.
          </p>
          {report.round_results.map((round) => {
            const qp = (round.raw || {}).question_performance || [];
            if (qp.length === 0) return null;
            const label = ROUND_LABELS[round.round] || round.round;
            const accent =
              round.round === "oa" ? "#0ea5e9" :
              round.round === "technical" ? "#1e40af" :
              round.round === "hr" ? "#9d174d" : "#7c3aed";
            return (
              <div key={round.round} className="mb-4">
                <h6 className="fw-bold text-uppercase mb-2" style={{ color: accent, letterSpacing: "0.5px", fontSize: "0.8rem" }}>
                  {label} — {qp.length} question{qp.length === 1 ? "" : "s"} answered
                </h6>
                {qp.map((q, idx) => {
                  const candidateAnswer =
                    q.candidate_answer ||
                    q.transcript ||
                    (q.evaluation && q.evaluation.transcript) ||
                    "";
                  const strengths =
                    q.strengths || (q.evaluation && q.evaluation.strengths) || [];
                  const weaknesses =
                    q.weaknesses || (q.evaluation && q.evaluation.weaknesses) || [];
                  const feedback = q.feedback || (q.evaluation && q.evaluation.feedback) || "";
                  return (
                    <div key={idx} className="p-3 bg-light rounded-3 mb-2">
                      <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                        <span className="fw-bold text-dark small">
                          Q{idx + 1} — {q.topic || "Question"}
                          {q.difficulty ? ` (${q.difficulty})` : ""}
                        </span>
                        <span className="badge text-white px-2 py-1" style={{ backgroundColor: accent, fontSize: "0.7rem" }}>
                          {q.score ?? 0}/10
                        </span>
                      </div>
                      {q.question && (
                        <p className="small text-muted mb-1">
                          <strong>Q:</strong> {q.question}
                        </p>
                      )}
                      {candidateAnswer ? (
                        <div
                          className="p-2 mt-1 mb-2 rounded-2"
                          style={{ backgroundColor: "#ffffff", border: `1px solid ${accent}22` }}
                        >
                          <p className="small fw-bold text-uppercase text-muted mb-1" style={{ letterSpacing: "0.5px", fontSize: "0.65rem" }}>
                            Your answer
                          </p>
                          <p className="small text-dark mb-0" style={{ lineHeight: "1.55", whiteSpace: "pre-wrap" }}>
                            {candidateAnswer}
                          </p>
                        </div>
                      ) : (
                        <p className="small text-muted fst-italic mb-1">(No transcript captured)</p>
                      )}
                      {feedback && (
                        <p className="small text-secondary mb-1">
                          <strong>Feedback:</strong> {feedback}
                        </p>
                      )}
                      {strengths.length > 0 && (
                        <p className="small text-success mb-0">
                          <strong>Strengths:</strong>{" "}
                          {strengths.map((s, i) => <span key={i}>{s}{i < strengths.length - 1 ? "; " : ""}</span>)}
                        </p>
                      )}
                      {weaknesses.length > 0 && (
                        <p className="small text-danger mb-0">
                          <strong>Develop:</strong>{" "}
                          {weaknesses.map((w, i) => <span key={i}>{w}{i < weaknesses.length - 1 ? "; " : ""}</span>)}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      <div className="d-flex flex-column flex-md-row gap-3 mt-4 flex-wrap">
        <button
          onClick={onBack}
          className="btn btn-primary fw-bold py-2 px-4"
          style={{ borderRadius: "10px" }}
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}
