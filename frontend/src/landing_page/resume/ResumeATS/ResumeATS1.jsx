import React, { useRef, useState } from 'react';

export default function ResumeATS1() {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const openFileManager = () => {
    fileInputRef.current.click();
  };

  return (
    <>
      
      <div className="container-fluid px-0">
        <h1 className="fs-6 fw-bold text-uppercase mt-3 ps-5" style={{ color: "#794ea1"}}>
          Resume ATS Score Checker
        </h1>
        
        <div className="row align-items-center g-0">
          <div className="col-md-6 ps-5 pe-3">
            <h1 className="fw-semibold my-4" style={{ wordSpacing: ".25rem", fontSize: "2.8rem" }}>
              Is Your Resume Good <br />Enough ?<br /> Check Your ATS<br /> Score Now !
            </h1>
            
            <p className="text-secondary fs-5 mb-5">
              Upload your resume and the job description to see how ATS <br />
              systems evaluate your profile and how to improve <br />
              it to pass ATS screenings.
            </p>

            <div 
              onClick={openFileManager}
              className="p-4 text-center mb-5"
              style={{
                border: '2px dashed #00d084',
                borderRadius: '16px',
                backgroundColor: '#f7fdfa',
                cursor: 'pointer',
                maxWidth: '480px'
              }}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.docx"
                style={{ display: 'none' }}
              />

              <h5 className="fw-semibold text-dark mb-1">
                Drop your resume here or choose a file.
              </h5>

              <p className="text-muted small mb-3">
                PDF & DOCX only. Max 2MB file size.
              </p>

              <button 
                type="button" 
                className="btn text-white fw-bold px-4 py-2 my-2" 
                style={{ backgroundColor: '#00d084', borderRadius: '10px' }}
              >
                {fileName ? fileName : 'Upload Your Resume'}
              </button>

              <div className="text-muted small mt-2">
                🔒 Privacy guaranteed
              </div>
            </div>
          </div>

          <div className="col-md-6 text-center pe-4">
            <img 
              src="src/landing_page/images/ATSS.png" 
              alt="ATS CHECK" 
              className="img-fluid"
              style={{ maxHeight: "700px", objectFit: "contain", marginBottom: "2rem"}}
            />
          </div>
        </div>

        <hr style={{ width: "80%", margin: "2rem auto" }} />
      </div>
    </>
  );
};