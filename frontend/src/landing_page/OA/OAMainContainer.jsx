import React, { useState, useEffect } from "react";

import OARules from "./OARules";
import OASystemCheck from "./OASystemCheck";
import OACodingEnvironment from "./OACodingEnvironment";
import OAResultDashboard from "./OAResultDashboard";
import { exitFullscreen } from "./fullscreenUtils";

export default function OAMainContainer() {
  const [step, setStep] = useState("loading"); // loading, rules, system-check, assessment, result
  const [session, setSession] = useState(null);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Check if session ID stored in sessionStorage or create new session
    const existingSessionId = sessionStorage.getItem("vireza_oa_session_id");
    if (existingSessionId) {
      fetch(`http://localhost:5001/api/oa/${existingSessionId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "success" && data.session) {
            setSession(data.session);
            if (data.session.status === "COMPLETED") {
              fetchResult(existingSessionId);
            } else if (data.session.status === "IN_PROGRESS") {
              setStep("assessment");
            } else {
              setStep("rules");
            }
          } else {
            initializeNewSession();
          }
        })
        .catch(() => initializeNewSession());
    } else {
      initializeNewSession();
    }
  }, []);

  const initializeNewSession = async () => {
    setStep("loading");
    try {
      // Get resume text from sessionStorage if available from ATS analysis
      const savedResumeText = sessionStorage.getItem("ats_resume_text") || "";
      
      const res = await fetch("http://localhost:5001/api/oa/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_text: savedResumeText }),
      });

      const data = await res.json();
      if (data.status === "success") {
        setSession(data.session);
        sessionStorage.setItem("vireza_oa_session_id", data.sessionId);
        setStep("rules");
      } else {
        setErrorMsg("Failed to initialize OA session: " + data.message);
        setStep("error");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to connect to OA backend service.");
      setStep("error");
    }
  };

  const handleStartTimerAndAssessment = async () => {
    if (!session?.id) return;
    try {
      const res = await fetch(`http://localhost:5001/api/oa/${session.id}/start-timer`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.status === "success") {
        setSession(data.session);
        setStep("assessment");
      }
    } catch (err) {
      console.error("Timer start error:", err);
      setStep("assessment");
    }
  };

  const exitFullscreenIfActive = () => {
    exitFullscreen();
  };

  const fetchResult = async (sessionId) => {
    exitFullscreenIfActive();
    const sId = sessionId || session?.id;
    if (!sId) return;
    try {
      const res = await fetch(`http://localhost:5001/api/oa/${sId}/result`);
      const data = await res.json();
      if (data.status === "success") {
        setResult(data.result);
        setStep("result");
      }
    } catch (err) {
      console.error("Fetch result error:", err);
    }
  };

  const handleFinishOA = async () => {
    exitFullscreenIfActive();
    if (!session?.id) return;
    try {
      const res = await fetch(`http://localhost:5001/api/oa/${session.id}/finish`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.status === "success") {
        setResult(data.result);
        setStep("result");
      }
    } catch (err) {
      fetchResult();
    }
  };

  const handleRestart = () => {
    sessionStorage.removeItem("vireza_oa_session_id");
    initializeNewSession();
  };

  if (step === "loading") {
    return (
      <div className="container py-5 text-center my-5">
        <div className="spinner-border text-primary me-2" role="status" style={{ width: "3rem", height: "3rem" }}></div>
        <h4 className="fw-bold text-dark mt-3">Initializing Round 1 — DSA Assessment...</h4>
        <p className="text-muted small">Generating tailored DSA questions using Gemini AI...</p>
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className="container py-5 text-center my-5">
        <div className="alert alert-danger p-4 rounded-3 d-inline-block shadow-sm">
          <i className="fa-solid fa-triangle-exclamation fs-2 mb-2 d-block"></i>
          <h5 className="fw-bold">Assessment Setup Error</h5>
          <p className="small mb-3">{errorMsg}</p>
          <button onClick={handleRestart} className="btn btn-danger btn-sm px-4 py-2">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (step === "rules") {
    return (
      <OARules
        candidateProfile={session?.candidateProfile}
        onAccept={() => setStep("system-check")}
      />
    );
  }

  if (step === "system-check") {
    return <OASystemCheck onStartOA={handleStartTimerAndAssessment} />;
  }

  if (step === "assessment") {
    return <OACodingEnvironment session={session} onFinishOA={handleFinishOA} />;
  }

  if (step === "result") {
    return <OAResultDashboard result={result} onRestart={handleRestart} />;
  }

  return null;
}
