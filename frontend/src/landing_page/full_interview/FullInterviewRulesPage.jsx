import React, { useState, useEffect } from "react";
import {
  CANDIDATE_ID_KEY,
  getOrCreateCandidateId,
  loadCachedPermissions,
  saveCachedPermissions,
  clearCachedPermissions,
} from "./permissionsCache";

const RULES = [
  "This is the complete Full Interview: Round 1 (Coding), Round 2 (Technical), and Round 3 (HR).",
  "You will be evaluated in sequence. Each round is timed independently and cannot be paused.",
  "Once started, the orchestrator locks your candidate identity, resume, and target role. The same identity is passed to every round.",
  "Camera, microphone, and fullscreen access are required. Screen sharing may also be requested by the system check.",
  "Browser permissions are verified ONCE during the pre-flight system check. Subsequent rounds reuse the same permission grants.",
  "Switching tabs or exiting fullscreen is recorded as an assessment-integrity event.",
  "Do not use search engines, AI assistants, notes, or other unauthorized resources.",
  "The final report synthesizes weighted performance across all rounds, cross-round consistency, and integrity signals.",
  "You may end the interview at any time from within a round, or by saying 'end interview' in voice-based rounds.",
  "Refresh-safe: the server stores your progress. You can resume the exact round you were in after a refresh.",
];

export default function FullInterviewRulesPage({ onAccept, sessionConfig, candidateId }) {
  const [agreed, setAgreed] = useState(false);
  const enabledRounds = sessionConfig?.enabled_rounds || ["oa", "technical", "hr"];
  const weights = sessionConfig?.weights || {};
  const metadata = sessionConfig?.metadata || {};

  return (
    <div className="container py-5" style={{ maxWidth: "850px" }}>
      <div
        className="card border-0 shadow-lg p-4 p-md-5"
        style={{ borderRadius: "24px", background: "#ffffff", border: "1px solid #e2e8f0" }}
      >
        <div className="text-center mb-4 pb-3 border-bottom">
          <span
            className="badge px-3 py-2 fw-bold text-uppercase mb-2"
            style={{ backgroundColor: "#ede9fe", color: "#5b21b6", fontSize: "0.85rem", borderRadius: "8px" }}
          >
            Full Interview — Orchestrated Pipeline
          </span>
          <h2 className="fw-bold text-dark mb-2" style={{ fontSize: "2rem" }}>
            Assessment Rules & Terms
          </h2>
          <p className="text-muted small mb-0">
            You are about to begin a multi-round, AI-driven interview. Please review the rules and the round schedule below.
          </p>
        </div>

        <div className="mb-4">
          <h6 className="fw-bold text-dark mb-2">Round Schedule</h6>
          <div className="row g-2">
            {enabledRounds.map((rk, idx) => {
              const m = metadata[rk] || {};
              return (
                <div className="col-md-4" key={rk}>
                  <div
                    className="p-3 rounded-3 h-100"
                    style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}
                  >
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span
                        className="badge text-white"
                        style={{ backgroundColor: m.color || "#64748b", borderRadius: "50%", width: "26px", height: "26px", fontSize: "0.85rem" }}
                      >
                        {idx + 1}
                      </span>
                      <strong className="text-dark small">{m.label || rk}</strong>
                    </div>
                    <p className="text-muted small mb-0" style={{ lineHeight: "1.4" }}>
                      {m.duration_minutes || 0} min
                      {" • "}
                      weight {Math.round((weights[rk] || 0) * 100)}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="row g-3 mb-4">
          {RULES.map((rule, idx) => (
            <div className="col-md-6" key={idx}>
              <div className="p-3 rounded-3 border h-100 bg-light">
                <div className="d-flex align-items-start gap-2">
                  <span
                    className="badge mt-1"
                    style={{
                      backgroundColor: "#5b21b6",
                      borderRadius: "50%",
                      width: "24px",
                      height: "24px",
                      fontSize: "0.75rem",
                    }}
                  >
                    {idx + 1}
                  </span>
                  <p className="text-secondary small mb-0" style={{ lineHeight: "1.5" }}>
                    {rule}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          className="p-3 mb-4 rounded-3 d-flex align-items-center gap-3 border"
          style={{ backgroundColor: "#fef3c7", borderColor: "#fde68a" }}
        >
          <i className="fa-solid fa-triangle-exclamation text-warning fs-4"></i>
          <span className="small text-dark" style={{ lineHeight: "1.5" }}>
            <strong>Resume Lock:</strong> The candidate ID, resume content, and target role you
            provide now will be passed identically to every round. You will not be able to change
            them mid-flow.
          </span>
        </div>

        <div className="form-check mb-4 ps-4">
          <input
            className="form-check-input me-2"
            type="checkbox"
            id="agreeFullRulesCheck"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            style={{ width: "20px", height: "20px", cursor: "pointer" }}
          />
          <label
            className="form-check-label fw-semibold text-dark cursor-pointer"
            htmlFor="agreeFullRulesCheck"
            style={{ fontSize: "0.95rem" }}
          >
            I have read and agree to the Full Interview rules, terms, and integrity policies.
          </label>
        </div>

        <button
          onClick={onAccept}
          disabled={!agreed}
          className="btn w-100 text-white fw-bold py-3 shadow"
          style={{
            backgroundColor: agreed ? "#7c3aed" : "#cbd5e1",
            borderRadius: "12px",
            fontSize: "1.1rem",
            cursor: agreed ? "pointer" : "not-allowed",
          }}
        >
          Continue to System Check <i className="fa-solid fa-arrow-right ms-2"></i>
        </button>
      </div>
    </div>
  );
}
