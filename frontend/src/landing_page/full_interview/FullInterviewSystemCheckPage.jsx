import React, { useState, useEffect } from "react";
import { saveCachedPermissions } from "./permissionsCache";

const CHECK_ITEMS = [
  {
    id: "browser",
    label: "Browser Compatibility",
    description: "Modern HTML5, ES6, Speech APIs",
    icon: "fa-globe",
    color: "primary",
    required: true,
    auto: true,
  },
  {
    id: "network",
    label: "Network Connection",
    description: "AI service & API latency",
    icon: "fa-wifi",
    color: "info",
    required: true,
    auto: true,
  },
  {
    id: "camera",
    label: "Camera Permission",
    description: "Required for Round 2 (Technical) and Round 3 (HR)",
    icon: "fa-video",
    color: "success",
    required: true,
  },
  {
    id: "microphone",
    label: "Microphone Permission",
    description: "Required for voice-based rounds (Technical & HR)",
    icon: "fa-microphone",
    color: "warning",
    required: true,
  },
  {
    id: "screenShare",
    label: "Screen Sharing",
    description: "Optional integrity monitoring",
    icon: "fa-desktop",
    color: "secondary",
    required: false,
  },
  {
    id: "fullscreen",
    label: "Fullscreen Mode",
    description: "Required during voice and proctored rounds",
    icon: "fa-expand",
    color: "dark",
    required: true,
  },
];

export default function FullInterviewSystemCheckPage({ onComplete, candidateId, sessionId }) {
  const [checks, setChecks] = useState({
    browser: false,
    network: false,
    camera: false,
    microphone: false,
    screenShare: false,
    fullscreen: false,
  });
  const [statuses, setStatuses] = useState({});
  const [errorMsg, setErrorMsg] = useState("");
  const [running, setRunning] = useState(false);
  const [cached, setCached] = useState(false);

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
      "speechSynthesis" in window,
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
    try {
      if (!navigator.mediaDevices.getDisplayMedia) {
        updateCheck("screenShare", false, "✕ Not Supported");
        return;
      }
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      stream.getTracks().forEach((t) => t.stop());
      updateCheck("screenShare", true, "✓ Permission Granted");
      setErrorMsg("");
    } catch (err) {
      updateCheck("screenShare", false, "✕ Permission Required");
      setErrorMsg("Screen sharing was denied. You can continue without it.");
    }
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

  const requiredPassed = CHECK_ITEMS.filter((i) => i.required).every((i) => checks[i.id]);

  const handleContinue = async () => {
    if (!requiredPassed) return;
    setRunning(true);
    const permissions = {
      camera: checks.camera,
      microphone: checks.microphone,
      screen_share: checks.screenShare,
      fullscreen: checks.fullscreen,
    };
    // Persist for reuse by child round containers
    saveCachedPermissions(permissions);
    setCached(true);
    try {
      await onComplete(permissions);
    } catch (err) {
      setErrorMsg("Failed to initialize: " + err.message);
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
    if (item.auto) return null;
    const passed = checks[item.id];
    if (passed) return null;
    switch (item.id) {
      case "camera":
        return (
          <button onClick={requestCamera} className="btn btn-success btn-sm fw-bold px-3 py-2" style={{ borderRadius: "8px" }}>
            Allow Camera
          </button>
        );
      case "microphone":
        return (
          <button onClick={requestMicrophone} className="btn btn-warning btn-sm fw-bold px-3 py-2" style={{ borderRadius: "8px" }}>
            Allow Microphone
          </button>
        );
      case "screenShare":
        return (
          <button onClick={requestScreenShare} className="btn btn-secondary btn-sm fw-bold px-3 py-2" style={{ borderRadius: "8px" }}>
            Share Screen
          </button>
        );
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
            style={{ backgroundColor: "#ede9fe", color: "#5b21b6", fontSize: "0.85rem", borderRadius: "8px" }}
          >
            System Compatibility
          </span>
          <h2 className="fw-bold text-dark mb-1">One-time system check for the entire interview.</h2>
          <p className="text-muted small mb-0">
            Verified permissions will be reused across all rounds — no re-prompting.
          </p>
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
                  <strong className="text-dark d-block">
                    {item.label}
                    {!item.required && <span className="text-muted small ms-1">(optional)</span>}
                  </strong>
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
          disabled={!requiredPassed || running}
          className="btn w-100 text-white fw-bold py-3 shadow"
          style={{
            backgroundColor: requiredPassed ? "#7c3aed" : "#cbd5e1",
            borderRadius: "12px",
            fontSize: "1.1rem",
            cursor: requiredPassed && !running ? "pointer" : "not-allowed",
          }}
        >
          {running ? (
            <span className="d-flex align-items-center justify-content-center">
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Starting Full Interview...
            </span>
          ) : (
            <span>
              Start Full Interview <i className="fa-solid fa-arrow-right ms-2"></i>
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
