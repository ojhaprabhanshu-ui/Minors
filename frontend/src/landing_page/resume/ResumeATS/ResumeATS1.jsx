import React, { useRef, useState } from "react";
import ResumeATSResults from "./ResumeATSResults";
import ats2Img from "../../../resources/images/ats2.png";

export default function ResumeATS1() {
  const fileInputRef = useRef(null);
  const resultsRef = useRef(null);

  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    const validExtensions = [".pdf", ".docx"];
    const name = selectedFile.name.toLowerCase();
    const isValid = validExtensions.some((ext) => name.endsWith(ext));

    if (!isValid) {
      setError("Please select a valid PDF (.pdf) or Word document (.docx).");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit. Please upload a smaller file.");
      return;
    }

    setError("");
    setFile(selectedFile);
    setFileName(selectedFile.name);
    setFileSize((selectedFile.size / 1024).toFixed(1) + " KB");
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    handleFile(selectedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const openFileManager = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setFile(null);
    setFileName("");
    setFileSize("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("Please upload your resume file (PDF or DOCX).");
      return;
    }

    if (!jobDescription.trim()) {
      setError("Please paste the job description you are applying for.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("job_description", jobDescription.trim());

      const response = await fetch("http://localhost:5001/ats", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.status === "success") {
        setResult(data);
        setError("");
        
        // Persist ATS score & eligibility
        localStorage.setItem("ats_score", data.ats_score);
        localStorage.setItem("ats_eligible", data.ats_score >= 80 ? "true" : "false");
        localStorage.setItem("ats_result", JSON.stringify(data));
        
        setTimeout(() => {
          const resultsElem = document.getElementById("ats-results-section");
          if (resultsElem) {
            resultsElem.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      } else {
        setError(data.message || "Failed to evaluate resume. Please try again.");
      }
    } catch (err) {
      console.error("ATS Connection Error:", err);
      setError(
        "Could not connect to the ATS backend (http://localhost:5001). Please make sure the Flask backend server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError("");
    localStorage.removeItem("ats_result");
    localStorage.removeItem("ats_score");
    localStorage.removeItem("ats_eligible");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <div className="container-fluid px-0">
        <h1
          className="fs-6 fw-bold text-uppercase mt-3 ps-5"
          style={{ color: "#794ea1" }}
        >
          Resume ATS Score Checker
        </h1>

        <div className="row align-items-start g-0">
          <div className="col-md-6 ps-5 pe-4">
            <h1
              className="fw-semibold my-4"
              style={{ wordSpacing: ".25rem", fontSize: "2.8rem" }}
            >
              Is Your Resume Good <br />
              Enough ?<br /> Check Your ATS<br /> Score Now !
            </h1>

            <p className="text-secondary fs-5 mb-4">
              Upload your resume and the job description to see how ATS <br />
              systems evaluate your profile and how to improve <br />
              it to pass ATS screenings.
            </p>

            
            {error && (
              <div
                className="alert alert-danger alert-dismissible fade show p-3 mb-4 rounded-3"
                role="alert"
                style={{ maxWidth: "520px" }}
              >
                <div className="d-flex align-items-center">
                  <i className="fa-solid fa-triangle-exclamation me-2 fs-5"></i>
                  <span className="small">{error}</span>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setError("")}
                  aria-label="Close"
                ></button>
              </div>
            )}

            
            <div
              onClick={openFileManager}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className="p-4 text-center mb-3"
              style={{
                border: isDragging ? "2px dashed #794ea1" : "2px dashed #00d084",
                borderRadius: "16px",
                backgroundColor: isDragging ? "#f3e8ff" : "#f7fdfa",
                cursor: "pointer",
                maxWidth: "520px",
                transition: "all 0.2s ease",
              }}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.docx"
                style={{ display: "none" }}
              />

              {!file ? (
                <>
                  <div
                    className="mx-auto mb-2 d-flex align-items-center justify-content-center"
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      backgroundColor: "#d1fae5",
                      color: "#0f766e",
                    }}
                  >
                    <i className="fa-solid fa-cloud-arrow-up fs-4"></i>
                  </div>
                  <h5 className="fw-semibold text-dark mb-1">
                    Drop your resume here or choose a file
                  </h5>
                  <p className="text-muted small mb-3">
                    PDF & DOCX only. Max 5MB file size.
                  </p>
                  <button
                    type="button"
                    className="btn text-white fw-bold px-4 py-2 my-1 shadow-sm"
                    style={{ backgroundColor: "#00d084", borderRadius: "10px" }}
                  >
                    Choose Resume File
                  </button>
                </>
              ) : (
                <div className="d-flex align-items-center justify-content-between bg-white p-3 rounded-3 border">
                  <div className="d-flex align-items-center text-start">
                    <div
                      className="p-2 me-3 rounded-2 text-white"
                      style={{
                        backgroundColor: fileName.endsWith(".pdf")
                          ? "#ef4444"
                          : "#2563eb",
                      }}
                    >
                      <i
                        className={`fa-solid ${
                          fileName.endsWith(".pdf")
                            ? "fa-file-pdf"
                            : "fa-file-word"
                        } fs-4`}
                      ></i>
                    </div>
                    <div>
                      <h6 className="fw-bold text-dark mb-0 text-truncate" style={{ maxWidth: "260px" }}>
                        {fileName}
                      </h6>
                      <small className="text-muted">{fileSize}</small>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="btn btn-sm btn-outline-danger rounded-circle p-2"
                    title="Remove file"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              )}

              <div className="text-muted small mt-2">🔒 Privacy guaranteed</div>
            </div>

            {/* Job Description Input */}
            <div className="mb-4" style={{ maxWidth: "520px" }}>
              <label className="form-label fw-bold text-dark medium mb-3 d-flex justify-content-between align-items-center">
                <span>
                  <i className="fa-solid fa-file-lines me-1 text-secondary"></i> Target Job Description
                </span>
                <span className="badge bg-light text-secondary border">Required</span>
              </label>
              <textarea
                className="form-control"
                rows="4"
                placeholder="Paste the job description or role requirements here (e.g. required skills, qualifications, responsibilities)..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                style={{
                  borderRadius: "12px",
                  borderColor: "#cbd5e1",
                  fontSize: "0.92rem",
                  padding: "0.75rem 1rem",
                  resize: "vertical",
                }}
              />
              <div className="d-flex justify-content-between align-items-center mt-1">
                <span className="text-muted small" style={{ fontSize: "11px" }}>
                  Add full job description for accurate keyword & semantic match.
                </span>
                <span className="text-muted small" style={{ fontSize: "11px" }}>
                  {jobDescription.length} chars
                </span>
              </div>
            </div>

            
            <div className="mb-5" style={{ maxWidth: "520px" }}>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="btn w-100 text-white fw-bold py-3 shadow"
                style={{
                  backgroundColor: loading ? "#64748b" : "#00d084",
                  borderRadius: "12px",
                  fontSize: "1.1rem",
                  transition: "all 0.25s ease",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? (
                  <span className="d-flex align-items-center justify-content-center">
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Evaluating Resume & Matching ATS Keywords...
                  </span>
                ) : (
                  <span>
                    Check ATS Score Now <i className="fa-solid fa-bolt ms-2"></i>
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="col-md-6 text-center pe-4 pt-4 d-flex flex-column align-items-center">
            <img
              src="/src/landing_page/images/ATSS.png"
              alt="ATS CHECK"
              className="img-fluid"
              style={{
                maxHeight: "500px",
                objectFit: "contain",
                
              }}
              onError={(e) => {
                e.target.src = "src/landing_page/images/ATSS.png";
              }}
            />
            <img
              src={ats2Img}
              alt="ATS Score Metrics"
              className="img-fluid rounded-3"
              style={{
                width: "100%",
                height:"400px",
                objectFit: "contain",
                marginBottom: "2rem",
              }}
            />
          </div>

          
        </div>

        
        {result && (
          <div ref={resultsRef}>
            <ResumeATSResults result={result} onReset={handleReset} />
          </div>
        )}

        <hr style={{ width: "80%", margin: "2rem auto" }} />
      </div>
    </>
  );
}