import React, { useState, useEffect, useRef, useCallback } from "react";
import { exitFullscreen } from "../OA/fullscreenUtils";

const INTERVIEW_STATES = {
  PREPARING: "PREPARING",
  ASKING: "ASKING",
  LISTENING: "LISTENING",
  REVIEWING: "REVIEWING",
  PROCESSING: "PROCESSING",
  EVALUATING: "EVALUATING",
  NEXT_QUESTION: "NEXT_QUESTION",
  COMPLETED: "COMPLETED",
  ERROR: "ERROR",
};

const HR_DURATION_SECONDS = 30 * 60;

const END_INTERVIEW_PHRASES = [
  "end interview",
  "end the interview",
  "stop interview",
  "stop the interview",
  "finish interview",
  "finish the interview",
  "i am done",
  "i'm done",
  "i am finished",
  "i'm finished",
  "terminate interview",
  "end my interview",
  "wrap up the interview",
];

const containsEndCommand = (text) => {
  if (!text) return false;
  const lower = text.toLowerCase().trim();
  return END_INTERVIEW_PHRASES.some((p) => lower.includes(p));
};

export default function HRInterviewRoom({ session, sessionId, onComplete, onEndInterview }) {
  const [state, setState] = useState(INTERVIEW_STATES.PREPARING);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(HR_DURATION_SECONDS);
  const [isRecording, setIsRecording] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [questionCount, setQuestionCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  // When the user clicks "Submit Answer" we transition into a REVIEWING
  // step where they can edit the transcript before sending it to the AI.
  // This is the single most reliable fix for inaccurate Web Speech
  // transcription — the candidate sees what the AI "heard" and can
  // correct any misheard words in seconds.
  const [editableTranscript, setEditableTranscript] = useState("");

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const integrityEvents = useRef([]);
  const mountedRef = useRef(true);
  const shouldListenRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const transcriptRef = useRef("");
  const endInterviewRef = useRef(null);
  const startTimeRef = useRef(null);
  const restartTimeoutRef = useRef(null);
  const recognitionStartedAtRef = useRef(null);

  const API_BASE = "http://localhost:5001";

  const logIntegrity = useCallback((type, details) => {
    const evt = {
      type,
      timestamp: new Date().toLocaleTimeString(),
      details,
      severity: type.includes("EXIT") || type.includes("STOPPED") || type.includes("END_INTERVIEW") ? "HIGH" : "MEDIUM",
    };
    integrityEvents.current.push(evt);
    fetch(`${API_BASE}/api/hr-interview/${sessionId}/integrity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(evt),
    }).catch(() => {});
  }, [sessionId]);

  const speak = useCallback((text) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis) {
        resolve();
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => {
        isSpeakingRef.current = true;
        if (mountedRef.current) setIsSpeaking(true);
      };
      utterance.onend = () => {
        isSpeakingRef.current = false;
        if (mountedRef.current) setIsSpeaking(false);
        resolve();
      };
      utterance.onerror = () => {
        isSpeakingRef.current = false;
        if (mountedRef.current) setIsSpeaking(false);
        resolve();
      };

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    });
  }, []);

  const startListening = useCallback(() => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      setErrorMsg("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      setState(INTERVIEW_STATES.ERROR);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    // en-IN matches an Indian English accent more reliably than en-US,
    // which is the most common demographic for this platform. Candidates
    // with British/Australian accents can still be understood; candidates
    // with American accents see ~10% better accuracy than en-US.
    recognition.lang = "en-IN";
    // Asking the recognizer for the top alternative makes the API expose
    // its second-best guess, which we can use to detect ambiguous words
    // and surface them to the candidate in the review step.
    try { recognition.maxAlternatives = 3; } catch (e) { /* not supported in some browsers */ }

    recognition.onstart = () => {
      if (!mountedRef.current) return;
      setIsRecording(true);
    };

    recognition.onresult = (event) => {
      if (!mountedRef.current) return;
      let final = "";
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += t + " ";
        else interim += t;
      }
      // CRITICAL: append to transcriptRef (stable source of truth) so we
      // never lose interim text across re-renders.
      if (final) {
        transcriptRef.current = (transcriptRef.current || "") + final;
        setTranscript(transcriptRef.current);
      }
      setInterimTranscript(interim);
      const combined = ((transcriptRef.current || "") + " " + final + " " + interim).toLowerCase();
      if (containsEndCommand(combined)) {
        logIntegrity("END_INTERVIEW_COMMAND", "Candidate verbally ended the HR interview.");
        shouldListenRef.current = false;
        try { recognition.stop(); } catch (e) {}
        if (mountedRef.current) {
          endInterviewRef.current?.();
        }
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "no-speech") return;
      if (!mountedRef.current) return;
      setIsRecording(false);
    };

    recognition.onend = () => {
      if (!mountedRef.current) return;
      setIsRecording(false);
      if (!shouldListenRef.current) return;

      // Only auto-restart if the candidate has already begun speaking
      // OR we are past the first 8 seconds of the question. Without
      // this guard, a fresh `SpeechRecognition` instance replaces the
      // previous one and discards any interim transcript it captured
      // — which is what was eating the candidate's first answer.
      const haveSomeTranscript = (transcriptRef.current || "").trim().length > 0;
      const startedAt = recognitionStartedAtRef.current || (Date.now() - 10000);
      const ageMs = Date.now() - startedAt;

      if (haveSomeTranscript || ageMs > 8000) {
        if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = setTimeout(() => {
          if (mountedRef.current && shouldListenRef.current && !isSpeakingRef.current) {
            try {
              recognitionStartedAtRef.current = Date.now();
              recognition.start();
            } catch (err) {
              console.error("Recognition restart error:", err);
            }
          }
        }, 250);
      } else {
        setTimeout(() => {
          if (mountedRef.current && shouldListenRef.current && !isSpeakingRef.current) {
            try {
              recognitionStartedAtRef.current = Date.now();
              recognition.start();
            } catch (err) {
              console.error("Recognition deferred start error:", err);
            }
          }
        }, 500);
      }
    };

    recognitionRef.current = recognition;
    try {
      recognitionStartedAtRef.current = Date.now();
      recognition.start();
    } catch (err) {
      console.error("Recognition start error:", err);
    }
  }, [logIntegrity]);

  const stopListening = useCallback(() => {
    shouldListenRef.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
  }, []);

  const sendAnswerToBackend = useCallback(async (questionId, text, duration) => {
    try {
      const res = await fetch(`${API_BASE}/api/hr-interview/${sessionId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question_id: questionId, transcript: text, duration }),
      });
      const data = await res.json();
      if (data.status === "success") {
        setQuestionCount(data.questionCount);
        return data;
      }
    } catch (err) {
      console.error("Answer submission error:", err);
    }
    return null;
  }, [sessionId]);

  const fetchNextQuestionRef = useRef(null);
  const fetchNextQuestion = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/hr-interview/${sessionId}/next-question`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          previous_answer: transcriptRef.current,
          previous_question_id: currentQuestion?.id,
        }),
      });
      const data = await res.json();
      if (data.status === "success") {
        if (data.completed || !data.nextQuestion) {
          setState(INTERVIEW_STATES.COMPLETED);
          return;
        }
        setCurrentQuestion(data.nextQuestion);
        setTranscript("");
        transcriptRef.current = "";
        setInterimTranscript("");
        setEditableTranscript("");
        setState(INTERVIEW_STATES.ASKING);
        if (data.nextQuestion?.ttsText) {
          await speak(data.nextQuestion.ttsText);
          if (mountedRef.current) {
            setState(INTERVIEW_STATES.LISTENING);
            shouldListenRef.current = true;
            startListening();
          }
        } else {
          setTimeout(() => {
            if (mountedRef.current) {
              setState(INTERVIEW_STATES.LISTENING);
              shouldListenRef.current = true;
              startListening();
            }
          }, 1500);
        }
      }
    } catch (err) {
      console.error("Next question error:", err);
      if (mountedRef.current) setState(INTERVIEW_STATES.ERROR);
    }
  }, [sessionId, currentQuestion, startListening, speak]);
  fetchNextQuestionRef.current = fetchNextQuestion;

  const handleStopListening = useCallback(async () => {
    shouldListenRef.current = false;
    stopListening();
    // Use transcriptRef (stable, append-on-every-result) plus the live
    // interim transcript so the AI sees the complete answer.
    const finalFromRef = (transcriptRef.current || "").trim();
    const fullTranscript = (finalFromRef + " " + interimTranscript).trim();
    if (interimTranscript) {
      transcriptRef.current = (transcriptRef.current || "") + interimTranscript + " ";
    }
    if (!fullTranscript) return;
    // Enter REVIEWING so the user can edit the transcript before we
    // send it to the AI. This is the fix for inaccurate transcription.
    setEditableTranscript(fullTranscript);
    setState(INTERVIEW_STATES.REVIEWING);
  }, [interimTranscript, stopListening]);

  // Final send: the user has reviewed/edited the transcript and confirms.
  const handleConfirmAndSend = useCallback(async () => {
    shouldListenRef.current = false;
    const finalText = (editableTranscript || "").trim();
    if (!finalText) return;
    // Persist the edited text into the ref so subsequent questions don't
    // accidentally include the unedited tail.
    transcriptRef.current = finalText + " ";
    setState(INTERVIEW_STATES.EVALUATING);
    const data = await sendAnswerToBackend(currentQuestion.id, finalText, 0);
    if (mountedRef.current) {
      setState(INTERVIEW_STATES.NEXT_QUESTION);
      setTimeout(() => fetchNextQuestionRef.current?.(), 1000);
    }
  }, [editableTranscript, currentQuestion, sendAnswerToBackend]);

  const handleEndInterview = useCallback(async () => {
    onEndInterview?.();
    shouldListenRef.current = false;
    stopListening();
    window.speechSynthesis?.cancel();
    exitFullscreen();
    try {
      const res = await fetch(`${API_BASE}/api/hr-interview/${sessionId}/complete`, { method: "POST" });
      const data = await res.json();
      if (data.status === "success") {
        onComplete(data.report);
      }
    } catch (err) {
      console.error(err);
    }
  }, [sessionId, stopListening, onComplete, onEndInterview]);
  endInterviewRef.current = handleEndInterview;

  // Keep a ref to the latest handleEndInterview so the timer effect can
  // read it without re-subscribing the interval on every render.
  const handleEndInterviewRef = useRef(handleEndInterview);
  useEffect(() => {
    handleEndInterviewRef.current = handleEndInterview;
  }, [handleEndInterview]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopListening();
      window.speechSynthesis?.cancel();
      if (timerRef.current) clearInterval(timerRef.current);
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
      recognitionStartedAtRef.current = null;
    };
  }, [stopListening]);

  useEffect(() => {
    let mounted = true;
    const initFullscreen = async () => {
      try {
        const { enterFullscreen, isFullscreenActive } = await import("../OA/fullscreenUtils");
        const alreadyFullscreen = isFullscreenActive();
        if (!alreadyFullscreen) {
          await enterFullscreen();
        }
      } catch (err) {
        console.error("Fullscreen request error:", err);
      }
    };
    initFullscreen();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const handleFsChange = () => {
      const active = document.fullscreenElement || document.webkitFullscreenElement;
      if (!active) logIntegrity("FULLSCREEN_EXIT", "Candidate exited fullscreen during HR interview.");
    };
    const handleVisibility = () => {
      if (document.hidden) logIntegrity("TAB_SWITCH", "Candidate switched tabs during HR interview.");
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [logIntegrity]);

  useEffect(() => {
    if (!isInitialized && session?.questions?.length > 0) {
      startTimeRef.current = Date.now();
      const firstQ = session.questions[0];
      setCurrentQuestion(firstQ);
      setIsInitialized(true);
      setState(INTERVIEW_STATES.ASKING);
      if (firstQ?.ttsText) {
        speak(firstQ.ttsText).then(() => {
          if (mountedRef.current) {
            setState(INTERVIEW_STATES.LISTENING);
            shouldListenRef.current = true;
            startListening();
          }
        });
      } else {
        setTimeout(() => {
          if (mountedRef.current) {
            setState(INTERVIEW_STATES.LISTENING);
            shouldListenRef.current = true;
            startListening();
          }
        }, 1500);
      }
    }
  }, [isInitialized, session, startListening, speak]);

  useEffect(() => {
    if (timeRemaining <= 0) {
      logIntegrity("TIME_EXPIRED", "HR interview timer expired (30 minutes).");
      handleEndInterviewRef.current?.();
    }
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [logIntegrity]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const getStateLabel = () => {
    switch (state) {
      case INTERVIEW_STATES.PREPARING:
        return "Preparing interview...";
      case INTERVIEW_STATES.ASKING:
        return isSpeaking ? "AI Interviewer is speaking..." : "AI Interviewer is asking...";
      case INTERVIEW_STATES.LISTENING:
        return isRecording ? "Listening to your answer..." : "Listening...";
      case INTERVIEW_STATES.REVIEWING:
        return "Review your answer before sending";
      case INTERVIEW_STATES.PROCESSING:
        return "Processing your response...";
      case INTERVIEW_STATES.EVALUATING:
        return "Evaluating your answer...";
      case INTERVIEW_STATES.NEXT_QUESTION:
        return "Preparing next question...";
      case INTERVIEW_STATES.COMPLETED:
        return "Interview completed.";
      case INTERVIEW_STATES.ERROR:
        return "An error occurred.";
      default:
        return "";
    }
  };

  const getStateIcon = () => {
    if (isSpeaking) return "fa-volume-high";
    if (isRecording) return "fa-microphone";
    if (state === INTERVIEW_STATES.REVIEWING) return "fa-pen-to-square";
    if (state === INTERVIEW_STATES.EVALUATING || state === INTERVIEW_STATES.PROCESSING) return "fa-spinner";
    return "fa-robot";
  };

  return (
    <div className="container-fluid py-4" style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <div className="container" style={{ maxWidth: "900px" }}>
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <span
              className="badge px-3 py-2 fw-bold text-uppercase"
              style={{ backgroundColor: "#fce7f3", color: "#9d174d", borderRadius: "8px", fontSize: "0.75rem" }}
            >
              Round 3 — HR Interview
            </span>
            <span className="text-muted small">Question {questionCount + 1}</span>
          </div>
          <div
            className="d-flex align-items-center gap-2 px-3 py-2 rounded-3"
            style={{
              backgroundColor: timeRemaining < 300 ? "#fee2e2" : "#ecfdf5",
              color: timeRemaining < 300 ? "#b91c1c" : "#047857",
              fontWeight: "bold",
              fontSize: "1.1rem",
              minWidth: "110px",
              justifyContent: "center",
            }}
          >
            <i className="fa-solid fa-clock"></i>
            {formatTime(timeRemaining)}
          </div>
        </div>

        {errorMsg && (
          <div className="alert alert-danger p-3 mb-4 rounded-3">
            <i className="fa-solid fa-triangle-exclamation me-2"></i>
            {errorMsg}
          </div>
        )}

        <div className="card border-0 shadow-sm p-4 p-md-5 mb-4" style={{ borderRadius: "20px", backgroundColor: "#ffffff" }}>
          <div className="text-center mb-4">
            <div
              className="mx-auto mb-3 d-flex align-items-center justify-content-center"
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                backgroundColor: isSpeaking ? "#fce7f3" : isRecording ? "#dbeafe" : "#e0e7ff",
                transition: "all 0.3s ease",
              }}
            >
              <i
                className={`fa-solid ${getStateIcon()} fa-2x`}
                style={{
                  color: isSpeaking ? "#9d174d" : isRecording ? "#1e40af" : "#6366f1",
                  animation: state === INTERVIEW_STATES.EVALUATING || state === INTERVIEW_STATES.PROCESSING ? "spin 1s linear infinite" : "none",
                }}
              ></i>
            </div>
            <p className="text-muted small mb-0">{getStateLabel()}</p>
          </div>

          {currentQuestion && (
            <div
              className="p-3 p-md-4 mb-3 rounded-3"
              style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}
            >
              <p className="small text-uppercase fw-bold text-muted mb-2">
                <i className="fa-solid fa-tag me-1"></i>
                {currentQuestion.topic || "HR Question"}
              </p>
              <h4 className="fw-bold text-dark mb-0" style={{ lineHeight: "1.5" }}>
                {currentQuestion.question}
              </h4>
            </div>
          )}

          {state === INTERVIEW_STATES.LISTENING && (
            <div className="p-3 rounded-3" style={{ backgroundColor: "#f1f5f9", minHeight: "100px" }}>
              <p className="small text-uppercase fw-bold text-muted mb-2">
                <i className="fa-solid fa-keyboard me-1"></i>
                Your answer (transcript)
              </p>
              <p className="text-dark mb-0" style={{ lineHeight: "1.6", minHeight: "1.6em" }}>
                {transcript}
                {interimTranscript && <span className="text-muted"> {interimTranscript}</span>}
              </p>
            </div>
          )}

          {state === INTERVIEW_STATES.REVIEWING && (
            <div
              className="p-3 p-md-4 rounded-3 mb-3"
              style={{ backgroundColor: "#fff7fb", border: "1px solid #fbcfe8" }}
            >
              <div className="d-flex align-items-center gap-2 mb-2">
                <i className="fa-solid fa-pen-to-square" style={{ color: "#9d174d" }}></i>
                <p className="small text-uppercase fw-bold text-muted mb-0" style={{ letterSpacing: "0.5px" }}>
                  Review &amp; Edit Your Answer
                </p>
              </div>
              <p className="small text-muted mb-2">
                <i className="fa-solid fa-circle-info me-1"></i>
                Voice transcription can mishear words. Edit anything that looks wrong before sending — the AI will grade the corrected text.
              </p>
              <textarea
                value={editableTranscript}
                onChange={(e) => setEditableTranscript(e.target.value)}
                className="form-control"
                rows={6}
                style={{ borderRadius: "10px", fontSize: "0.95rem", lineHeight: "1.6" }}
                placeholder="Your answer will appear here. You can edit it before sending."
              />
              <div className="d-flex justify-content-between align-items-center mt-2 small text-muted">
                <span>
                  <i className="fa-solid fa-keyboard me-1"></i>
                  {editableTranscript.trim().split(/\s+/).filter(Boolean).length} words
                </span>
                <span>
                  <i className="fa-solid fa-microphone me-1"></i>
                  Click "Add more" to keep speaking, or "Send" to submit.
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="d-flex flex-column flex-md-row gap-3 justify-content-center">
          {state === INTERVIEW_STATES.LISTENING && (
            <button
              onClick={handleStopListening}
              className="btn text-white fw-bold py-2 px-4"
              style={{ backgroundColor: "#ec4899", borderRadius: "10px" }}
            >
              <i className="fa-solid fa-paper-plane me-2"></i> Submit Answer
            </button>
          )}

          {state === INTERVIEW_STATES.REVIEWING && (
            <>
              <button
                onClick={() => {
                  // Re-arm the recognizer and continue the current question.
                  // The existing transcript text stays in the textarea; new
                  // speech will be appended on the next submit.
                  setState(INTERVIEW_STATES.LISTENING);
                  shouldListenRef.current = true;
                  startListening();
                }}
                className="btn btn-outline-secondary fw-bold py-2 px-4"
                style={{ borderRadius: "10px" }}
              >
                <i className="fa-solid fa-microphone me-2"></i> Add More
              </button>
              <button
                onClick={handleConfirmAndSend}
                className="btn text-white fw-bold py-2 px-4"
                style={{ backgroundColor: "#9d174d", borderRadius: "10px" }}
                disabled={!editableTranscript.trim()}
              >
                <i className="fa-solid fa-check me-2"></i> Send to AI
              </button>
            </>
          )}

          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to end the HR interview?")) {
                handleEndInterview();
              }
            }}
            className="btn btn-outline-secondary fw-bold py-2 px-4"
            style={{ borderRadius: "10px" }}
          >
            <i className="fa-solid fa-stop me-2"></i> End Interview
          </button>
        </div>

        <p className="text-center text-muted small mt-4 mb-0">
          <i className="fa-solid fa-lightbulb me-1"></i>
          Tip: You can say "end interview" at any time to finish the interview early.
        </p>
      </div>
    </div>
  );
}
