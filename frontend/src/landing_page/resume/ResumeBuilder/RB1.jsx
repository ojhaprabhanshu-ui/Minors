import React from 'react';
import resumebuild1 from "../../../resources/images/resumebuild1.png";
import { useNavigate } from 'react-router-dom';

export default function RB1() {
  const navigate = useNavigate();

  return (
    <section className="bg-[#f5f8ff] min-h-screen flex items-center justify-center p-4 md:p-12 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        
        <div className="flex flex-col items-start space-y-6">
          <h1
  className="text-[10vw] sm:text-[8vw] md:text-[6vw] lg:text-[2.5rem] xl:text-[6.5rem] font-semibold leading-[0.98] tracking-[-0.055em] text-slate-750 font-sans -translate-x-4"
>
  Your Resume
  <br />
  <span className="text-blue-600">Your Next Opportunity</span>
</h1>

          <p className="text-xl sm:text-2xl text-slate-600 max-w-xl font-medium">
            Designed to pass ATS filters and impress hiring managers.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto pt-2">
  <button 
  style={{ borderRadius: '40px' }}
  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-7 py-3.5 shadow-md transition duration-200 text-center cursor-pointer" 
  onClick={() => navigate("/resume/builder/resumeform")}
>
  Create my resume
</button>
  
  <button style={{ borderRadius: '40px' }}
    className="bg-white border-2 border-blue-500 hover:bg-blue-50 text-blue-600 font-semibold px-7 py-3.5 rounded-[12px] transition duration-200 text-center cursor-pointer" 
    onClick={() => navigate("#")}
  >
    Upload my resume
  </button>
</div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center gap-8 pt-4 text-base font-medium text-slate-700">
  <div className="flex items-center gap-3">
    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-lg font-bold">
      ✓
    </span>
    <span>ATS-friendly resume templates</span>
  </div>

  <div className="flex flex-center gap-3">
    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-lg font-bold">
      ✓
    </span>
    <span>Professional designs in minutes</span>
  </div>
</div>
</div>

        {/* Right Graphic Column */}
        <div className="relative w-full flex justify-center items-center">
          <div className="w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl bg-white border border-slate-100">
            <img 
              src={resumebuild1} 
              alt="Resume Preview Showcase" 
              className="w-full h-auto object-cover"
            />
          </div>
        </div>

      </div>
    </section>
  );
}