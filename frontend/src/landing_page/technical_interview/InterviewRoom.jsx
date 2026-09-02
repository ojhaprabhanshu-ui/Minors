import React, { useState, useEffect, useRef, useCallback } from "react";
import { exitFullscreen } from "../OA/fullscreenUtils";

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

export default function InterviewRoom({ session, sessionId, onComplete, onEndInterview }) {
  const [state, setState] = useState(INTERVIEW_STATES.PREPARING);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(20 * 60);
  const [isRecording, setIsRecording] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [questionCount, setQuestionCount] = useState(0);
  const [evaluation, setEvaluation] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  // REVIEWING step: user edits the transcript before sending to the AI.
  const [editableTranscript, setEditableTranscript] = useState("");

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);
  const screenStreamRef = useRef(null);
  const timerRef = useRef(null);
  const integrityEvents = useRef([]);
  const mountedRef = useRef(true);
  const shouldListenRef = useRef(false);
  const speechQueueRef = useRef([]);
  const isSpeakingRef = useRef(false);
  const transcriptRef = useRef("");
  const endInterviewRef = useRef(null);
  const interviewInitializedRef = useRef(false);
  const restartTimeoutRef = useRef(null);
  const recognitionStartedAtRef = useRef(null);

  const API_BASE = "http://localhost:5001";
  const MAX_QUESTIONS = 7;

  // Initialize the interview exactly once when the session becomes available.
  // This is the ONLY place we set the first question and arm the listener.
  // The previous implementation had a second `useEffect` that ALSO set the
  // first question and called startListening(), which created a double-arm
  // race that frequently ate the candidate's first answer (the second
  // startListening() would replace the first recognition instance and
  // discard any interim transcript it had captured).
  useEffect(() => {
    if (interviewInitializedRef.current) return;
    if (!session?.questions || session.questions.length === 0) return;

    interviewInitializedRef.current = true;
    const firstQ = session.questions[0];
    console.log("[InterviewRoom] Initializing with first question:", firstQ);
    setCurrentQuestion(firstQ);
    setQuestionCount(1);
    setState(INTERVIEW_STATES.ASKING);
    transcriptRef.current = "";
    setTranscript("");
    setInterimTranscript("");

    const armListening = () => {
      if (!mountedRef.current) return;
      setState(INTERVIEW_STATES.LISTENING);
      shouldListenRef.current = true;
      startListening();
    };

    if (firstQ?.ttsText) {
      speak(firstQ.ttsText).then(armListening);
    } else {
      setTimeout(armListening, 1500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id]);

  const cleanupMedia = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const logIntegrity = useCallback((type, details) => {
    const evt = {
      type,
      timestamp: new Date().toLocaleTimeString(),
      details,
      severity: type.includes("EXIT") || type.includes("STOPPED") ? "HIGH" : "MEDIUM",
    };
    integrityEvents.current.push(evt);
    fetch(`${API_BASE}/api/technical-interview/${sessionId}/integrity`, {
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
    // en-IN: more accurate for the dominant user base; works well for
    // American/British English too. Pairs with the REVIEWING step so
    // any misheard words are easy to fix.
    recognition.lang = "en-IN";
    try { recognition.maxAlternatives = 3; } catch (e) { /* not supported */ }

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
      // CRITICAL: append to transcriptRef (the stable source of truth), not
      // the React state, to avoid losing interim text across re-renders.
      if (final) {
        transcriptRef.current = (transcriptRef.current || "") + final;
        setTranscript(transcriptRef.current);
      }
      setInterimTranscript(interim);
      const combined = ((transcriptRef.current || "") + " " + final + " " + interim).toLowerCase();
      if (containsEndCommand(combined)) {
        logIntegrity("END_INTERVIEW_COMMAND", "Candidate verbally ended the interview.");
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

      // IMPORTANT: only auto-restart if the candidate has already begun
      // speaking OR we are past the very first 8 seconds of the question.
      // Previously, the recognition would fire `onend` after a few seconds
      // of silence and immediately re-create a SpeechRecognition instance,
      // which would discard any interim transcript captured by the first
      // instance — this is what was eating the first answer.
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
        // First 8s of a fresh question: keep the listener armed but do
        // not re-arm the recognition. The candidate hasn't spoken yet,
        // and re-arming now would clobber the first answer.
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
      const res = await fetch(`${API_BASE}/api/technical-interview/${sessionId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question_id: questionId, transcript: text, duration }),
      });
      const data = await res.json();
      if (data.status === "success") {
        setEvaluation(data.evaluation);
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
      const res = await fetch(`${API_BASE}/api/technical-interview/${sessionId}/next-question`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ previous_answer: transcript, previous_question_id: currentQuestion?.id }),
      });
      const data = await res.json();
      if (data.status === "success") {
        if (data.completed || !data.nextQuestion) {
          setState(INTERVIEW_STATES.COMPLETED);
          return;
        }
        setCurrentQuestion(data.nextQuestion);
        // Reset the transcript source of truth BEFORE the new question
        // is announced so the first answer to the new question is
        // captured into a clean transcriptRef.
        transcriptRef.current = "";
        setTranscript("");
        setInterimTranscript("");
        setEditableTranscript("");
        setEvaluation(null);
        setState(INTERVIEW_STATES.ASKING);
        if (data.nextQuestion?.ttsText) {
          speak(data.nextQuestion.ttsText).then(() => {
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
    } catch (err) {
      console.error("Next question error:", err);
      if (mountedRef.current) setState(INTERVIEW_STATES.ERROR);
    }
  }, [sessionId, transcript, currentQuestion, startListening, speak]);
  fetchNextQuestionRef.current = fetchNextQuestion;

  const handleStopListening = useCallback(async () => {
    shouldListenRef.current = false;
    stopListening();
    // Use transcriptRef (stable, append-on-every-result) plus the live
    // interim transcript (the most recent un-finalized chunk) so the AI
    // sees the complete answer, not whatever React state has flushed.
    const finalFromRef = (transcriptRef.current || "").trim();
    const fullTranscript = (finalFromRef + " " + interimTranscript).trim();
    if (!fullTranscript) return;
    // Push the interim chunk into the ref so it isn't lost on next question.
    if (interimTranscript) {
      transcriptRef.current = (transcriptRef.current || "") + interimTranscript + " ";
    }
    // REVIEWING step: let the candidate correct any misheard words
    // before the transcript reaches the AI.
    setEditableTranscript(fullTranscript);
    setState(INTERVIEW_STATES.REVIEWING);
  }, [interimTranscript, stopListening]);

  const handleConfirmAndSend = useCallback(async () => {
    shouldListenRef.current = false;
    const finalText = (editableTranscript || "").trim();
    if (!finalText) return;
    transcriptRef.current = finalText + " ";
    setState(INTERVIEW_STATES.EVALUATING);
    const data = await sendAnswerToBackend(currentQuestion.id, finalText, 0);
    const answeredCount = data?.questionCount || questionCount;
    if (answeredCount >= MAX_QUESTIONS) {
      setState(INTERVIEW_STATES.COMPLETED);
    } else {
      setState(INTERVIEW_STATES.NEXT_QUESTION);
      setTimeout(() => fetchNextQuestionRef.current?.(), 1000);
    }
  }, [editableTranscript, currentQuestion, questionCount, sendAnswerToBackend]);

  const handleEndInterview = async () => {
    onEndInterview?.();
    shouldListenRef.current = false;
    stopListening();
    cleanupMedia();
    window.speechSynthesis?.cancel();
    exitFullscreen();
    try {
      const res = await fetch(`${API_BASE}/api/technical-interview/${sessionId}/complete`, { method: "POST" });
      const data = await res.json();
      if (data.status === "success") {
        onComplete(data.report);
      }
    } catch (err) {
      console.error(err);
    }
  };
  endInterviewRef.current = handleEndInterview;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      cleanupMedia();
      stopListening();
      window.speechSynthesis?.cancel();
      if (timerRef.current) clearInterval(timerRef.current);
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
      recognitionStartedAtRef.current = null;
    };
  }, [cleanupMedia, stopListening]);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (mounted) {
          streamRef.current = cameraStream;
          if (videoRef.current) videoRef.current.srcObject = cameraStream;
        }
      } catch (err) {
        console.error("Media init error:", err);
      }
    };
    init();
    return () => {
      mounted = false;
    };
  }, [logIntegrity]);

  useEffect(() => {
    const handleFsChange = () => {
      const active = document.fullscreenElement || document.webkitFullscreenElement;
      setIsFullscreen(!!active);
      if (!active) logIntegrity("FULLSCREEN_EXIT", "Candidate exited fullscreen.");
    };
    const handleVisibility = () => {
      if (document.hidden) logIntegrity("TAB_SWITCH", "Candidate switched tabs.");
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [logIntegrity]);

  useEffect(() => {
    let mounted = true;
    const initFullscreen = async () => {
      try {
        const { enterFullscreen, isFullscreenActive } = await import("../OA/fullscreenUtils");
        const alreadyFullscreen = isFullscreenActive();
        if (!alreadyFullscreen) {
          await enterFullscreen();
        }
        if (mounted) {
          setIsFullscreen(true);
        }
      } catch (err) {
        console.error("Fullscreen request error:", err);
      }
    };
    initFullscreen();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isInitialized && session?.questions?.length > 0) {
      // No-op: first-question initialization is now handled by the single
      // guarded effect above (interviewInitializedRef). Keeping this stub
      // for backward-compat with anything that reads `isInitialized`.
      setIsInitialized(true);
    }
  }, [isInitialized, session]);

  useEffect(() => {
    if (timeRemaining <= 0) {
      handleEndInterview();
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
  }, []);

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
        return "Interview completed";
      default:
        return "Interview in progress";
    }
  };

  return (
    <div className="d-flex flex-column vh-100 bg-light overflow-hidden">
      <header
        className="d-flex align-items-center justify-content-between px-4 py-2 border-bottom"
        style={{ backgroundColor: "#ffffff", height: "64px", borderColor: "#e2e8f0" }}
      >
        <div className="d-flex align-items-center gap-3">
          <span
            className="badge px-3 py-2 fw-bold text-uppercase"
            style={{ backgroundColor: "#dbeafe", color: "#1e40af", borderRadius: "8px" }}
          >
            Technical Interview
          </span>
          <span className="text-muted small d-none d-md-inline">Round 2</span>
        </div>

        <div className="d-flex align-items-center gap-3">
          <span className="text-muted small">Question {Math.min(questionCount + 1, MAX_QUESTIONS)} of {MAX_QUESTIONS}</span>
          <div
            className="px-3 py-1 rounded fw-bold border d-flex align-items-center gap-2"
            style={{
              borderColor: timeRemaining < 300 ? "#ef4444" : "#e2e8f0",
              color: timeRemaining < 300 ? "#ef4444" : "#1e293b",
              backgroundColor: timeRemaining < 300 ? "#fef2f2" : "#f8fafc",
            }}
          >
            <i className="fa-solid fa-clock"></i>
            <span>{formatTime(timeRemaining)}</span>
          </div>
          <div className="d-none d-lg-flex gap-2">
            <span className={`badge px-2 py-1 ${isSpeaking ? "bg-primary" : isRecording ? "bg-success" : "bg-secondary"}`}>
              {isSpeaking ? "● AI Speaking" : isRecording ? "● Recording" : "○ Idle"}
            </span>
            <span className={`badge px-2 py-1 ${isFullscreen ? "bg-success" : "bg-warning text-dark"}`}>
              {isFullscreen ? "✓ Fullscreen" : "⚠ Fullscreen Off"}
            </span>
          </div>
        </div>

        <button
          onClick={handleEndInterview}
          className="btn btn-outline-danger btn-sm fw-bold px-3 py-1"
          style={{ borderRadius: "8px" }}
        >
          End Interview
        </button>
      </header>

      {errorMsg && (
        <div className="bg-warning text-dark px-3 py-2 text-center small fw-bold">{errorMsg}</div>
      )}

      <div className="d-flex flex-grow-1 overflow-hidden">
        <div className="col-12 d-flex flex-column align-items-center justify-content-center p-4 position-relative">
          <div className="text-center mb-4">
            <div
              className="mx-auto mb-3 d-flex align-items-center justify-content-center"
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                backgroundColor: "#f1f5f9",
                border: "3px solid #e2e8f0",
              }}
            >
              <i className="fa-solid fa-robot fs-1 text-primary"></i>
            </div>
            <h5 className="fw-bold text-dark">AI Interviewer</h5>
            <p className="text-muted small mb-0">{getStateLabel()}</p>
          </div>

          {currentQuestion && (
            <div
              className="card border-0 shadow-sm p-4 p-md-5 mt-3"
              style={{ maxWidth: "700px", width: "100%", borderRadius: "20px", backgroundColor: "#ffffff" }}
            >
              <div className="d-flex align-items-center gap-2 mb-3">
                <span className="badge bg-primary px-3 py-2">{currentQuestion.topic}</span>
                <span className="badge bg-secondary px-3 py-2">{currentQuestion.difficulty}</span>
              </div>
              <h4 className="fw-bold text-dark mb-3" style={{ lineHeight: "1.5" }}>
                {currentQuestion.question}
              </h4>
              {evaluation && (
                <div className="p-3 bg-light rounded-3 border mt-3">
                  <small className="text-muted d-block mb-1">AI Feedback</small>
                  <p className="small text-dark mb-0">{evaluation.feedback}</p>
                </div>
              )}
            </div>
          )}

          {interimTranscript && (
            <div className="mt-3 text-muted small fst-italic" style={{ maxWidth: "700px" }}>
              {interimTranscript}
            </div>
          )}

          {transcript && !interimTranscript && (
            <div className="mt-3 text-dark small" style={{ maxWidth: "700px" }}>
              {transcript}
            </div>
          )}

          {state === INTERVIEW_STATES.REVIEWING && (
            <div
              className="card border-0 shadow-sm p-3 p-md-4 mt-3"
              style={{ maxWidth: "700px", width: "100%", borderRadius: "16px", backgroundColor: "#eff6ff", border: "1px solid #bfdbfe" }}
            >
              <div className="d-flex align-items-center gap-2 mb-2">
                <i className="fa-solid fa-pen-to-square" style={{ color: "#1e40af" }}></i>
                <p className="small text-uppercase fw-bold text-muted mb-0" style={{ letterSpacing: "0.5px" }}>
                  Review &amp; Edit Your Answer
                </p>
              </div>
              <p className="small text-muted mb-2">
                <i className="fa-solid fa-circle-info me-1"></i>
                Voice transcription can mishear technical terms. Edit anything that looks wrong before sending.
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
      </div>

      <footer
        className="px-4 py-3 border-top d-flex align-items-center justify-content-center gap-3"
        style={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", height: "80px" }}
      >
        {state === INTERVIEW_STATES.LISTENING && (
          <>
            <button
              onClick={handleStopListening}
              className="btn btn-danger fw-bold px-4 py-2 d-flex align-items-center gap-2"
              style={{ borderRadius: "10px" }}
            >
              <i className="fa-solid fa-stop"></i> Submit Answer
            </button>
            <span className="text-muted small">Listening... Click Submit when done.</span>
          </>
        )}
        {state === INTERVIEW_STATES.REVIEWING && (
          <>
            <button
              onClick={() => {
                setState(INTERVIEW_STATES.LISTENING);
                shouldListenRef.current = true;
                startListening();
              }}
              className="btn btn-outline-secondary fw-bold px-4 py-2 d-flex align-items-center gap-2"
              style={{ borderRadius: "10px" }}
            >
              <i className="fa-solid fa-microphone"></i> Add More
            </button>
            <button
              onClick={handleConfirmAndSend}
              className="btn btn-primary fw-bold px-4 py-2 d-flex align-items-center gap-2"
              style={{ borderRadius: "10px" }}
              disabled={!editableTranscript.trim()}
            >
              <i className="fa-solid fa-check"></i> Send to AI
            </button>
          </>
        )}
        {state === INTERVIEW_STATES.PROCESSING && (
          <div className="d-flex align-items-center gap-2 text-muted">
            <span className="spinner-border spinner-border-sm"></span>
            <span>Analyzing your response...</span>
          </div>
        )}
        {state === INTERVIEW_STATES.EVALUATING && (
          <div className="d-flex align-items-center gap-2 text-muted">
            <span className="spinner-border spinner-border-sm"></span>
            <span>Evaluating...</span>
          </div>
        )}
        {state === INTERVIEW_STATES.NEXT_QUESTION && (
          <div className="d-flex align-items-center gap-2 text-muted">
            <span className="spinner-border spinner-border-sm"></span>
            <span>Preparing next question...</span>
          </div>
        )}
      </footer>
    </div>
  );
}
