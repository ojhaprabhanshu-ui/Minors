import React, { useState, useEffect } from "react";

const CHECK_ITEMS = [
  {
    id: "browser",
    label: "Browser Compatibility",
    description: "Modern HTML5 & ES6 JavaScript Engine",
    icon: "fa-globe",
    color: "primary",
    required: true,
  },
  {
    id: "network",
    label: "Network Connection",
    description: "API Latency & Connectivity",
    icon: "fa-wifi",
    color: "info",
    required: true,
  },
  {
    id: "camera",
    label: "Camera Permission",
    description: "Required for interview monitoring",
    icon: "fa-video",
    color: "success",
    required: true,
  },
  {
    id: "microphone",
    label: "Microphone Permission",
    description: "Required for voice-based interview responses",
    icon: "fa-microphone",
    color: "warning",
    required: true,
  },
  {
    id: "fullscreen",
    label: "Fullscreen Mode",
    description: "Required during entire assessment",
    icon: "fa-expand",
    color: "dark",
    required: true,
  },
];

export default function SystemCheckPage({ onComplete }) {
  const [checks, setChecks] = useState({
    browser: false,
    network: false,
    camera: false,
    microphone: false,
    fullscreen: false,
  });
  const [statuses, setStatuses] = useState({});
  const [errorMsg, setErrorMsg] = useState("");
  const [running, setRunning] = useState(false);

  const updateCheck = (id, passed, statusText) => {
    setChecks((prev) => ({ ...prev, [id]: passed }));
    setStatuses((prev) => ({ ...prev, [id]: statusText }));
  };

  useEffect(() => {
    runBrowserCheck();
    runNetworkCheck();
    checkFullscreenSupport();
  }, []);

  const runBrowserCheck = async () => {
    const requiredAPIs = [
      "mediaDevices" in navigator,
      "getUserMedia" in navigator.mediaDevices,
      "getDisplayMedia" in navigator.mediaDevices,
      "requestFullscreen" in document.documentElement ||
        "webkitRequestFullscreen" in document.documentElement,
      "AudioContext" in window || "webkitAudioContext" in window,
    ];
    const allSupported = requiredAPIs.every(Boolean);
    updateCheck("browser", allSupported, allSupported ? "✓ Verified" : "✕ Not Supported");
  };

  const runNetworkCheck = async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const start = performance.now();
      await fetch("http://localhost:5001/", { method: "GET", signal: controller.signal });
      const latency = performance.now() - start;
      clearTimeout(timeout);
      const passed = latency < 3000;
      updateCheck("network", passed, passed ? `✓ Verified (${Math.round(latency)}ms)` : "⚠ Unstable Connection");
    } catch (err) {
      updateCheck("network", false, "✕ Connection Failed");
    }
  };

  const checkFullscreenSupport = () => {
    const supported =
      document.fullscreenEnabled ||
      document.webkitFullscreenEnabled ||
      document.mozFullScreenEnabled;
    updateCheck("fullscreen", supported, supported ? "✓ Supported" : "✕ Not Supported");
  };

  const requestCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      stream.getTracks().forEach((t) => t.stop());
      updateCheck("camera", true, "✓ Permission Granted");
      setErrorMsg("");
    } catch (err) {
      updateCheck("camera", false, "✕ Permission Required");
      setErrorMsg("Camera permission was denied. Please allow camera access and try again.");
    }
  };

  const requestMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      updateCheck("microphone", true, "✓ Permission Granted");
      setErrorMsg("");
    } catch (err) {
      updateCheck("microphone", false, "✕ Permission Required");
      setErrorMsg("Microphone permission was denied. Please allow microphone access and try again.");
    }
  };

  const requestScreenShare = async () => {
    return;
  };

  const requestFullscreen = async () => {
    try {
      const { enterFullscreen, isFullscreenActive } = await import("../OA/fullscreenUtils");
      if (isFullscreenActive()) {
        updateCheck("fullscreen", true, "✓ Fullscreen Active");
        setErrorMsg("");
        return;
      }
      const success = await enterFullscreen();
      await new Promise(resolve => setTimeout(resolve, 500));
      const active = isFullscreenActive();
      if (success || active) {
        updateCheck("fullscreen", true, "✓ Fullscreen Active");
        setErrorMsg("");
      } else {
        updateCheck("fullscreen", false, "✕ Fullscreen Denied");
        setErrorMsg("Fullscreen permission was denied. Please enable fullscreen mode and try again.");
      }
    } catch (err) {
      updateCheck("fullscreen", false, "✕ Fullscreen Error");
      setErrorMsg("Failed to enter fullscreen mode. Please try again.");
    }
  };

  const allRequiredPassed = CHECK_ITEMS.every((item) => checks[item.id]);

  const handleContinue = async () => {
    if (!allRequiredPassed) return;
    setRunning(true);
    try {
      await onComplete();
    } catch (err) {
      setErrorMsg("Failed to initialize interview session: " + err.message);
    } finally {
      setRunning(false);
    }
  };

  const getStatusBadge = (item) => {
    const status = statuses[item.id];
    if (!status) return <span className="badge bg-secondary px-3 py-2">Checking...</span>;
    if (status.startsWith("✓")) return <span className="badge bg-success px-3 py-2">{status}</span>;
    if (status.startsWith("⚠")) return <span className="badge bg-warning text-dark px-3 py-2">{status}</span>;
    return <span className="badge bg-danger px-3 py-2">{status}</span>;
  };

  const getActionButton = (item) => {
    const passed = checks[item.id];
    if (passed) return null;
    switch (item.id) {
      case "camera":
        return (
          <button onClick={requestCamera} className="btn btn-primary btn-sm fw-bold px-3 py-2" style={{ borderRadius: "8px" }}>
            Allow Camera Access
          </button>
        );
      case "microphone":
        return (
          <button onClick={requestMicrophone} className="btn btn-warning btn-sm fw-bold px-3 py-2" style={{ borderRadius: "8px" }}>
            Allow Microphone Access
          </button>
        );
      case "screenShare":
        return null;
      case "fullscreen":
        return (
          <button onClick={requestFullscreen} className="btn btn-dark btn-sm fw-bold px-3 py-2" style={{ borderRadius: "8px" }}>
            Enter Fullscreen
          </button>
        );
      default:
        return null;
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
            style={{ backgroundColor: "#dbeafe", color: "#1e40af", fontSize: "0.85rem" }}
          >
            System Compatibility
          </span>
          <h2 className="fw-bold text-dark mb-1">Let's make sure your device is ready for the interview.</h2>
          <p className="text-muted small mb-0">Complete all mandatory checks to enter the AI interview room.</p>
        </div>

        {errorMsg && (
          <div className="alert alert-danger p-3 mb-4 rounded-3 d-flex align-items-center gap-2">
            <i className="fa-solid fa-triangle-exclamation fs-5"></i>
            <span className="small">{errorMsg}</span>
          </div>
        )}

        <div className="d-flex flex-column gap-3 mb-4">
          {CHECK_ITEMS.map((item) => (
            <div
              key={item.id}
              className="p-3 bg-light rounded-3 border d-flex justify-content-between align-items-center flex-wrap gap-2"
            >
              <div className="d-flex align-items-center gap-3">
                <i className={`fa-solid ${item.icon} fs-4 text-${item.color}`}></i>
                <div>
                  <strong className="text-dark d-block">{item.label}</strong>
                  <small className="text-muted">{item.description}</small>
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                {getActionButton(item)}
                {getStatusBadge(item)}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleContinue}
          disabled={!allRequiredPassed || running}
          className="btn w-100 text-white fw-bold py-3 shadow"
          style={{
            backgroundColor: allRequiredPassed ? "#00d084" : "#cbd5e1",
            borderRadius: "12px",
            fontSize: "1.1rem",
            cursor: allRequiredPassed && !running ? "pointer" : "not-allowed",
          }}
        >
          {running ? (
            <span className="d-flex align-items-center justify-content-center">
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Starting Technical Interview...
            </span>
          ) : (
            <span>
              Start Technical Interview <i className="fa-solid fa-arrow-right ms-2"></i>
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
