import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { isFullscreenActive } from "./fullscreenUtils";

export default function OACodingEnvironment({ session, onFinishOA }) {
  const questions = session?.questions || [];
  const [activeQIndex, setActiveQIndex] = useState(0);
  const currentQ = questions[activeQIndex] || questions[0];

  const [selectedLang, setSelectedLang] = useState("python");
  
  // Local code state per question ID and language
  const [codeMap, setCodeMap] = useState(() => {
    return session?.codeByQuestion || {};
  });

  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState(null);

  // Proctoring states
  const [isFullscreen, setIsFullscreen] = useState(isFullscreenActive());
  const [isScreenSharing, setIsScreenSharing] = useState(true);
  const [warningAlert, setWarningAlert] = useState("");

  // Server-controlled Timer calculation
  const [timeRemaining, setTimeRemaining] = useState(() => {
    if (session?.endsAt) {
      const now = Date.now() / 1000;
      return Math.max(0, Math.floor(session.endsAt - now));
    }
    return 5400; // 90 mins default
  });

  // Track code changes
  const activeCode = codeMap[currentQ?.id]?.[selectedLang] ?? currentQ?.starterCode?.[selectedLang] ?? "";

  const handleCodeChange = (newCode) => {
    if (!currentQ) return;
    const qId = currentQ.id;
    const updated = {
      ...codeMap,
      [qId]: {
        ...(codeMap[qId] || {}),
        [selectedLang]: newCode,
      },
    };
    setCodeMap(updated);

    // Debounced autosave to backend
    fetch(`http://localhost:5001/api/oa/${session.id}/autosave`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: qId, language: selectedLang, code: newCode }),
    }).catch(() => {});
  };

  // Timer Countdown Effect
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          handleAutoFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, []);

  const handleAutoFinish = async () => {
    try {
      await fetch(`http://localhost:5001/api/oa/${session.id}/finish`, { method: "POST" });
      onFinishOA();
    } catch (e) {
      console.error(e);
      onFinishOA();
    }
  };

  // Proctoring Integrity Listeners
  useEffect(() => {
    const logIntegrity = (type, details) => {
      const timestamp = new Date().toLocaleTimeString();
      fetch(`http://localhost:5001/api/oa/${session.id}/integrity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, timestamp, details }),
      }).catch(() => {});
    };

    const handleFullscreenChange = () => {
      const active = isFullscreenActive();
      setIsFullscreen(active);
      if (!active) {
        setWarningAlert("⚠ Fullscreen mode exited! Returning to fullscreen mode is recommended.");
        logIntegrity("FULLSCREEN_EXIT", "Candidate exited fullscreen mode.");
      } else {
        setWarningAlert("");
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWarningAlert("⚠ Tab switch detected! Remaining on the assessment tab is monitored.");
        logIntegrity("TAB_SWITCH", "Candidate switched active tab or minimized browser window.");
      }
    };

    const handlePaste = () => {
      logIntegrity("PASTE", "Clipboard paste event detected in editor.");
    };

    const fsEvents = ["fullscreenchange", "webkitfullscreenchange", "mozfullscreenchange", "MSFullscreenChange"];
    fsEvents.forEach((evt) => document.addEventListener(evt, handleFullscreenChange));
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("paste", handlePaste);

    return () => {
      fsEvents.forEach((evt) => document.removeEventListener(evt, handleFullscreenChange));
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("paste", handlePaste);
    };
  }, [session.id]);

  // Run Code (Public Tests)
  const handleRunCode = async () => {
    setRunning(true);
    setConsoleOutput({ type: "loading", message: "Compiling and running public test cases..." });

    try {
      const res = await fetch(`http://localhost:5001/api/oa/${session.id}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQ.id,
          language: selectedLang,
          code: activeCode,
        }),
      });

      const data = await res.json();
      if (data.status === "success") {
        setConsoleOutput({ type: "run", result: data.runResult });
      } else {
        setConsoleOutput({ type: "error", message: data.message });
      }
    } catch (err) {
      setConsoleOutput({ type: "error", message: "Failed to connect to backend execution service." });
    } finally {
      setRunning(false);
    }
  };

  // Submit Code (Public + Hidden Tests)
  const handleSubmitCode = async () => {
    setSubmitting(true);
    setConsoleOutput({ type: "loading", message: "Evaluating solution against Public and Hidden test cases..." });

    try {
      const res = await fetch(`http://localhost:5001/api/oa/${session.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQ.id,
          language: selectedLang,
          code: activeCode,
        }),
      });

      const data = await res.json();
      if (data.status === "success") {
        setConsoleOutput({ type: "submit", result: data.submissionResult });
      } else {
        setConsoleOutput({ type: "error", message: data.message });
      }
    } catch (err) {
      setConsoleOutput({ type: "error", message: "Failed to submit solution to judge." });
    } finally {
      setSubmitting(false);
    }
  };

  // Format Timer MM:SS
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className="d-flex flex-column vh-100 bg-dark text-light overflow-hidden"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* ========================================================= */}
      {/* TOP NAVIGATION & PROCTORING BAR */}
      {/* ========================================================= */}
      <header
        className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom border-secondary"
        style={{ backgroundColor: "#1e1e2e", height: "60px" }}
      >
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center gap-2">
            <span
              className="fw-bold px-2 py-1 text-white rounded"
              style={{ backgroundColor: "#00d084", fontSize: "0.85rem" }}
            >
              VIREZA OA
            </span>
            <span className="text-secondary small d-none d-md-inline">| Round 1 DSA Assessment</span>
          </div>

          {/* Question Selector Tabs */}
          <div className="d-flex gap-2 ms-3">
            {questions.map((q, idx) => {
              const isActive = idx === activeQIndex;
              const hasSubmitted = !!session?.submissions?.[q.id];

              return (
                <button
                  key={q.id}
                  onClick={() => setActiveQIndex(idx)}
                  className={`btn btn-sm fw-bold px-3 py-1 border-0 d-flex align-items-center gap-2 ${
                    isActive ? "bg-primary text-white" : "bg-dark text-secondary"
                  }`}
                  style={{ borderRadius: "8px", fontSize: "0.85rem" }}
                >
                  <span>Q{idx + 1}</span>
                  {hasSubmitted ? (
                    <span className="badge bg-success p-1 rounded-circle" style={{ width: "8px", height: "8px" }}></span>
                  ) : (
                    <span
                      className="badge bg-secondary p-1 rounded-circle"
                      style={{ width: "8px", height: "8px" }}
                    ></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Global Timer & Proctoring Status */}
        <div className="d-flex align-items-center gap-3">
          <div
            className={`px-3 py-1 rounded fw-bold border d-flex align-items-center gap-2 ${
              timeRemaining < 600 ? "bg-danger text-white border-danger" : "bg-dark text-warning border-warning"
            }`}
            style={{ fontSize: "1.1rem" }}
          >
            <i className="fa-solid fa-clock"></i>
            <span>{formatTimer(timeRemaining)}</span>
          </div>

          {/* Fullscreen & Screen Share Badges */}
          <div className="d-none d-lg-flex gap-2">
            <span className={`badge px-2 py-1 ${isFullscreen ? "bg-success" : "bg-danger"}`}>
              {isFullscreen ? "✓ Fullscreen" : "⚠ Fullscreen Exited"}
            </span>
            <span className={`badge px-2 py-1 ${isScreenSharing ? "bg-success" : "bg-danger"}`}>
              {isScreenSharing ? "✓ Screen Share Active" : "⚠ Screen Share Inactive"}
            </span>
          </div>

          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to finish and submit the assessment now?")) {
                handleAutoFinish();
              }
            }}
            className="btn btn-outline-danger btn-sm fw-bold px-3 py-1"
            style={{ borderRadius: "8px" }}
          >
            Finish OA
          </button>
        </div>
      </header>

      {/* Warning Alert Banner */}
      {warningAlert && (
        <div className="bg-warning text-dark px-3 py-1 text-center small fw-bold">
          {warningAlert}
        </div>
      )}

      {/* ========================================================= */}
      {/* MAIN WORKSPACE (LEFT PROBLEM + RIGHT EDITOR) */}
      {/* ========================================================= */}
      <div className="d-flex flex-grow-1 overflow-hidden">
        {/* LEFT PANEL: PROBLEM STATEMENT */}
        <div
          className="col-12 col-md-5 d-flex flex-column border-end border-secondary p-3 overflow-auto"
          style={{ backgroundColor: "#181825" }}
        >
          {currentQ && (
            <div>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h4 className="fw-bold text-white mb-0">
                  {activeQIndex + 1}. {currentQ.title}
                </h4>
                <span
                  className={`badge px-3 py-1 ${
                    currentQ.difficulty === "Easy"
                      ? "bg-success"
                      : currentQ.difficulty === "Medium"
                      ? "bg-warning text-dark"
                      : "bg-danger"
                  }`}
                  style={{ borderRadius: "6px" }}
                >
                  {currentQ.difficulty}
                </span>
              </div>

              <span
                className="badge bg-secondary px-2 py-1 mb-3"
                style={{ fontSize: "0.75rem", backgroundColor: "#313244" }}
              >
                Topic: {currentQ.topic}
              </span>

              {/* Problem Description */}
              <div className="text-light mb-4" style={{ fontSize: "0.92rem", lineHeight: "1.6", whiteSpace: "pre-line" }}>
                {currentQ.description}
              </div>

              {/* Examples */}
              {currentQ.examples && currentQ.examples.length > 0 && (
                <div className="mb-4">
                  <h6 className="fw-bold text-secondary text-uppercase mb-2" style={{ fontSize: "0.8rem" }}>
                    Examples
                  </h6>
                  {currentQ.examples.map((ex, i) => (
                    <div
                      key={i}
                      className="p-3 mb-2 rounded border border-secondary"
                      style={{ backgroundColor: "#1e1e2e", fontSize: "0.85rem" }}
                    >
                      <div className="mb-1">
                        <span className="text-secondary fw-bold">Input: </span>
                        <code className="text-info">{ex.input}</code>
                      </div>
                      <div>
                        <span className="text-secondary fw-bold">Output: </span>
                        <code className="text-success">{ex.output}</code>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Constraints */}
              {currentQ.constraints && (
                <div>
                  <h6 className="fw-bold text-secondary text-uppercase mb-2" style={{ fontSize: "0.8rem" }}>
                    Constraints
                  </h6>
                  <ul className="ps-3 text-secondary small">
                    {currentQ.constraints.map((c, idx) => (
                      <li key={idx} className="mb-1">
                        <code>{c}</code>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT PANEL: CODE EDITOR & CONSOLE */}
        <div className="col-12 col-md-7 d-flex flex-column bg-dark">
          {/* Editor Header: Language Switcher */}
          <div
            className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom border-secondary"
            style={{ backgroundColor: "#1e1e2e" }}
          >
            <div className="d-flex align-items-center gap-2">
              <span className="text-secondary small fw-bold">Language:</span>
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                className="form-select form-select-sm bg-dark text-light border-secondary"
                style={{ width: "130px", borderRadius: "6px" }}
              >
                <option value="python">Python 3</option>
                <option value="java">Java 17</option>
                <option value="cpp">C++ 20</option>
              </select>
            </div>

            <div className="d-flex gap-2">
              <button
                onClick={handleRunCode}
                disabled={running || submitting}
                className="btn btn-outline-light btn-sm fw-bold px-3 py-1"
                style={{ borderRadius: "8px" }}
              >
                {running ? (
                  <span>
                    <span className="spinner-border spinner-border-sm me-1"></span> Running...
                  </span>
                ) : (
                  <span>
                    <i className="fa-solid fa-play me-1 text-success"></i> RUN CODE
                  </span>
                )}
              </button>

              <button
                onClick={handleSubmitCode}
                disabled={running || submitting}
                className="btn btn-success btn-sm fw-bold px-4 py-1"
                style={{ borderRadius: "8px", backgroundColor: "#00d084", borderColor: "#00d084" }}
              >
                {submitting ? (
                  <span>
                    <span className="spinner-border spinner-border-sm me-1"></span> Submitting...
                  </span>
                ) : (
                  <span>
                    <i className="fa-solid fa-check me-1"></i> SUBMIT
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Monaco Editor Component */}
          <div className="flex-grow-1" style={{ minHeight: "350px" }}>
            <Editor
              height="100%"
              language={selectedLang === "cpp" ? "cpp" : selectedLang === "java" ? "java" : "python"}
              theme="vs-dark"
              value={activeCode}
              onChange={handleCodeChange}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
              }}
            />
          </div>

          {/* BOTTOM PANEL: TEST CONSOLE & OUTPUT */}
          <div
            className="border-top border-secondary p-3 overflow-auto"
            style={{ backgroundColor: "#181825", height: "200px" }}
          >
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="fw-bold text-secondary text-uppercase" style={{ fontSize: "0.75rem" }}>
                Test Output / Console Result
              </span>
              {consoleOutput && consoleOutput.result && (
                <span className="d-flex gap-2">
                  {consoleOutput.result.compileMs > 0 && (
                    <span className="badge bg-secondary">
                      Compile: {consoleOutput.result.compileMs} ms
                    </span>
                  )}
                  <span className="badge bg-secondary">
                    Runtime: {consoleOutput.result.runtimeMs || 0} ms
                  </span>
                </span>
              )}
            </div>

            {!consoleOutput && (
              <div className="text-secondary small italic pt-3 text-center">
                Click <strong>RUN CODE</strong> to test public sample cases or <strong>SUBMIT</strong> for hidden test evaluation.
              </div>
            )}

            {consoleOutput && consoleOutput.type === "loading" && (
              <div className="text-info small py-2 d-flex align-items-center gap-2">
                <span className="spinner-border spinner-border-sm"></span>
                <span>{consoleOutput.message}</span>
              </div>
            )}

            {consoleOutput && consoleOutput.type === "error" && (
              <div className="text-danger small font-monospace bg-dark p-2 rounded border border-danger">
                {consoleOutput.message}
              </div>
            )}

            {consoleOutput && (consoleOutput.type === "run" || consoleOutput.type === "submit") && (
              <div>
                <div className="d-flex align-items-center gap-2 mb-2">
                  {consoleOutput.result.success ? (
                    <span className="badge bg-success px-3 py-1">
                      ✓ {consoleOutput.result.totalPassed} / {consoleOutput.result.totalCases} Test Cases Passed
                    </span>
                  ) : (
                    <span className="badge bg-danger px-3 py-1">
                      ✗ Error / Mismatch ({consoleOutput.result.totalPassed} / {consoleOutput.result.totalCases} Passed)
                    </span>
                  )}
                  {consoleOutput.type === "submit" && (
                    <span className="badge bg-info text-dark px-2 py-1">
                      Public ({consoleOutput.result.publicCount}) + Hidden ({consoleOutput.result.hiddenCount}) Evaluated
                    </span>
                  )}
                </div>

                {/* Individual Test Cases List */}
                <div className="d-flex flex-column gap-2 mt-2">
                  {consoleOutput.result.testResults?.map((tr, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded bg-dark border border-secondary font-monospace"
                      style={{ fontSize: "0.8rem" }}
                    >
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <span className={tr.passed ? "text-success fw-bold" : "text-danger fw-bold"}>
                          {tr.passed ? "✓ Test Case " + tr.caseIndex + " Passed" : "✗ Test Case " + tr.caseIndex + " Failed"}
                        </span>
                      </div>
                      {tr.actual !== undefined && (
                        <div className="text-secondary">
                          Actual Output: <span className="text-light">{tr.actual}</span> | Expected:{" "}
                          <span className="text-success">{tr.expected}</span>
                        </div>
                      )}
                      {tr.error && <div className="text-danger mt-1">{tr.error}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
