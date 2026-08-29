import React from 'react';

function CT2() {
  const points = [
    {
      id: 1,
      text: 'Professionally designed CV templates for all industries',
    },
    {
      id: 2,
      text: 'ATS-friendly CV templates that pass recruiter systems',
    },
    {
      id: 3,
      text: 'Easy customization using Vireza CV Builder',
    },
    {
      id: 4,
      text: 'Clean, modern, and recruiter-approved layouts',
    },
    {
      id: 5,
      text: 'Fast editing and instant download options',
    },
  ];

  return (
    <section className="min-h-screen w-full bg-white flex flex-col justify-center items-center py-16 px-6 lg:px-12 font-sans">
      <div className="max-w-6xl w-full mx-auto text-center space-y-10">
        
        {/* Top Header Section */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-600 font-medium text-sm md:text-base rounded-full">
            Here's what you need to know
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Why Choose Vireza CV Templates?
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Not all CV templates are created equal. With Vireza CV Builder, you get high-quality CV templates that are optimized for both design and performance.
          </p>
        </div>

        {/* Feature Cards Grid (3 top, 2 bottom centered) */}
        <div className="max-w-5xl mx-auto space-y-5 pt-2">
          {/* Top Row: 3 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {points.slice(0, 3).map((point) => (
              <div
                key={point.id}
                className="group flex items-center gap-4 p-5 bg-blue-50/40 hover:bg-white border border-blue-100 hover:border-blue-400 rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 ease-in-out text-left cursor-pointer"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 group-hover:bg-blue-600 text-blue-600 group-hover:text-white rounded-full flex items-center justify-center transition-colors duration-300">
                  <svg
                    className="w-5 h-5 stroke-current"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2.5"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <span className="text-base font-semibold text-slate-800 group-hover:text-blue-600 leading-snug transition-colors duration-300">
                  {point.text}
                </span>
              </div>
            ))}
          </div>

          {/* Bottom Row: 2 Cards Centered */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {points.slice(3, 5).map((point) => (
              <div
                key={point.id}
                className="group flex items-center gap-4 p-5 bg-blue-50/40 hover:bg-white border border-blue-100 hover:border-blue-400 rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 ease-in-out text-left cursor-pointer"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 group-hover:bg-blue-600 text-blue-600 group-hover:text-white rounded-full flex items-center justify-center transition-colors duration-300">
                  <svg
                    className="w-5 h-5 stroke-current"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2.5"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <span className="text-base font-semibold text-slate-800 group-hover:text-blue-600 leading-snug transition-colors duration-300">
                  {point.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Tagline */}
        <p className="text-lg text-slate-600 max-w-2xl mx-auto pt-2 leading-relaxed">
          Our CV templates are built to help you showcase your skills in the best possible way.
        </p>

      </div>
    </section>
  );
}

export default CT2;