import React, { useState } from "react";
import { enterFullscreen, isFullscreenActive } from "./fullscreenUtils";

export default function OASystemCheck({ onStartOA }) {
  const [checks, setChecks] = useState({
    browser: true,
    network: true,
    fullscreen: isFullscreenActive(),
    screenShare: false,
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const requestFullscreen = async () => {
    const success = await enterFullscreen();
    if (success || isFullscreenActive()) {
      setChecks((prev) => ({ ...prev, fullscreen: true }));
      setErrorMsg("");
    } else {
      setErrorMsg("Fullscreen permission denied or not supported by browser.");
      setChecks((prev) => ({ ...prev, fullscreen: false }));
    }
  };

  const requestScreenShare = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        
        // Listen for screen share stop
        stream.getVideoTracks()[0].onended = () => {
          setChecks((prev) => ({ ...prev, screenShare: false }));
        };

        setChecks((prev) => ({ ...prev, screenShare: true }));
        setErrorMsg("");
      } else {
        setErrorMsg("Screen sharing is not supported by your browser.");
      }
    } catch (err) {
      console.error("Screen Sharing Error:", err);
      setErrorMsg("Screen sharing permission was denied. Please allow screen sharing to start the OA.");
      setChecks((prev) => ({ ...prev, screenShare: false }));
    }
  };

  const allPassed = checks.browser && checks.network && checks.fullscreen && checks.screenShare;

  const handleStartClick = async () => {
    if (!allPassed) return;
    setLoading(true);
    try {
      await onStartOA();
    } catch (err) {
      setErrorMsg("Failed to start assessment session: " + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: "750px" }}>
      <div
        className="card border-0 shadow-lg p-4 p-md-5"
        style={{ borderRadius: "24px", background: "#ffffff" }}
      >
        <div className="text-center mb-4 pb-3 border-bottom">
          <span
            className="badge px-3 py-2 fw-bold text-uppercase mb-2"
            style={{ backgroundColor: "#d1fae5", color: "#065f46", fontSize: "0.85rem" }}
          >
            System Compatibility Verification
          </span>
          <h2 className="fw-bold text-dark mb-1">Pre-Assessment Readiness Check</h2>
          <p className="text-muted small mb-0">
            Verify hardware, permissions, and network connectivity before starting the 90-minute global timer.
          </p>
        </div>

        {errorMsg && (
          <div className="alert alert-danger p-3 mb-4 rounded-3 d-flex align-items-center gap-2">
            <i className="fa-solid fa-triangle-exclamation fs-5"></i>
            <span className="small">{errorMsg}</span>
          </div>
        )}

        {/* System Verification Items */}
        <div className="d-flex flex-column gap-3 mb-4">
          {/* Browser Check */}
          <div className="p-3 bg-light rounded-3 border d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <i className="fa-solid fa-globe fs-4 text-primary"></i>
              <div>
                <strong className="text-dark d-block">Browser Compatibility</strong>
                <small className="text-muted">Modern HTML5 & ES6 JS Engine</small>
              </div>
            </div>
            <span className="badge bg-success px-3 py-2">✓ Verified</span>
          </div>

          {/* Network Check */}
          <div className="p-3 bg-light rounded-3 border d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <i className="fa-solid fa-wifi fs-4 text-info"></i>
              <div>
                <strong className="text-dark d-block">Network Connection</strong>
                <small className="text-muted">API Latency & Connectivity</small>
              </div>
            </div>
            <span className="badge bg-success px-3 py-2">✓ Verified</span>
          </div>

          {/* 3. Screen Share Permission */}
          <div className="p-3 bg-light rounded-3 border d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div className="d-flex align-items-center gap-3">
              <i className="fa-solid fa-desktop fs-4 text-secondary"></i>
              <div>
                <strong className="text-dark d-block">Screen Sharing Permission</strong>
                <small className="text-muted">Required for integrity monitoring</small>
              </div>
            </div>

            {checks.screenShare ? (
              <span className="badge bg-success px-3 py-2">✓ Screen Share Active</span>
            ) : (
              <button
                type="button"
                onClick={requestScreenShare}
                className="btn btn-primary fw-bold btn-sm px-3 py-2"
                style={{ borderRadius: "8px" }}
              >
                Grant Screen Share Permission
              </button>
            )}
          </div>

          {/* 4. Fullscreen Mode (Last Option) */}
          <div className="p-3 bg-light rounded-3 border d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div className="d-flex align-items-center gap-3">
              <i className="fa-solid fa-expand fs-4 text-warning"></i>
              <div>
                <strong className="text-dark d-block">Fullscreen Mode</strong>
                <small className="text-muted">Required during entire assessment</small>
              </div>
            </div>

            {checks.fullscreen ? (
              <span className="badge bg-success px-3 py-2">✓ Fullscreen Active</span>
            ) : (
              <button
                type="button"
                onClick={requestFullscreen}
                className="btn btn-warning text-dark fw-bold btn-sm px-3 py-2"
                style={{ borderRadius: "8px" }}
              >
                Enable Fullscreen
              </button>
            )}
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStartClick}
          disabled={!allPassed || loading}
          className="btn w-100 text-white fw-bold py-3 shadow"
          style={{
            backgroundColor: allPassed ? "#00d084" : "#cbd5e1",
            borderRadius: "12px",
            fontSize: "1.1rem",
            cursor: allPassed && !loading ? "pointer" : "not-allowed",
          }}
        >
          {loading ? (
            <span className="d-flex align-items-center justify-content-center">
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Starting 90-Minute Assessment...
            </span>
          ) : (
            <span>
              START OA (90 MINUTES) <i className="fa-solid fa-bolt ms-2"></i>
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
