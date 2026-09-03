import React, { useState, useEffect } from "react";

import OARules from "./OARules";
import OASystemCheck from "./OASystemCheck";
import OACodingEnvironment from "./OACodingEnvironment";
import OAResultDashboard from "./OAResultDashboard";
import { exitFullscreen } from "./fullscreenUtils";

// When `embeddedMode` is true:
//   - Skip the auto-create path (do not call /api/oa/start).
//   - Use the `initialSession` provided by the parent (Full Interview
//     orchestrator already created the OA session inside its own lifecycle).
//   - When the round finishes, call `onComplete(score)` instead of routing
//     the result internally. This is what lets the parent mark the round
//     done and advance to the next one.
export default function OAMainContainer({
  embeddedMode = false,
  initialSession = null,
  onComplete = null,
}) {
  const [step, setStep] = useState("loading"); // loading, rules, system-check, assessment, result, error
  const [session, setSession] = useState(initialSession);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [errorType, setErrorType] = useState("");
  const [suggestedActions, setSuggestedActions] = useState([]);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    // EMBEDDED MODE: parent already owns the session. Do not touch
    // sessionStorage or /api/oa/start. We are responsible for calling
    // onComplete when the round finishes.
    if (embeddedMode && initialSession) {
      setSession(initialSession);
      setStep("rules");
      return;
    }
    if (embeddedMode && !initialSession) {
      setErrorMsg("Embedded OA round started without an initial session from the orchestrator.");
      setErrorType("SESSION_INIT_ERROR");
      setStep("error");
      return;
    }

    // STANDALONE MODE: original behavior, unchanged.
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

  const checkAIServicesHealth = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/health/ai-services');
      const healthData = await response.json();
      
      if (healthData.overall_status !== 'healthy') {
        console.warn('AI services health check failed:', healthData);
        return {
          healthy: false,
          data: healthData
        };
      }
      
      return {
        healthy: true,
        data: healthData
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        healthy: false,
        error: error.message
      };
    }
  };

  const initializeNewSession = async () => {
    setStep("loading");
    setIsRetrying(false);
    
    try {
      // Check AI services health first
      const healthCheck = await checkAIServicesHealth();
      
      if (!healthCheck.healthy) {
        let errorMessage = "AI services are not available. ";
        let errorType = "AI_SERVICES_UNHEALTHY";
        let actions = [];
        
        if (healthCheck.data?.configuration) {
          if (!healthCheck.data.configuration.any_api_configured) {
            errorMessage += "No API key is configured. Please set OPENROUTER_API_KEY or GEMINI_API_KEY in your environment.";
            actions = [
              "Configure API key in your environment",
              "Set OPENROUTER_API_KEY or GEMINI_API_KEY in .env file",
              "Restart the server after updating environment variables"
            ];
          } else {
            errorMessage += "Please check your network connection and API configuration.";
            actions = [
              "Check your internet connection",
              "Verify API key validity and permissions",
              "Check AI service status (OpenRouter/Gemini)",
              "Try again in a few moments"
            ];
          }
        }
        
        setErrorMsg(errorMessage);
        setErrorType(errorType);
        setSuggestedActions(actions);
        setStep("error");
        return;
      }
      
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
        // Handle different error types from the backend
        setErrorMsg(data.message || "Failed to initialize OA session");
        setErrorType(data.error_type || "INIT_ERROR");
        setSuggestedActions(data.suggested_actions || []);
        
        // Special handling for credits error
        if (data.error_type === "API_CREDITS_ERROR") {
          setErrorMsg("OpenRouter API Credits Required - Your API key lacks sufficient credits or model access permissions");
          setSuggestedActions([
            "Check your OpenRouter account balance at https://openrouter.ai/credits",
            "Ensure your API key has sufficient credits for the models being used",
            "Verify your API key has access to specific models (meta-llama/llama-3.3-70b-instruct, qwen/qwen-2.5-coder-32b-instruct)",
            "Add credits to your OpenRouter account if needed",
            "Alternative: Configure GEMINI_API_KEY in your environment instead"
          ]);
        }
        
        setStep("error");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to connect to OA backend service. Please check if the server is running.");
      setErrorType("CONNECTION_ERROR");
      setSuggestedActions([
        "Check if the backend server is running on port 5001",
        "Verify your network connection",
        "Try again in a few moments"
      ]);
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
        if (embeddedMode && typeof onComplete === "function") {
          // The orchestrator is waiting for this signal. The parent will
          // call /api/full-interview/<id>/round/complete which pulls the
          // OA report from oa_sessions and stores it in the parent.
          onComplete(data.result?.score || 0);
        } else {
          setStep("result");
        }
      }
    } catch (err) {
      fetchResult();
    }
  };

  const handleRestart = () => {
    sessionStorage.removeItem("vireza_oa_session_id");
    initializeNewSession();
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    await initializeNewSession();
  };

  if (step === "loading") {
    return (
      <div className="container py-5 text-center my-5">
        <div className="spinner-border text-primary me-2" role="status" style={{ width: "3rem", height: "3rem" }}></div>
        <h4 className="fw-bold text-dark mt-3">Initializing Round 1 — DSA Assessment...</h4>
        <p className="text-muted small">Checking AI services and generating tailored DSA questions...</p>
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className="container py-5 text-center my-5">
        <div className="alert alert-danger p-4 rounded-3 d-inline-block shadow-sm" style={{ maxWidth: "600px" }}>
          <i className="fa-solid fa-triangle-exclamation fs-2 mb-2 d-block"></i>
          <h5 className="fw-bold">Assessment Setup Error</h5>
          <p className="small mb-3">{errorMsg}</p>
          
          {suggestedActions.length > 0 && (
            <div className="text-start mb-3">
              <strong>Suggested actions:</strong>
              <ul className="small mb-0">
                {suggestedActions.map((action, index) => (
                  <li key={index}>{action}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="d-flex gap-2 justify-content-center">
            <button 
              onClick={handleRetry} 
              className="btn btn-danger btn-sm px-4 py-2"
              disabled={isRetrying}
            >
              {isRetrying ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Retrying...
                </>
              ) : (
                "Try Again"
              )}
            </button>
          </div>
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
