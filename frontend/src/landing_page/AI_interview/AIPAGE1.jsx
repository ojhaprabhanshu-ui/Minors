import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function AIPage() {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState('oa');
  const [file, setFile] = useState(null);
  const [uploadError, setUploadError] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const uploaded = e.target.files[0];
      setFile(uploaded);
      setUploadError(false);
      await analyzeResume(uploaded);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      setFile(dropped);
      setUploadError(false);
      await analyzeResume(dropped);
    }
  };

  const analyzeResume = async (resumeFile) => {
    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);
      formData.append("job_description", "Software engineering candidate");
      const res = await fetch("http://localhost:5001/ats", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        localStorage.setItem("ats_score", data.ats_score);
        localStorage.setItem("ats_eligible", data.ats_score >= 80 ? "true" : "false");
        localStorage.setItem("ats_result", JSON.stringify(data));
        const skillsArr = data.resume_analysis?.skills || [];
        sessionStorage.setItem("ats_skills", JSON.stringify(skillsArr));
        sessionStorage.setItem("ats_sections", JSON.stringify(data.resume_analysis?.sections || {}));
        sessionStorage.setItem("ats_experience_years", String(data.resume_analysis?.experience_years || 0));
        sessionStorage.setItem("ats_resume_analyzed_at", new Date().toISOString());
      }
    } catch (err) {
      console.error("Resume analysis error (non-blocking):", err);
    }
  };

  const handleStartRound = (modeName) => {
    if (!file) {
      setUploadError(true);
      fileInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setUploadError(false);

    if (modeName === 'OA Round' || selectedMode === 'oa') {
      sessionStorage.setItem("ats_resume_file_name", file.name);
      navigate("/oa");
    } else if (modeName === 'Technical Interview' || selectedMode === 'technical') {
      sessionStorage.setItem("ats_resume_file_name", file.name);
      navigate("/technical-interview");
    } else if (modeName === 'HR Interview' || selectedMode === 'hr') {
      sessionStorage.setItem("ats_resume_file_name", file.name);
      navigate("/hr-interview");
    } else if (modeName === 'Full Interview' || selectedMode === 'full') {
      sessionStorage.setItem("ats_resume_file_name", file.name);
      navigate("/full-interview");
    } else {
      alert(`${modeName} is coming soon! Please complete Round 1: OA Round first.`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Welcome to <span className="text-indigo-600">VIREZA</span>
          </h1>
          <p className="text-lg text-slate-600 font-medium">Your AI-Powered Interview Partner</p>
          <p className="text-sm text-slate-500">
            Practice interviews, get AI feedback, and improve your confidence.
          </p>
        </div>

        {/* Upload Resume Dropzone Component (Placed prominently near top) */}
        <div 
          ref={fileInputRef}
          className={`bg-white border-2 border-dashed rounded-3xl p-8 max-w-3xl mx-auto text-center shadow-sm transition-all ${
            uploadError 
              ? 'border-red-500 bg-red-50/30 ring-4 ring-red-100' 
              : file 
              ? 'border-emerald-500 bg-emerald-50/20' 
              : 'border-emerald-400 bg-emerald-50/40'
          }`}
        >
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="flex flex-col items-center justify-center space-y-4"
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${
              file ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'
            }`}>
              {file ? '✅' : '☁️'}
            </div>

            <div>
              <h4 className="text-2xl font-bold text-slate-800">
                {file ? 'Resume Uploaded Successfully!' : 'Drop your resume here or choose a file'}
              </h4>
              <p className="text-sm text-slate-500 mt-1">
                PDF & DOCX only. Max 5MB file size. Required before starting any round.
              </p>
            </div>

            <label className="cursor-pointer bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-6 py-3 rounded-xl shadow-md transition-colors inline-block">
              {file ? 'Change Resume File' : 'Choose Resume File'}
              <input 
                type="file" 
                accept=".pdf,.docx" 
                onChange={handleFileChange} 
                className="hidden" 
              />
            </label>

            {file ? (
              <p className="text-sm font-semibold text-emerald-700 bg-emerald-100 px-4 py-1.5 rounded-lg">
                📁 {file.name}
              </p>
            ) : uploadError && (
              <p className="text-sm font-semibold text-red-600 bg-red-100 px-4 py-1.5 rounded-lg animate-bounce">
                ⚠️ Please upload your resume before starting an interview!
              </p>
            )}

            <p className="text-lg text-slate-500 flex items-center gap-1">
              🔒 Privacy guaranteed
            </p>
          </div>
        </div>

        {/* Section Divider */}
        <div className="flex items-center justify-center my-6">
          <div className="h-px bg-slate-300 w-1/4"></div>
          <span className="px-4 text-slate-500 font-medium text-sm flex items-center gap-1">
            ✦ Choose Interview Mode ✦
          </span>
          <div className="h-px bg-slate-300 w-1/4"></div>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: OA Round */}
          <div 
            onClick={() => setSelectedMode('oa')}
            className={`cursor-pointer rounded-2xl p-6 bg-white border transition-all duration-200 flex flex-col justify-between shadow-sm hover:shadow-md ${
              selectedMode === 'oa' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200'
            }`}
          >
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-xl font-bold">
                  📝
                </div>
                <input 
                  type="radio" 
                  name="mode" 
                  checked={selectedMode === 'oa'} 
                  onChange={() => setSelectedMode('oa')} 
                  className="w-5 h-5 accent-amber-500"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">OA Round</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Timed online assessment with coding, aptitude, and core CS fundamentals.
                </p>
              </div>
              <ul className="text-xs text-slate-600 space-y-2 pt-2 bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                <li className="flex items-center gap-2">✓ Timed Coding Questions</li>
                <li className="flex items-center gap-2">✓ Aptitude & CS Core</li>
                <li className="flex items-center gap-2">✓ Automated Code Evaluation</li>
                <li className="flex items-center gap-2">✓ Performance Scorecard</li>
              </ul>
            </div>
            <button 
              onClick={() => handleStartRound('OA Round')}
              className={`w-full mt-6 py-2.5 px-4 font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 ${
                file 
                  ? 'bg-amber-500 hover:bg-amber-600 text-white cursor-pointer shadow-md' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              Start OA Round →
            </button>
          </div>

          {/* Card 2: Technical Interview */}
          <div 
            onClick={() => setSelectedMode('technical')}
            className={`cursor-pointer rounded-2xl p-6 bg-white border transition-all duration-200 flex flex-col justify-between shadow-sm hover:shadow-md ${
              selectedMode === 'technical' ? 'border-blue-600 ring-2 ring-blue-600/20' : 'border-slate-200'
            }`}
          >
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold">
                  &lt;/&gt;
                </div>
                <input 
                  type="radio" 
                  name="mode" 
                  checked={selectedMode === 'technical'} 
                  onChange={() => setSelectedMode('technical')} 
                  className="w-5 h-5 accent-blue-600"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Technical Interview</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Practice resume-based technical questions with adaptive difficulty.
                </p>
              </div>
              <ul className="text-xs text-slate-600 space-y-2 pt-2 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                <li className="flex items-center gap-2">✓ 5–10 Technical Questions</li>
                <li className="flex items-center gap-2">✓ Adaptive Difficulty</li>
                <li className="flex items-center gap-2">✓ Detailed Feedback</li>
                <li className="flex items-center gap-2">✓ Technical Score Report</li>
              </ul>
            </div>
            <button 
              onClick={() => handleStartRound('Technical Interview')}
              className={`w-full mt-6 py-2.5 px-4 font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 ${
                file 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-md' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              Start Technical Interview →
            </button>
          </div>

          {/* Card 3: HR Interview */}
          <div 
            onClick={() => setSelectedMode('hr')}
            className={`cursor-pointer rounded-2xl p-6 bg-white border transition-all duration-200 flex flex-col justify-between shadow-sm hover:shadow-md ${
              selectedMode === 'hr' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200'
            }`}
          >
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl font-bold">
                  👤
                </div>
                <input 
                  type="radio" 
                  name="mode" 
                  checked={selectedMode === 'hr'} 
                  onChange={() => setSelectedMode('hr')} 
                  className="w-5 h-5 accent-emerald-500"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">HR Interview</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Behavioral, situational, and motivational questions for soft skills.
                </p>
              </div>
              <ul className="text-xs text-slate-600 space-y-2 pt-2 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                <li className="flex items-center gap-2">✓ 5–15 Adaptive HR Questions</li>
                <li className="flex items-center gap-2">✓ 30-Minute Duration</li>
                <li className="flex items-center gap-2">✓ Behavioral & Situational Evaluation</li>
                <li className="flex items-center gap-2">✓ Soft-Skills & Culture-Fit Report</li>
                <li className="flex items-center gap-2">✓ "End Interview" Voice Command</li>
              </ul>
            </div>
            <button 
              onClick={() => handleStartRound('HR Interview')}
              className={`w-full mt-6 py-2.5 px-4 font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 ${
                file 
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer shadow-md' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              Start HR Interview →
            </button>
          </div>

          {/* Card 4: Full Interview */}
          <div 
            onClick={() => setSelectedMode('full')}
            className={`cursor-pointer rounded-2xl p-6 bg-white border transition-all duration-200 flex flex-col justify-between shadow-sm hover:shadow-md ${
              selectedMode === 'full' ? 'border-purple-600 ring-2 ring-purple-600/20' : 'border-slate-200'
            }`}
          >
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center text-xl font-bold">
                  🎯
                </div>
                <input 
                  type="radio" 
                  name="mode" 
                  checked={selectedMode === 'full'} 
                  onChange={() => setSelectedMode('full')} 
                  className="w-5 h-5 accent-purple-600"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Full Interview</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Complete orchestrated pipeline: Coding + Technical + HR with cross-round analysis.
                </p>
              </div>
              <ul className="text-xs text-slate-600 space-y-2 pt-2 bg-purple-50/50 p-3 rounded-xl border border-purple-100">
                <li className="flex items-center gap-2">✓ Round 1 — Coding (DSA)</li>
                <li className="flex items-center gap-2">✓ Round 2 — Technical</li>
                <li className="flex items-center gap-2">✓ Round 3 — HR</li>
                <li className="flex items-center gap-2">✓ Weighted Overall Score</li>
                <li className="flex items-center gap-2">✓ Cross-Round Consistency Analysis</li>
              </ul>
            </div>
            <button 
              onClick={() => handleStartRound('Full Interview')}
              className={`w-full mt-6 py-2.5 px-4 font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 ${
                file 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-md' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              Start Full Interview →
            </button>
          </div>

        </div>

        {/* How It Works Steps */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-5xl mx-auto shadow-sm">
          <h4 className="text-center font-bold text-slate-700 mb-6 text-sm uppercase tracking-wider">
            How it works
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            
            <div className="space-y-2">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto text-lg font-bold">📄</div>
              <h5 className="font-semibold text-sm text-slate-800">1. Upload Resume</h5>
              <p className="text-xs text-slate-500">Upload your resume in PDF/DOCX format</p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mx-auto text-lg font-bold">🧠</div>
              <h5 className="font-semibold text-sm text-slate-800">2. AI Analysis</h5>
              <p className="text-xs text-slate-500">Our AI analyzes your skills and experience</p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mx-auto text-lg font-bold">💬</div>
              <h5 className="font-semibold text-sm text-slate-800">3. Interview</h5>
              <p className="text-xs text-slate-500">Answer questions and get real-time AI evaluation</p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mx-auto text-lg font-bold">📊</div>
              <h5 className="font-semibold text-sm text-slate-800">4. Get Report</h5>
              <p className="text-xs text-slate-500">Receive detailed feedback and improvement tips</p>
            </div>

          </div>
        </div>

        {/* Feature Highlights Footer */}
        <div className="flex flex-wrap justify-center items-center gap-6 text-xs text-slate-500 pt-4">
          <span className="flex items-center gap-1.5">🤖 AI Powered</span>
          <span className="flex items-center gap-1.5">🎯 Adaptive Questions</span>
          <span className="flex items-center gap-1.5">📊 Detailed Analytics</span>
          <span className="flex items-center gap-1.5">🔒 Secure & Private</span>
          <span className="flex items-center gap-1.5">⚡ Real-time Feedback</span>
        </div>

      </div>
    </div>
  );
}

export default AIPage;