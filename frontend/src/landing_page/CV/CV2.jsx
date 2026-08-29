import React from 'react';

function CV2() {
  const features = [
    { id: 1, text: 'Create a professional CV instantly' },
    { id: 2, text: 'Use ATS-friendly CV templates' },
    { id: 3, text: 'Customize your CV for different jobs' },
    { id: 4, text: 'Improve your chances of getting shortlisted' },
  ];

  return (
    <section className="min-h-screen w-full bg-white flex flex-col justify-center items-center py-12 px-6 lg:px-10 font-sans">
      <div className="max-w-4xl w-full mx-auto text-center space-y-7">
        
        {/* Top Header Section */}
        <div className="space-y-3.5 max-w-2xl mx-auto">
          <span className="inline-block px-3.5 py-1 bg-blue-100 text-blue-600 font-medium text-xs md:text-sm rounded-full">
            Why Choose Us
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Why Use Our CV Builder?
          </h2>
          <p className="text-base text-slate-600 leading-relaxed max-w-xl mx-auto">
            Our CV builder is designed with modern hiring needs in mind. Recruiters today use ATS (Applicant Tracking Systems), and our CV builder ensures your CV is fully optimized for them.
          </p>
        </div>

        {/* 2x2 Feature Grid - Medium Balanced Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto pt-1">
          {features.map((feature) => (
            <div 
              key={feature.id}
              className="flex items-center gap-3.5 p-4 bg-blue-50/50 hover:bg-blue-50 border border-blue-100/80 rounded-xl shadow-sm transition-all duration-200 text-left"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                <svg 
                  className="w-4 h-4 stroke-current" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth="2.5" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <span className="text-base font-semibold text-slate-800">
                {feature.text}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom Tagline */}
        <p className="text-base text-slate-600 max-w-xl mx-auto pt-1 leading-relaxed">
          Unlike other tools, this CV builder combines simplicity, AI intelligence, and powerful customization.
        </p>

      </div>
    </section>
  );
}

export default CV2;