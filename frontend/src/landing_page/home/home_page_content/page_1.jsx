import React from "react";
import { CheckCircle2, ArrowRight, Sparkles, ShieldCheck, Zap } from "lucide-react";

const Page_1 = () => {
  return (
    <section className="relative w-full min-h-screen bg-slate-50/50 text-slate-900 flex flex-col items-center justify-between pt-20 pb-12 px-4 overflow-hidden selection:bg-blue-500 selection:text-white">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-blue-400/20 to-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-10 -right-10 w-80 h-80 bg-sky-300/20 rounded-full blur-2xl pointer-events-none" />

      {/* Main Hero Container */}
      <div className="relative max-w-5xl w-full flex flex-col items-center text-center gap-8 my-auto">
        
        {/* Top Feature Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs sm:text-sm font-semibold tracking-wide shadow-sm hover:scale-105 transition-transform cursor-default">
          <Sparkles className="w-4 h-4 text-blue-600 fill-blue-600" />
          <span>Next-Gen AI Resume Engine v3.0</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-5xl italic font-black tracking-tight leading-[1.12] text-slate-900 max-w-4xl">
          Stand Out. Get Hired. <br />
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
            Powered by Career AI.
          </span>
        </h1>

        {/* Subtitle Paragraph */}
        <p className="text-slate-600 text-base sm:text-md font-normal max-w-2xl leading-relaxed">
          Transform your career journey into a high-impact, ATS-optimized resume. Built specifically to bypass keyword screeners and land top-tier interviews.
        </p>

        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base px-6 py-2 rounded-2xl shadow-xl shadow-blue-500/25 active:scale-95 hover:-translate-y-0.5 transition-all cursor-pointer">
            Create Resume Now
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 font-medium text-base px-6 py-2 rounded-2xl active:scale-95 transition-all shadow-sm cursor-pointer">
            Check ATS Score
          </button>
        </div>

        {/* Feature Highlights Strip */}
        <div className="pt-4 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 w-full max-w-4xl">
          <div className="flex items-center justify-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-slate-200/60 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-slate-700">Real-time ATS Score</span>
          </div>
          
          <div className="flex items-center justify-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-slate-200/60 shadow-xs">
            <Zap className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-slate-700">One-Click AI Writer</span>
          </div>

          <div className="flex items-center justify-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-slate-200/60 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-slate-700">Recruiter Approved</span>
          </div>

          <div className="flex items-center justify-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-slate-200/60 shadow-xs">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-slate-700">Smart Job Matching</span>
          </div>
        </div>

      </div>

      {/* Hero Interactive App Preview Box */}
      <div className="relative w-full max-w-5xl mt-12 rounded-3xl p-3 bg-gradient-to-b from-slate-200/60 to-slate-300/20 border border-slate-200/80 shadow-2xl">
        <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 flex flex-col md:flex-row items-center justify-between p-6 sm:p-8 gap-6 text-left">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Live ATS Diagnostics
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
              Score 90+ Compatibility Before Applying
            </h3>
            <p className="text-slate-500 text-sm max-w-lg">
              Our analyzer scans job descriptions against your experience line-by-line to pinpoint missing technical keywords instantly.
            </p>
          </div>

          <div className="flex items-center gap-6 bg-slate-50 px-6 py-4 rounded-2xl border border-slate-200/70 w-full md:w-auto justify-between md:justify-start">
            <div>
              <p className="text-xs text-slate-500 font-medium">Average Match Improvement</p>
              <p className="text-2xl sm:text-3xl font-black text-blue-600">+42%</p>
            </div>
            <div className="h-10 w-[1px] bg-slate-200" />
            <div>
              <p className="text-xs text-slate-500 font-medium">Recruiter View Rate</p>
              <p className="text-2xl sm:text-3xl font-black text-slate-900">3.4x</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trust & Metrics Footer Strip */}
      <div className="w-full max-w-5xl pt-12 border-t border-slate-200/60 mt-12 flex flex-wrap items-center justify-between gap-6 text-slate-500 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900 text-base">100,000+</span> Resumes Generated
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900 text-base">98%</span> ATS Screener Pass Rate
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900 text-base">4.9/5</span> Average Candidate Score
        </div>
      </div>

    </section>
  );
};

export default Page_1;