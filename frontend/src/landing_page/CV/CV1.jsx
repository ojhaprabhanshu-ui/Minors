import React from 'react';
import CVbuild1 from "../../resources/images/CVimg.png";

function CV1() {
  return (
    <section className="min-h-screen w-full bg-slate-50 flex items-center justify-center py-12 px-8 lg:px-16 font-sans">
      <div className="w-full max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Content Column */}
        <div className="space-y-10">
          <div className="space-y-4">
            <span className="text-lg font-bold tracking-widest text-blue-600 uppercase">
              Smart Resume Generator
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 leading-tight">
              Build a Standout Resume <br />
              <span className="text-blue-600">Fast & Effortlessly</span>
            </h1>
          </div>

          <p className="text-xl md:text-2xl text-slate-600 leading-relaxed max-w-2xl">
            Ready to secure your next career milestone? Our intuitive builder guides 
            you through crafting, customizing, and exporting an interview-ready 
            resume tailored to your industry standards.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-4">
            <button className="px-7 py-3 text-xl bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg transition-all duration-200" style={{ borderRadius: '40px' }}>
              Start Building Now
            </button>
            <button className="px-6 py-3 text-xl bg-white hover:bg-slate-100 text-blue-600 font-bold border-2 border-blue-600 rounded-2xl transition-all duration-200" style={{ borderRadius: '40px' }}>
              Import Existing Draft
            </button>
          </div>

          
          <div className="grid grid-cols-2 gap-8 pt-8 border-t-2 border-slate-200 max-w-2xl">
            <div className="flex items-center gap-4">
              <span className="text-4xl md:text-5xl font-black text-blue-600 bg-blue-100 px-4 py-2 rounded-xl">
                60%
              </span>
              <p className="text-lg font-semibold text-slate-700 leading-snug">
                Higher callback rate from recruiters
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-4xl md:text-5xl font-black text-emerald-600 bg-emerald-100 px-4 py-2 rounded-xl">
                25%
              </span>
              <p className="text-lg font-semibold text-slate-700 leading-snug">
                Average salary boost on placement
              </p>
            </div>
          </div>

          <p className="text-base md:text-lg italic text-slate-500 pt-2">
            Designed to help students, experienced professionals, and career transitioners get noticed faster.
          </p>
        </div>

        {/* Right Image Column */}
        <div className="relative flex justify-center items-center w-full">
          <div className="relative w-full">
            <img 
              src={CVbuild1} 
              alt="CV Builder Showcase Preview" 
              className="w-full h-auto object-contain drop-shadow-2xl rounded-3xl max-h-[80vh]"
            />
          </div>
        </div>

      </div>
    </section>
  );
}

export default CV1;