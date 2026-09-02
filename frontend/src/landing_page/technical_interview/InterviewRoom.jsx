import React, { useState, useEffect, useRef, useCallback } from "react";
import { exitFullscreen } from "../OA/fullscreenUtils";

const INTERVIEW_STATES = {
  PREPARING: "PREPARING",
  ASKING: "ASKING",
  LISTENING: "LISTENING",
  PROCESSING: "PROCESSING",
  EVALUATING: "EVALUATING",
  NEXT_QUESTION: "NEXT_QUESTION",
  COMPLETED: "COMPLETED",
  ERROR: "ERROR",
};

export default function InterviewRoom({ session, sessionId, onComplete }) {
  const [state, setState] = useState(INTERVIEW_STATES.PREPARING);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [transcript, setTranscript] = useState("");
  const transcriptRef = useRef("");/*##############################*/
  const [interimTranscript, setInterimTranscript] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(20 * 60);
  const [isRecording, setIsRecording] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [questionCount, setQuestionCount] = useState(0);
  const [evaluation, setEvaluation] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

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

  const API_BASE = "http://localhost:5001";
  const MAX_QUESTIONS = 7;

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
    recognition.lang = "en-US";

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
      // setTranscript((prev) => prev + final);
      setTranscript((prev) => {
        const updated = prev + final;
        transcriptRef.current = updated;
        return updated;
      });
      setInterimTranscript(interim);
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
      if (shouldListenRef.current) {
        setTimeout(() => {
          if (mountedRef.current && shouldListenRef.current && !isSpeakingRef.current) {
            try {
              recognition.start();
            } catch (err) {
              console.error("Recognition restart error:", err);
            }
          }
        }, 300);
      }
    };

    recognitionRef.current = recognition;
    try {
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
        setTranscript("");
        setInterimTranscript("");
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

  // const handleStopListening = useCallback(async () => {
  //   shouldListenRef.current = false;
  //   stopListening();
  //   const fullTranscript = (transcript + " " + interimTranscript).trim();
  //   if (!fullTranscript) return;
  //   setState(INTERVIEW_STATES.EVALUATING);
  //   const data = await sendAnswerToBackend(currentQuestion.id, fullTranscript, 0);
  //   const answeredCount = data?.questionCount || questionCount;
  //   if (answeredCount >= MAX_QUESTIONS) {
  //     setState(INTERVIEW_STATES.COMPLETED);
  //   } else {
  //     setState(INTERVIEW_STATES.NEXT_QUESTION);
  //     setTimeout(() => fetchNextQuestionRef.current?.(), 1000);
  //   }
  // }, [transcript, interimTranscript, currentQuestion, questionCount, sendAnswerToBackend, stopListening]);
  /*##################added by nikita ########################*/
  const handleStopListening = useCallback(async () => {
  shouldListenRef.current = false;
  stopListening();

  // const fullTranscript = (transcript + " " + interimTranscript).trim();
  const fullTranscript = (transcriptRef.current + " " + interimTranscript).trim();

  // if (!fullTranscript || !currentQuestion) return;
  if (!currentQuestion) return;
  setState(INTERVIEW_STATES.EVALUATING);

  try {
    const res = await fetch(
      `${API_BASE}/api/technical-interview/${sessionId}/next-question`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          previous_answer: fullTranscript,
          previous_question_id: currentQuestion.id,
        }),
      }
    );

    const data = await res.json();

    if (data.status !== "success") {
      throw new Error(data.message || "Failed to get next question");
    }

    setEvaluation(data.evaluation || null);

    if (data.completed || !data.nextQuestion) {
      setState(INTERVIEW_STATES.COMPLETED);
      onComplete();
      return;
    }

    setQuestionCount(data.questionCount || questionCount + 1);
    setCurrentQuestion(data.nextQuestion);
    setTranscript("");
    setInterimTranscript("");
    transcriptRef.current = "";

    setState(INTERVIEW_STATES.ASKING);

    if (data.nextQuestion.ttsText) {
      await speak(data.nextQuestion.ttsText);
    }

    if (mountedRef.current) {
      setState(INTERVIEW_STATES.LISTENING);
      shouldListenRef.current = true;
      startListening();
    }
  } catch (err) {
    console.error("Answer/next question error:", err);

    if (mountedRef.current) {
      setErrorMsg("Could not process your answer. Please try again.");
      setState(INTERVIEW_STATES.ERROR);
    }
  }
}, [
  transcript,
  interimTranscript,
  currentQuestion,
  sessionId,
  questionCount,
  stopListening,
  speak,
  startListening,
  onComplete,
]);

  const handleEndInterview = async () => {
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

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      cleanupMedia();
      stopListening();
      window.speechSynthesis?.cancel();
      if (timerRef.current) clearInterval(timerRef.current);
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
