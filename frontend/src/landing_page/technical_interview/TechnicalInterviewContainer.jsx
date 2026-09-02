import React, { useState, useEffect } from "react";
import RulesPage from "./RulesPage";
import SystemCheckPage from "./SystemCheckPage";
import InterviewRoom from "./InterviewRoom";
import InterviewComplete from "./InterviewComplete";
import TechnicalReport from "./TechnicalReport";
import RoundTransitionNotification from "../shared/RoundTransitionNotification";

const STORAGE_KEY = "vireza_ti_session_id";
const TI_ACCENT = "#1e40af"; // matches the Technical Interview blue branding

// When invoked by the Full Interview orchestrator, the parent has already
// created the Technical session. In that case we must NOT call /start
// again — that would create a second orphan session.
export default function TechnicalInterviewContainer({
  embeddedMode = false,
  initialSession = null,
  onComplete = null,
  onEndInterview = null,
}) {
  const [step, setStep] = useState("loading");
  const [session, setSession] = useState(initialSession);
  const [sessionId, setSessionId] = useState(initialSession?.id || null);
  const [report, setReport] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [attempts, setAttempts] = useState([]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (embeddedMode && initialSession) {
      console.log("[TechnicalInterview] Embedded mode with initial session:", initialSession);
      setSession(initialSession);
      setSessionId(initialSession.id);
      // Skip rules and system check in embedded mode - go directly to interview
      setStep("interview");
      return;
    }
    if (embeddedMode && !initialSession) {
      console.error("[TechnicalInterview] Embedded mode without initial session");
      setErrorMsg("Embedded Technical round started without an initial session.");
      setStep("error");
      return;
    }

    const existingId = sessionStorage.getItem(STORAGE_KEY);
    if (existingId) {
      fetch(`http://localhost:5001/api/technical-interview/${existingId}/status`)
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "success" && data.session) {
            setSession(data.session);
            setSessionId(existingId);
            if (data.session.status === "COMPLETED" || data.session.status === "TIME_EXPIRED") {
              fetchReport(existingId);
            } else {
              setStep("interview");
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
      let savedResumeText = sessionStorage.getItem("ats_resume_text") || "";
      let skills = [];

      try {
        const atsResult = localStorage.getItem("ats_result");
        if (atsResult) {
          const parsed = JSON.parse(atsResult);
          if (parsed.resume_analysis) {
            savedResumeText = savedResumeText || parsed.resume_analysis?.parsedText || "";
            skills = parsed.resume_analysis?.skills || [];
          }
        }
      } catch (e) {
        console.error("Failed to parse ATS result:", e);
      }

      if (!savedResumeText) {
        savedResumeText = "Software engineer candidate with general programming experience.";
      }

      const body = {
        resume_text: savedResumeText,
        candidate_profile: {
          skills: skills.length > 0 ? skills : (sessionStorage.getItem("ats_skills") ? JSON.parse(sessionStorage.getItem("ats_skills")) : []),
          candidateId: "candidate_1",
        },
        target_role: "Software Engineer",
      };
      const res = await fetch("http://localhost:5001/api/technical-interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.status === "success") {
        setSession(data.session);
        setSessionId(data.sessionId);
        sessionStorage.setItem(STORAGE_KEY, data.sessionId);
        setStep("rules");
      } else {
        setErrorMsg("Failed to initialize interview session: " + data.message);
        setStep("error");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to connect to backend service.");
      setStep("error");
    }
  };

  const handleAcceptRules = () => {
    setStep("system-check");
  };

  const handleSystemCheckComplete = async () => {
    try {
      await fetch(`http://localhost:5001/api/technical-interview/${sessionId}/start-timer`, {
        method: "POST",
      });
    } catch (err) {
      console.error("Timer start error:", err);
    }
    setStep("interview");
  };

  const fetchReport = async (id) => {
    try {
      const res = await fetch(`http://localhost:5001/api/technical-interview/${id}/result`);
      const data = await res.json();
      if (data.status === "success") {
        setReport(data.report);
        setStep("complete");
      }
    } catch (err) {
      console.error("Fetch report error:", err);
    }
  };

  const handleInterviewComplete = async () => {
    try {
      const res = await fetch(`http://localhost:5001/api/technical-interview/${sessionId}/complete`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.status === "success") {
        setReport(data.report);
        if (embeddedMode && typeof onComplete === "function") {
          // Embedded (Full Interview) flow: the parent owns the transition UI.
          // We still clear our local transition flag in case onEndInterview
          // fired before this.
          setIsTransitioning(false);
          onComplete(data.report?.overall_score || 0);
        } else {
          setIsTransitioning(false);
          setStep("complete");
        }
      } else {
        setIsTransitioning(false);
        setErrorMsg(data.message || "Failed to complete interview");
        setStep("error");
      }
    } catch (err) {
      console.error("Complete error:", err);
      setIsTransitioning(false);
      setErrorMsg("Failed to connect to backend: " + err.message);
      setStep("error");
    }
  };

  // Fired the instant the InterviewRoom's "End Interview" button (or the
  // voice command) is pressed. In standalone mode this shows the transition
  // notification immediately. In embedded (Full Interview) mode the parent
  // has its own overlay, so we forward the call and skip showing ours.
  const handleEndInterview = () => {
    if (embeddedMode) {
      onEndInterview?.();
      return;
    }
    setIsTransitioning(true);
  };

  const handleRestart = async () => {
    const confirmed = window.confirm(
      "This will start a new Round 2 interview attempt. Your previous results will be saved. Are you sure you want to continue?"
    );
    if (!confirmed) return;
    sessionStorage.removeItem(STORAGE_KEY);
    await initializeNewSession();
  };

  const handleBackToComplete = () => {
    window.location.href = "/AiInterviewcoach";
  };

  if (step === "loading") {
    return (
      <div className="container py-5 text-center my-5">
        <div className="spinner-border text-primary me-2" role="status" style={{ width: "3rem", height: "3rem" }}></div>
        <h4 className="fw-bold text-dark mt-3">Initializing Round 2 — Technical Interview...</h4>
        <p className="text-muted small">Analyzing your resume and preparing personalized questions...</p>
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className="container py-5 text-center my-5">
        <div className="alert alert-danger p-4 rounded-3 d-inline-block shadow-sm">
          <i className="fa-solid fa-triangle-exclamation fs-2 mb-2 d-block"></i>
          <h5 className="fw-bold">Interview Setup Error</h5>
          <p className="small mb-3">{errorMsg}</p>
          <button onClick={initializeNewSession} className="btn btn-danger btn-sm px-4 py-2">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (step === "rules") {
    return <RulesPage onAccept={handleAcceptRules} />;
  }

  if (step === "system-check") {
    return <SystemCheckPage onComplete={handleSystemCheckComplete} />;
  }

  if (step === "interview") {
    return (
      <>
        <InterviewRoom
          session={session}
          sessionId={sessionId}
          onComplete={handleInterviewComplete}
          onEndInterview={handleEndInterview}
        />
        <RoundTransitionNotification
          visible={isTransitioning}
          accentColor={TI_ACCENT}
        />
      </>
    );
  }

  if (step === "complete") {
    return (
      <InterviewComplete 
        report={report} 
        onViewReport={() => setStep("report")} 
        onRestart={handleRestart} 
        onBack={handleBackToComplete} 
      />
    );
  }

  if (step === "report") {
    return <TechnicalReport report={report} onBack={handleBackToComplete} onRestart={handleRestart} />;
  }

  return null;
}