import React from "react";
import resume from "../../../resources/images/resume_img.png";
import resume_2 from "../../../resources/images/resume_img_2.png";
import resume_3 from "../../../resources/images/resume_img_3.png";
import resume_4 from "../../../resources/images/resume_img_4.png";
import resume_5 from "../../../resources/images/resume_img_5.png";

const Page_2 = () => {
  return (
    <section className="bg-white text-slate-900 w-full px-5 py-16 sm:px-8 sm:py-20 lg:px-10 flex flex-col items-center overflow-x-hidden selection:bg-blue-500 selection:text-white">
      
      {/* Dynamic Background Glows */}
      <div className="relative w-full max-w-7xl">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse pointer-events-none" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse pointer-events-none" />
      </div>

      {/* Feature Section 1 - Showcase Hero Image */}
      <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-7xl gap-10 lg:gap-12 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 lg:p-10 shadow-xl shadow-slate-100/50">
        <div className="w-full md:w-1/2 flex flex-col gap-4 items-start order-2 md:order-1">
          <span className="text-blue-600 text-xs font-bold uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-md">
            Engineered For Results
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Pass the Bots. <br />Land the Interview.
          </h2>
          <p className="text-slate-600 leading-relaxed text-base sm:text-md">
            Our AI engine checks your resume against real recruiter parameters. We simplify formatting while maintaining dynamic typography so your application always reaches human eyes.
          </p>
          <button className="mt-2 bg-slate-900 hover:bg-blue-600 text-white px-7 py-3 rounded-xl font-medium text-sm transition-all shadow-md active:scale-95 cursor-pointer">
            Get Started Free
          </button>
        </div>

        <div className="w-full md:w-1/2 order-1 md:order-2 flex justify-center">
          <img
            src={resume}
            alt="Resume Preview 1"
            className="h-auto max-h-110 w-full object-contain rounded-2xl shadow-2xl transition-transform duration-500 hover:-translate-y-2"
          />
        </div>
      </div>

      {/* 3 Steps Bento Grid */}
      <div className="py-16 sm:py-20 w-full max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight">3 Simple Steps to Success</h2>
          <p className="text-slate-500 text-sm mt-2">Designed to keep your workflow fast and focus-driven.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200/70 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all group relative overflow-hidden">
            <span className="absolute top-4 right-6 text-6xl font-black text-slate-100 group-hover:text-blue-50 transition-colors pointer-events-none">
              01
            </span>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-lg mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
              01
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Pick a Template</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Choose from clean, battle-tested modern layouts built explicitly to meet technical ATS standards.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200/70 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all group relative overflow-hidden">
            <span className="absolute top-4 right-6 text-6xl font-black text-slate-100 group-hover:text-blue-50 transition-colors pointer-events-none">
              02
            </span>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-lg mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all">
              02
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Tailor with AI</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Paste the job description and let AI auto-generate missing bullet points and high-impact phrases.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200/70 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all group relative overflow-hidden">
            <span className="absolute top-4 right-6 text-6xl font-black text-slate-100 group-hover:text-blue-50 transition-colors pointer-events-none">
              03
            </span>
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 font-bold flex items-center justify-center text-lg mb-6 group-hover:bg-sky-600 group-hover:text-white transition-all">
              03
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Instant Export</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Download clean, search-parseable PDFs formatted explicitly for ATS engines with one single click.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Sections Stack */}
      <div className="flex flex-col gap-8 sm:gap-12 w-full max-w-7xl">
        
        {/* Feature Section 2 - Targeted Resume */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 p-8 sm:p-12 rounded-3xl border border-blue-100">
          <div className="w-full md:w-1/2 flex flex-col gap-4 items-start">
            <span className="text-blue-600 text-xs font-bold uppercase tracking-wider bg-white px-3 py-1 rounded-md border border-blue-100 shadow-sm">
              Smart Keyword Match
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Targeted Resumes for Specific Roles
            </h2>
            <p className="text-slate-600 text-base leading-relaxed sm:text-md">
              Match job descriptions automatically. Our platform parses key requirements and suggests missing bullet points to drastically elevate your interview match score.
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition-all shadow-md active:scale-95 cursor-pointer">
              Try Targeted Match
            </button>
          </div>
          <div className="w-full md:w-1/2 flex justify-center">
            <img
              src={resume_2}
              alt="Resume Preview 2"
              className="h-auto max-h-100 w-full object-contain rounded-2xl shadow-lg transition-transform duration-500 hover:-translate-y-2"
            />
          </div>
        </div>

        {/* Feature Section 3 - AI Enhancer */}
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-10 bg-white p-8 sm:p-12 rounded-3xl border border-slate-200/80 shadow-sm bg-gradient-to-br from-orange-50/50">
          <div className="w-full md:w-1/2 flex justify-center">
            <img
              src={resume_3}
              alt="Resume Preview 3"
              className="h-auto max-h-100 w-full object-contain rounded-2xl shadow-lg transition-transform duration-500 hover:-translate-y-2"
            />
          </div>
          <div className="w-full md:w-1/2 flex flex-col gap-4 items-start">
            <span className="text-amber-600 text-xs font-bold uppercase tracking-wider bg-amber-50 px-3 py-1 rounded-md border border-amber-100">
              One-Click Rewrite
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Transform Work Experience into Action Verbs
            </h2>
            <p className="text-slate-600 text-base leading-relaxed sm:text-md">
              Upgrade passive language into quantified achievements. Refine technical bullet points with proven industry action verbs instantly.
            </p>
            <button className="bg-amber-500 hover:bg-amber-600 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition-all shadow-md active:scale-95 cursor-pointer">
              Enhance Content Now
            </button>
          </div>
        </div>

        {/* Feature Section 4 - ATS Score Checker */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 bg-gradient-to-br from-emerald-50/40 to-teal-50/20 p-8 sm:p-12 rounded-3xl border border-emerald-100 ">
          <div className="w-full md:w-1/2 flex flex-col gap-4 items-start">
            <span className="text-emerald-700 text-xs font-bold uppercase tracking-wider bg-white px-3 py-1 rounded-md border border-emerald-100 shadow-sm">
              Real-Time Audit
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Instant ATS Compatibility Analysis
            </h2>
            <p className="text-slate-600 text-base leading-relaxed sm:text-md">
              Get detailed diagnostic feedback on content density, contact details, standard headings, and formatting anomalies before applying.
            </p>
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition-all shadow-md active:scale-95 cursor-pointer">
              Check My Score
            </button>
          </div>
          <div className="w-full md:w-1/2 flex justify-center">
            <img
              src={resume_4}
              alt="Resume Preview 4"
              className="h-auto max-h-100 w-full object-contain rounded-2xl shadow-lg transition-transform duration-500 hover:-translate-y-2"
            />
          </div>
        </div>

        {/* Feature Section 5 - Customization */}
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-10 bg-white p-8 sm:p-12 rounded-3xl border border-slate-200/80 shadow-sm bg-gradient-to-br from-red-50/50">
          <div className="w-full md:w-1/2 flex justify-center">
            <img
              src={resume_5}
              alt="Resume Preview 5"
              className="h-auto max-h-100 w-full object-contain rounded-2xl shadow-lg transition-transform duration-500 hover:-translate-y-2"
            />
          </div>
          <div className="w-full md:w-1/2 flex flex-col gap-4 items-start">
            <span className="text-red-600 text-xs font-bold uppercase tracking-wider bg-red-50 px-3 py-1 rounded-md border border-red-100">
              Precision Styling
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Complete Control Over Layout & Margins
            </h2>
            <p className="text-slate-600 text-base leading-relaxed sm:text-md">
              Fine-tune section spacing, line height, color palettes, and typography. Ensure single-page or two-page alignment effortlessly.
            </p>
            <button className="bg-rose-600 hover:bg-red-700 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition-all shadow-md active:scale-95 cursor-pointer">
              Customize Styles
            </button>
          </div>
        </div>

      </div>

    </section>
  );
};

export default Page_2;
