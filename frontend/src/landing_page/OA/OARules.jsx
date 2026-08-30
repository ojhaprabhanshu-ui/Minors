import React, { useState } from "react";

export default function OARules({ onAccept, candidateProfile }) {
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
        {/* Header */}
        <div className="text-center mb-4 pb-3 border-bottom">
          <span
            className="badge px-3 py-2 fw-bold text-uppercase mb-2"
            style={{
              backgroundColor: "#ede9fe",
              color: "#794ea1",
              fontSize: "0.85rem",
              borderRadius: "8px",
            }}
          >
            Round 1 — Online Assessment (OA)
          </span>
          <h2 className="fw-bold text-dark mb-2" style={{ fontSize: "2rem" }}>
            DSA Technical Assessment Rules
          </h2>
          <p className="text-muted small mb-0">
            Please read the instructions carefully before proceeding to the system compatibility check.
          </p>
        </div>

        {/* Candidate Profile Context */}
        {candidateProfile && (
          <div
            className="p-3 mb-4 rounded-3 d-flex align-items-center justify-content-between"
            style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}
          >
            <div>
              <span className="text-muted small d-block">Candidate Profile Analyzed</span>
              <strong className="text-dark">
                {candidateProfile.skills?.length > 0
                  ? candidateProfile.skills.slice(0, 5).join(", ")
                  : "General Computer Science"}
              </strong>
            </div>
            <span className="badge bg-success px-3 py-2" style={{ borderRadius: "6px" }}>
              Tailored DSA Questions Ready
            </span>
          </div>
        )}

        {/* Rules Grid */}
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <div className="p-3 rounded-3 border h-100 bg-light">
              <div className="d-flex align-items-center me-2 mb-2">
                <i className="fa-solid fa-clock text-primary me-2 fs-5"></i>
                <h6 className="fw-bold text-dark mb-0">⏱ 90 Minutes Total</h6>
              </div>
              <p className="text-secondary small mb-0" style={{ lineHeight: "1.5" }}>
                You have <strong>90 minutes TOTAL</strong> for all 3 DSA coding problems under one single global timer. Distribute your time freely across problems.
              </p>
            </div>
          </div>

          <div className="col-md-6">
            <div className="p-3 rounded-3 border h-100 bg-light">
              <div className="d-flex align-items-center me-2 mb-2">
                <i className="fa-solid fa-code text-success me-2 fs-5"></i>
                <h6 className="fw-bold text-dark mb-0">🧠 3 DSA Coding Problems</h6>
              </div>
              <p className="text-secondary small mb-0" style={{ lineHeight: "1.5" }}>
                Problems range from Easy to Medium/Hard. You can switch between Python, Java, and C++ for any question.
              </p>
            </div>
          </div>

          <div className="col-md-6">
            <div className="p-3 rounded-3 border h-100 bg-light">
              <div className="d-flex align-items-center me-2 mb-2">
                <i className="fa-solid fa-expand text-warning me-2 fs-5"></i>
                <h6 className="fw-bold text-dark mb-0">🖥 Fullscreen Required</h6>
              </div>
              <p className="text-secondary small mb-0" style={{ lineHeight: "1.5" }}>
                The test requires fullscreen mode. Leaving or exiting fullscreen during the test will be logged as an integrity event.
              </p>
            </div>
          </div>

          <div className="col-md-6">
            <div className="p-3 rounded-3 border h-100 bg-light">
              <div className="d-flex align-items-center me-2 mb-2">
                <i className="fa-solid fa-desktop text-info me-2 fs-5"></i>
                <h6 className="fw-bold text-dark mb-0">📺 Screen Sharing Required</h6>
              </div>
              <p className="text-secondary small mb-0" style={{ lineHeight: "1.5" }}>
                Active screen sharing is required throughout the assessment. Stopping screen share logs a risk event.
              </p>
            </div>
          </div>

          <div className="col-md-6">
            <div className="p-3 rounded-3 border h-100 bg-light">
              <div className="d-flex align-items-center me-2 mb-2">
                <i className="fa-solid fa-ban text-danger me-2 fs-5"></i>
                <h6 className="fw-bold text-dark mb-0">🚫 No External Assistance</h6>
              </div>
              <p className="text-secondary small mb-0" style={{ lineHeight: "1.5" }}>
                Do not use search engines, external AI tools, chat applications, notes, or third-party help during the test.
              </p>
            </div>
          </div>

          <div className="col-md-6">
            <div className="p-3 rounded-3 border h-100 bg-light">
              <div className="d-flex align-items-center me-2 mb-2">
                <i className="fa-solid fa-copy text-secondary me-2 fs-5"></i>
                <h6 className="fw-bold text-dark mb-0">📋 Copy / Paste Monitored</h6>
              </div>
              <p className="text-secondary small mb-0" style={{ lineHeight: "1.5" }}>
                Copying or pasting external code and tab switching events are recorded and evaluated in the integrity score.
              </p>
            </div>
          </div>
        </div>

        {/* Warning Notice */}
        <div
          className="p-3 mb-4 rounded-3 d-flex align-items-center gap-3 border"
          style={{ backgroundColor: "#fef3c7", borderColor: "#fde68a" }}
        >
          <i className="fa-solid fa-triangle-exclamation text-warning fs-4"></i>
          <span className="small text-dark" style={{ lineHeight: "1.5" }}>
            <strong>Important:</strong> Once you accept the rules and start the assessment, the <strong>90-minute timer cannot be paused</strong>. Make sure you are in a quiet environment.
          </span>
        </div>

        {/* Confirmation Checkbox & Button */}
        <div className="form-check mb-4 ps-4">
          <input
            className="form-check-input me-2"
            type="checkbox"
            id="agreeRulesCheck"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            style={{ width: "20px", height: "20px", cursor: "pointer" }}
          />
          <label
            className="form-check-label fw-semibold text-dark cursor-pointer"
            htmlFor="agreeRulesCheck"
            style={{ fontSize: "0.95rem" }}
          >
            I have read and agree to all the assessment rules and proctoring conditions.
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
          Proceed to System Check <i className="fa-solid fa-arrow-right ms-2"></i>
        </button>
      </div>
    </div>
  );
}
