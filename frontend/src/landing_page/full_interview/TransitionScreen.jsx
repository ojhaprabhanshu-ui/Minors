import React from "react";

const ROUND_COLORS = {
  oa: { bg: "#f59e0b", text: "#92400e", label: "Round 1 — Coding (DSA)", icon: "fa-code" },
  technical: { bg: "#2563eb", text: "#1e3a8a", label: "Round 2 — Technical", icon: "fa-microchip" },
  hr: { bg: "#9d174d", text: "#831843", label: "Round 3 — HR", icon: "fa-user-tie" },
};

export default function TransitionScreen({ session, nextRound, justCompleted, lastScore, onContinue }) {
  const m = ROUND_COLORS[nextRound] || { bg: "#64748b", text: "#1e293b", label: nextRound, icon: "fa-circle" };
  const justCompletedMeta = ROUND_COLORS[justCompleted] || null;

  return (
    <div className="container py-5" style={{ maxWidth: "720px" }}>
      <div
        className="card border-0 shadow-lg p-4 p-md-5"
        style={{ borderRadius: "24px", background: "#ffffff" }}
      >
        <div className="text-center mb-4">
          {justCompletedMeta && (
            <div
              className="mx-auto mb-3 d-flex align-items-center justify-content-center"
              style={{
                width: "90px",
                height: "90px",
                borderRadius: "50%",
                backgroundColor: "#ecfdf5",
                border: "3px solid #00d084",
              }}
            >
              <i className="fa-solid fa-check fa-2x" style={{ color: "#00d084" }}></i>
            </div>
          )}
          <h2 className="fw-bold text-dark mb-2">
            {justCompleted ? "Round complete" : "Get ready"}
          </h2>
          {justCompleted && (
            <p className="text-muted small mb-0">
              {justCompletedMeta.label} finished with a score of{" "}
              <strong className="text-dark">{Math.round(lastScore || 0)}/100</strong>.
            </p>
          )}
        </div>

        <div
          className="p-3 p-md-4 rounded-3 mb-4 d-flex align-items-center gap-3"
          style={{ backgroundColor: `${m.bg}10`, border: `2px solid ${m.bg}` }}
        >
          <div
            className="d-flex align-items-center justify-content-center"
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: m.bg,
              color: "#ffffff",
              flexShrink: 0,
            }}
          >
            <i className={`fa-solid ${m.icon} fa-xl`}></i>
          </div>
          <div>
            <p className="text-muted small text-uppercase fw-bold mb-1" style={{ letterSpacing: "0.5px" }}>
              Up next
            </p>
            <h4 className="fw-bold text-dark mb-0">{m.label}</h4>
          </div>
        </div>

        <div className="mb-4">
          <h6 className="fw-bold text-dark mb-2">Overall progress</h6>
          <ProgressBar session={session} />
        </div>

        <div
          className="p-3 mb-4 rounded-3"
          style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}
        >
          <p className="small text-secondary mb-0" style={{ lineHeight: "1.6" }}>
            <i className="fa-solid fa-circle-info me-2 text-primary"></i>
            Your progress is saved on the server. You can safely close the browser and
            resume at this exact point.
          </p>
        </div>

        <button
          onClick={onContinue}
          className="btn w-100 text-white fw-bold py-3 shadow"
          style={{
            backgroundColor: m.bg,
            borderRadius: "12px",
            fontSize: "1.1rem",
          }}
        >
          Continue to {m.label} <i className="fa-solid fa-arrow-right ms-2"></i>
        </button>
      </div>
    </div>
  );
}

function ProgressBar({ session }) {
  const enabled = session?.enabled_rounds || ["oa", "technical", "hr"];
  const blocks = session?.round_status || {};
  return (
    <div className="d-flex gap-2">
      {enabled.map((rk) => {
        const block = blocks[rk] || {};
        const status = block.status;
        const isComplete = status === "COMPLETED";
        const isActive = session.current_round === rk;
        const isSkipped = status === "SKIPPED";
        const color = ROUND_COLORS[rk]?.bg || "#64748b";
        return (
          <div key={rk} className="flex-fill">
            <div
              style={{
                height: "10px",
                borderRadius: "5px",
                backgroundColor: isComplete
                  ? "#00d084"
                  : isSkipped
                  ? "#94a3b8"
                  : isActive
                  ? color
                  : "#e2e8f0",
                transition: "all 0.3s ease",
              }}
            ></div>
            <p className="text-muted small text-center mt-1 mb-0" style={{ fontSize: "0.7rem" }}>
              {ROUND_COLORS[rk]?.label?.split("—")[1]?.trim() || rk}
            </p>
          </div>
        );
      })}
    </div>
  );
}
