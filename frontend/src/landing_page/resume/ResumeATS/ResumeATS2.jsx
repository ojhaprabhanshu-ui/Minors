import React from "react";

function ResumeATS2() {
  const steps = [
    {
      id: "1",
      title: "1. Upload Your Resume",
      description:
        "Upload your resume in PDF or DOC format. Our system securely reads your content and structure.",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#0f766e"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      ),
    },
    {
      id: "2",
      title: "2. Paste the Job Description",
      description:
        "Add the job description you’re applying for. This helps us understand what recruiters and ATS systems are looking for.",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#0f766e"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 4V2" />
          <path d="M15 16v-2" />
          <path d="M8 9h2" />
          <path d="M20 9h2" />
          <path d="M17.8 5.2l-1.4 1.4" />
          <path d="M7.6 15.4l-1.4 1.4" />
          <path d="M2 22l10-10" />
          <path d="M12 2l10 10" />
        </svg>
      ),
    },
    {
      id: "3",
      title: "3. Get Your ATS Score",
      description:
        "Receive an instant ATS match score showing how well your resume aligns with the job role.",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#0f766e"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
    },
  ];

  return (
    <div className="container text-center py-5">
      <div className="row justify-content-center mb-5">
        <h5
          className="text-uppercase fw-bold mb-2"
          style={{ color: "#6ddc95" }}
        >
          HOW IT WORKS
        </h5>
        <h2 className="fw-bold text-dark">Get Your Resume In Seconds</h2>
      </div>

      <div className="row g-4">
        {steps.map((step) => (
          <div className="col-md-4" key={step.id}>
            <div className="step-card h-100 p-4 d-flex flex-column align-items-center text-center">
              {/* Circular Icon Container */}
              <div
                className="d-flex align-items-center justify-content-center mb-4"
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  backgroundColor: "#d1fae5",
                }}
              >
                {step.icon}
              </div>

              {/* Title */}
              <h5 className="fw-bold mb-3" style={{ color: "#0f172a" }}>
                {step.title}
              </h5>

              {/* Description */}
              <p
                className="mb-0"
                style={{
                  color: "#64748b",
                  fontSize: "0.95rem",
                  lineHeight: "1.6",
                }}
              >
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ResumeATS2;
