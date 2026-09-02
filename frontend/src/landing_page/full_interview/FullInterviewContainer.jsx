import React, { useState, useEffect } from "react";
import FullInterviewRulesPage from "./FullInterviewRulesPage";
import FullInterviewSystemCheckPage from "./FullInterviewSystemCheckPage";
import TransitionScreen from "./TransitionScreen";
import FullInterviewComplete from "./FullInterviewComplete";
import FullInterviewReport from "./FullInterviewReport";
import { getOrCreateCandidateId, loadCachedPermissions, clearCachedPermissions } from "./permissionsCache";
import RoundTransitionNotification from "../shared/RoundTransitionNotification";

import OAMainContainer from "../OA/OAMainContainer";
import TechnicalInterviewContainer from "../technical_interview/TechnicalInterviewContainer";
import HRInterviewContainer from "../hr_interview/HRInterviewContainer";
const STORAGE_KEY = "vireza_full_session_id";
const RESUME_TEXT_KEY = "ats_resume_text";
const SKILLS_KEY = "ats_skills";
const FULL_ACCENT = "#7c3aed"; // matches the Full Interview purple branding

const API_BASE = "http://localhost:5001";

const STEPS = {
  LOADING: "loading",
  RULES: "rules",
  SYSTEM_CHECK: "system_check",
  TRANSITION: "transition",
  OA: "oa",
  TECHNICAL: "technical",
  HR: "hr",
  COMPLETE: "complete",
  REPORT: "report",
  ERROR: "error",
};

export default function FullInterviewContainer() {
  const [step, setStep] = useState(STEPS.LOADING);
  const [session, setSession] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [sessionConfig, setSessionConfig] = useState(null);
  const [report, setReport] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [transitionMeta, setTransitionMeta] = useState({ justCompleted: null, lastScore: null });
  // When an "End Interview" click (or round completion) kicks off the orchestrated
  // transition to the next round, we show a clearly-visible loading notification so
  // the user knows the next round is being prepared. The pop-up stays visible until
  // the next stage (transition screen / report( renders.

  const [isNextRoundLoading, setIsNextRoundLoading] = useState(false);
  // Holds the snapshot returned from /round/begin for the currently active
  // round. We pass this to the child round container so it knows the session
  // id, questions, etc. without making its own /start call.
  const [activeRoundSnapshot, setActiveRoundSnapshot] = useState(null);
  const [candidateId] = useState(getOrCreateCandidateId());

  // Fetch the public config (rounds, weights, durations) once on mount
  useEffect(() => {
    fetch(`${API_BASE}/api/full-interview/config`)
      .then((r) => r.json())
      .then((d) => {
        if (d.status === "success") setSessionConfig(d.config);
      })
      .catch(() => {});
  }, []);

  // On mount: either resume from sessionStorage, or initialize a new session
  useEffect(() => {
    const existingId = sessionStorage.getItem(STORAGE_KEY);
    if (existingId) {
      fetch(`${API_BASE}/api/full-interview/${existingId}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.status === "success" && d.session) {
            setSession(d.session);
            setSessionId(existingId);
            resumeFromState(d.session);
          } else {
            initializeNewSession();
          }
        })
        .catch(() => initializeNewSession());
    } else {
      initializeNewSession();
    }
  }, []);

  const resumeFromState = (s) => {
    // Map server-side current_round to a UI step
    if (s.status === "PENDING" || s.status === "RULES_ACCEPTED") {
      setStep(STEPS.RULES);
    } else if (s.status === "SYSTEM_CHECK_PASSED") {
      setStep(STEPS.TRANSITION);
    } else if (s.status === "IN_PROGRESS" || s.status === "EXPIRED") {
      // Jump to the active round, or transition if between rounds
      routeToRoundOrTransition(s);
    } else if (s.status === "COMPLETED") {
      setReport(s.final_report);
      setStep(STEPS.REPORT);
    } else if (s.status === "ABORTED") {
      setErrorMsg("This Full Interview attempt was aborted.");
      setStep(STEPS.ERROR);
    }
  };

  const routeToRoundOrTransition = (s) => {
    const cr = s.current_round;
    if (cr === "oa") setStep(STEPS.OA);
    else if (cr === "technical") setStep(STEPS.TECHNICAL);
    else if (cr === "hr") setStep(STEPS.HR);
    else if (cr === "final" || cr === "done") {
      // All rounds complete; synthesize the report
      synthesizeReport();
    } else {
      setStep(STEPS.TRANSITION);
    }
  };

  const initializeNewSession = async () => {
    setStep(STEPS.LOADING);
    try {
      const savedResumeText = sessionStorage.getItem(RESUME_TEXT_KEY) || "";
      let skills = [];
      try {
        const atsResult = localStorage.getItem("ats_result");
        if (atsResult) {
          const parsed = JSON.parse(atsResult);
          skills = parsed?.resume_analysis?.skills || [];
        }
      } catch {}

      const body = {
        candidate_id: candidateId,
        candidate_profile: {
          candidateId: candidateId,
          targetRole: "Software Engineer",
          skills: skills.length > 0 ? skills : (sessionStorage.getItem(SKILLS_KEY) ? JSON.parse(sessionStorage.getItem(SKILLS_KEY)) : []),
        },
        resume_text: savedResumeText || "Software engineer candidate with general programming experience.",
        target_role: "Software Engineer",
      };

      const res = await fetch(`${API_BASE}/api/full-interview/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.status === "success") {
        setSession(data.session);
        setSessionId(data.session.id);
        sessionStorage.setItem(STORAGE_KEY, data.session.id);
        setStep(STEPS.RULES);
      } else {
        setErrorMsg("Failed to initialize Full Interview: " + (data.message || "unknown error"));
        setStep(STEPS.ERROR);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to connect to backend service.");
      setStep(STEPS.ERROR);
    }
  };

  const acceptRules = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/full-interview/${sessionId}/accept-rules`, { method: "POST" });
      const data = await res.json();
      if (data.status === "success") {
        setSession(data.session);
        setStep(STEPS.SYSTEM_CHECK);
      } else {
        setErrorMsg(data.message || "Failed to accept rules");
        setStep(STEPS.ERROR);
      }
    } catch (err) {
      setErrorMsg("Failed to accept rules: " + err.message);
      setStep(STEPS.ERROR);
    }
  };

  const submitSystemCheck = async (permissions) => {
    try {
      const res = await fetch(`${API_BASE}/api/full-interview/${sessionId}/system-check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions }),
      });
      const data = await res.json();
      if (data.status === "success") {
        setSession(data.session);
        // Begin first round immediately
        await beginRound("oa");
      } else {
        setErrorMsg(data.message || "System check failed");
        setStep(STEPS.ERROR);
      }
    } catch (err) {
      setErrorMsg("System check failed: " + err.message);
      setStep(STEPS.ERROR);
    }
  };

  const beginRound = async (roundKey) => {
    try {
      console.log(`[FullInterview] Starting round: ${roundKey}`);
      
      const res = await fetch(`${API_BASE}/api/full-interview/${sessionId}/round/begin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ round: roundKey }),
      });
      const data = await res.json();
      
      console.log(`[FullInterview] Begin round response:`, data);
      
      // The orchestrator returns either {status: "success", round, round_session_id, snapshot}
      // (for SKIPPED) or {status: "success", round, round_status: "IN_PROGRESS", ...}.
      // We treat as success when:
      //   - the HTTP envelope says success, OR
      //   - we have a round_session_id + snapshot (the round was started), OR
      //   - round_status === "SKIPPED" (round disabled but acknowledged).
      const isSkipped = data.round_status === "SKIPPED" || data.status === "SKIPPED";
      const hasSnapshot = !!(data.snapshot && (data.round_session_id || isSkipped));
      const ok = data.status === "success" || hasSnapshot || isSkipped;

      if (!ok) {
        console.error(`[FullInterview] Failed to start ${roundKey} round:`, data);
        setErrorMsg(data.message || `Failed to start ${roundKey} round`);
        setStep(STEPS.ERROR);
        return;
      }

      await refreshSession();
      setActiveRoundSnapshot(data.snapshot || null);

      if (isSkipped) {
        // Round disabled — skip to the next one
        console.log(`[FullInterview] Round ${roundKey} is skipped, moving to next`);
        handleRoundComplete(roundKey, 0);
        return;
      }
      
      console.log(`[FullInterview] Successfully started ${roundKey} round, setting step`);
      if (roundKey === "oa") setStep(STEPS.OA);
      else if (roundKey === "technical") setStep(STEPS.TECHNICAL);
      else if (roundKey === "hr") setStep(STEPS.HR);
    } catch (err) {
      console.error(`[FullInterview] Error starting ${roundKey} round:`, err);
      setErrorMsg(`Failed to start ${roundKey} round: ${err.message}`);
      setStep(STEPS.ERROR);
    }
  };

  // Returns true if a later enabled round still has to run after `roundKey`.
  // Used to decide whetherthe orchestrator will transition to a new round.


  
  const hasNextRound = (roundKey) => {
    const enabled = session?.enabled_rounds || ["oa", "technical", "hr"];
    const idx = enabled.indexOf(roundKey);
    return idx >= 0 && idx < enabled.length - 1;
  };

  
  const handleRoundComplete = async (roundKey, score) => {
    try {
      // If another enabled round follows, show the loading-next-round notification
      // immediately so the user gets feedback while the orchestrator advances.



      
      if (hasNextRound(roundKey)) setIsNextRoundLoading(true);
      console.log(`[FullInterview] Completing round: ${roundKey} with score: ${score}`);
      
      const res = await fetch(`${API_BASE}/api/full-interview/${sessionId}/round/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ round: roundKey }),
      });
      const data = await res.json();
      
      console.log(`[FullInterview] Round complete response:`, data);
      
      // /round/complete returns {status: "success", round, score, next_round}.
      const ok = data.status === "success" || (data.round && typeof data.next_round !== "undefined");
      if (ok) {
        setActiveRoundSnapshot(null);
        setTransitionMeta({ justCompleted: roundKey, lastScore: score });
        
        // Refresh session to get updated state
        const updatedSession = await refreshSession();
        console.log(`[FullInterview] Updated session after round complete:`, updatedSession);
        
        if (data.next_round === "final" || data.next_round === "done" || updatedSession?.current_round === "final") {
          // All enabled rounds done — synthesize final report
          setIsNextRoundLoading(false);
          console.log(`[FullInterview] All rounds complete, synthesizing report`);
          await synthesizeReport();
        } else {
          setIsNextRoundLoading(false);
          console.log(`[FullInterview] Moving to transition screen, next round: ${data.next_round}`);
          setStep(STEPS.TRANSITION);
        }
      } else {
        setIsNextRoundLoading(false);
        setErrorMsg(data.message || `Failed to complete ${roundKey} round`);
        setStep(STEPS.ERROR);
      }
    } catch (err) {
      setIsNextRoundLoading(false);
      console.error(`[FullInterview] Error completing round ${roundKey}:`, err);
      setErrorMsg(`Failed to complete ${roundKey} round: ${err.message}`);
      setStep(STEPS.ERROR);
    }
  };

  const continueFromTransition = async () => {
    console.log(`[FullInterview] Continue from transition, current session:`, session);
    
    // Refresh session to ensure we have the latest state
    const updated = await refreshSession();
    console.log(`[FullInterview] Refreshed session for transition:`, updated);
    
    const next = updated?.current_round;
    console.log(`[FullInterview] Next round from transition: ${next}`);
    
    if (!next || next === "final" || next === "done") {
      console.log(`[FullInterview] No next round, synthesizing report`);
      await synthesizeReport();
      return;
    }
    
    console.log(`[FullInterview] Starting next round: ${next}`);
    await beginRound(next);
  };

  const synthesizeReport = async () => {
    setIsNextRoundLoading(false);
    setStep(STEPS.LOADING);
    try {
      const res = await fetch(`${API_BASE}/api/full-interview/${sessionId}/synthesize-report`, { method: "POST" });
      const data = await res.json();
      if (data.status === "success") {
        setReport(data.report);
        setSession(data.session);
        setStep(STEPS.COMPLETE);
      } else {
        setErrorMsg(data.message || "Failed to synthesize report");
        setStep(STEPS.ERROR);
      }
    } catch (err) {
      setErrorMsg("Failed to synthesize report: " + err.message);
      setStep(STEPS.ERROR);
    }
  };

  const refreshSession = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/full-interview/${sessionId}`);
      const data = await res.json();
      if (data.status === "success") {
        setSession(data.session);
        return data.session;
      }
    } catch {}
    return null;
  };

  const handleBackToDashboard = () => {
    setIsNextRoundLoading(false);
    sessionStorage.removeItem(STORAGE_KEY);
    clearCachedPermissions();
    window.location.href = "/AiInterviewcoach";
  };

  // ------------------------------------------------------------------------
  // Renders
  // ------------------------------------------------------------------------

  if (step === STEPS.LOADING) {
    return (
      <div className="container py-5 text-center my-5">
        <div className="spinner-border text-primary me-2" role="status" style={{ width: "3rem", height: "3rem" }}></div>
        <h4 className="fw-bold text-dark mt-3">Initializing Full Interview...</h4>
        <p className="text-muted small">Setting up the orchestrated pipeline.</p>
      </div>
    );
  }

  if (step === STEPS.ERROR) {
    return (
      <div className="container py-5 text-center my-5">
        <div className="alert alert-danger p-4 rounded-3 d-inline-block shadow-sm">
          <i className="fa-solid fa-triangle-exclamation fs-2 mb-2 d-block"></i>
          <h5 className="fw-bold">Full Interview Error</h5>
          <p className="small mb-3">{errorMsg}</p>
          <button onClick={handleBackToDashboard} className="btn btn-primary btn-sm px-4 py-2">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (step === STEPS.RULES) {
    return (
      <FullInterviewRulesPage
        onAccept={acceptRules}
        sessionConfig={sessionConfig}
        candidateId={candidateId}
      />
    );
  }

  if (step === STEPS.SYSTEM_CHECK) {
    return (
      <FullInterviewSystemCheckPage
        onComplete={submitSystemCheck}
        candidateId={candidateId}
        sessionId={sessionId}
      />
    );
  }

  if (step === STEPS.TRANSITION) {
    return (
      <TransitionScreen
        session={session}
        nextRound={session?.current_round}
        justCompleted={transitionMeta.justCompleted}
        lastScore={transitionMeta.lastScore}
        onContinue={continueFromTransition}
      />
    );
  }

  if (step === STEPS.OA) {
    // Build an initial session object for OAMainContainer from the snapshot
    // returned by /round/begin. The snapshot includes questions, codeByQuestion,
    // and timer info so the editor renders correctly without making its own
    // /api/oa/start call.
    const oaInitialSession = activeRoundSnapshot
      ? {
          id: activeRoundSnapshot.id,
          questions: activeRoundSnapshot.questions || [],
          codeByQuestion: activeRoundSnapshot.codeByQuestion || {},
          endsAt: activeRoundSnapshot.endsAt,
          durationMinutes: activeRoundSnapshot.durationMinutes,
          status: activeRoundSnapshot.status || "IN_PROGRESS",
        }
      : null;

    return (
      <RoundWrapper
        session={session}
        roundKey="oa"
        isLoadingNext={isNextRoundLoading}
        onComplete={(score) => handleRoundComplete("oa", score)}
        onAbort={handleBackToDashboard}
      >
        <OAMainContainer
          key={`oa-${activeRoundSnapshot?.id || "init"}`}
          embeddedMode={true}
          initialSession={oaInitialSession}
          onComplete={(score) => handleRoundComplete("oa", score)}
        />
      </RoundWrapper>
    );
  }

  if (step === STEPS.TECHNICAL) {
    const tiInitialSession = activeRoundSnapshot
      ? {
          id: activeRoundSnapshot.id,
          questions: activeRoundSnapshot.questions || [activeRoundSnapshot.firstQuestion].filter(Boolean),
          endsAt: activeRoundSnapshot.endsAt,
          durationMinutes: activeRoundSnapshot.durationMinutes,
          status: activeRoundSnapshot.status || "IN_PROGRESS",
          candidateProfile: session?.locked_candidate_profile,
        }
      : null;
    return (
      <RoundWrapper
        session={session}
        roundKey="technical"
        isLoadingNext={isNextRoundLoading}
        onComplete={(score) => handleRoundComplete("technical", score)}
        onAbort={handleBackToDashboard}
      >
        <TechnicalInterviewContainer
          key={`ti-${activeRoundSnapshot?.id || "init"}`}
          onEndInterview={() => {
            if (hasNextRound("technical")) setIsNextRoundLoading(true);
          }}
          embeddedMode={true}
          initialSession={tiInitialSession}
          onComplete={(score) => handleRoundComplete("technical", score)}
        />
      </RoundWrapper>
    );
  }

  if (step === STEPS.HR) {
    const hrInitialSession = activeRoundSnapshot
      ? {
          id: activeRoundSnapshot.id,
          questions: activeRoundSnapshot.questions || [activeRoundSnapshot.firstQuestion].filter(Boolean),
          endsAt: activeRoundSnapshot.endsAt,
          durationMinutes: activeRoundSnapshot.durationMinutes,
          status: activeRoundSnapshot.status || "IN_PROGRESS",
          candidateProfile: session?.locked_candidate_profile,
        }
      : null;
    return (
      <RoundWrapper
        session={session}
        roundKey="hr"
        isLoadingNext={isNextRoundLoading}
        onComplete={(score) => handleRoundComplete("hr", score)}
        onAbort={handleBackToDashboard}
      >
        <HRInterviewContainer
          key={`hr-${activeRoundSnapshot?.id || "init"}`}
          onEndInterview={() => {
            if (hasNextRound("hr")) setIsNextRoundLoading(true);
          }}
          embeddedMode={true}
          initialSession={hrInitialSession}
          onComplete={(score) => handleRoundComplete("hr", score)}
        />
      </RoundWrapper>
    );
  }

  if (step === STEPS.COMPLETE) {
    return (
      <FullInterviewComplete
        session={session}
        onViewReport={() => setStep(STEPS.REPORT)}
        onBack={handleBackToDashboard}
      />
    );
  }

  if (step === STEPS.REPORT) {
    return <FullInterviewReport report={report} onBack={handleBackToDashboard} />;
  }

  return null;
}

// ----------------------------------------------------------------------------
// RoundWrapper — adds a thin status bar on top of any round showing overall
// progress in the Full Interview. While the orchestrator prepares the next
// round (after the user clicks "End Interview") the shared
// RoundTransitionNotification overlay is shown so the user always knows
// another round is being loaded.
// ----------------------------------------------------------------------------

function RoundWrapper({ session, roundKey, onComplete, onAbort, children, isLoadingNext = false }) {
  const enabled = session?.enabled_rounds || ["oa", "technical", "hr"];
  const idx = enabled.indexOf(roundKey);
  return (
    <div>
      <div
        className="px-3 py-2 d-flex justify-content-between align-items-center flex-wrap gap-2"
        style={{ backgroundColor: "#f1f5f9", borderBottom: "1px solid #e2e8f0" }}
      >
        <div className="d-flex align-items-center gap-2">
          <span
            className="badge px-3 py-2 fw-bold text-uppercase"
            style={{ backgroundColor: "#ede9fe", color: "#5b21b6", borderRadius: "8px", fontSize: "0.7rem" }}
          >
            Full Interview
          </span>
          <span className="text-muted small">
            Round {idx + 1} of {enabled.length}
          </span>
        </div>
        <div className="d-flex gap-1">
          {enabled.map((rk) => {
            const block = session?.round_status?.[rk] || {};
            const isComplete = block.status === "COMPLETED";
            const isActive = rk === roundKey;
            return (
              <div
                key={rk}
                style={{
                  width: "30px",
                  height: "6px",
                  borderRadius: "3px",
                  backgroundColor: isComplete ? "#00d084" : isActive ? "#7c3aed" : "#cbd5e1",
                }}
              ></div>
            );
          })}
        </div>
      </div>
      {children}
      <RoundTransitionNotification
        visible={isLoadingNext}
        accentColor={FULL_ACCENT}
      />
    </div>
  );
}
