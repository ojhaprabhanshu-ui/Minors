import React, { useState } from "react";

const RULES = [
  "This is an AI-powered HR interview.",
  "Questions will be personalized using your resume, skills, projects, and target role.",
  "Answer honestly and independently without external assistance.",
  "The AI interviewer may ask follow-up questions based on your responses.",
  "Camera and microphone access are required for voice-based responses.",
  "Screen sharing may be required for assessment integrity.",
  "Fullscreen mode must remain enabled throughout the interview.",
  "Do not use unauthorized external assistance, search engines, or notes.",
  "Your responses will be analyzed to generate a personalized HR performance report.",
  "Browser-level integrity events (fullscreen exit, tab switch, etc.) may be recorded.",
  "The interview duration is a strict 30 minutes — once started, the timer cannot be paused.",
  "Make sure you are in a quiet environment with a stable internet connection before starting.",
];

export default function RulesPage({ onAccept }) {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="container py-5" style={{ maxWidth: "800px" }}>
      <div
        className="card border-0 shadow-lg p-4 p-md-5"
        style={{
          borderRadius: "24px",
          background: "#ffffff",
          border: "1px solid #e2e8f0",
        }}
      >
        <div className="text-center mb-4 pb-3 border-bottom">
          <span
            className="badge px-3 py-2 fw-bold text-uppercase mb-2"
            style={{
              backgroundColor: "#fef3c7",
              color: "#92400e",
              fontSize: "0.85rem",
              borderRadius: "8px",
            }}
          >
            Round 3 — HR Interview
          </span>
          <h2 className="fw-bold text-dark mb-2" style={{ fontSize: "2rem" }}>
            HR Interview Rules & Regulations
          </h2>
          <p className="text-muted small mb-0">
            Please review the interview requirements carefully before starting.
          </p>
        </div>

        <div className="row g-3 mb-4">
          {RULES.map((rule, idx) => (
            <div className="col-md-6" key={idx}>
              <div className="p-3 rounded-3 border h-100 bg-light">
                <div className="d-flex align-items-start gap-2">
                  <span
                    className="badge bg-warning text-dark mt-1"
                    style={{ borderRadius: "50%", width: "24px", height: "24px", fontSize: "0.75rem" }}
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
            <strong>Important:</strong> Every new attempt generates a <strong>fresh set of AI questions</strong>{" "}
            based on your latest resume. Previous questions are stored to ensure no repetition across attempts.
          </span>
        </div>

        <div className="form-check mb-4 ps-4">
          <input
            className="form-check-input me-2"
            type="checkbox"
            id="agreeHRRulesCheck"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            style={{ width: "20px", height: "20px", cursor: "pointer" }}
          />
          <label
            className="form-check-label fw-semibold text-dark cursor-pointer"
            htmlFor="agreeHRRulesCheck"
            style={{ fontSize: "0.95rem" }}
          >
            I have read and agree to the HR interview rules, regulations, and terms & conditions.
          </label>
        </div>

        <button
          onClick={onAccept}
          disabled={!agreed}
          className="btn w-100 text-white fw-bold py-3 shadow"
          style={{
            backgroundColor: agreed ? "#00d084" : "#cbd5e1",
            borderRadius: "12px",
            fontSize: "1.1rem",
            transition: "all 0.25s ease",
            cursor: agreed ? "pointer" : "not-allowed",
          }}
        >
          Continue to System Check <i className="fa-solid fa-arrow-right ms-2"></i>
        </button>

        <p className="text-center text-muted small mt-3 mb-0">
          You must complete the system verification before entering the HR interview room.
        </p>
      </div>
    </div>
  );
}
