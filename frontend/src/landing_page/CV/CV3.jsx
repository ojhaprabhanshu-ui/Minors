import React from 'react';

function CV3() {
  const features = [
    {
      id: 1,
      title: 'Easy-to-Use CV Builder Interface',
      description:
        'Our CV builder is user-friendly and requires no technical skills. Just enter your details, and the CV builder will format everything automatically.',
      bg: 'bg-blue-50/60',
      border: 'border-blue-200',
      hoverBorder: 'hover:border-blue-400 hover:bg-blue-100/60 hover:shadow-blue-100',
      iconColor: 'text-blue-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M21.75 12h-2.25m-.166 5.834l-1.591-1.591M12 21.75V19.5m-5.834-.166l1.591-1.591M2.25 12h2.25m.166-5.834l1.591 1.591" />
        </svg>
      ),
    },
    {
      id: 2,
      title: 'ATS-Friendly CV Builder Templates',
      description:
        'Choose from modern and professional templates. Every template in our CV builder is designed to pass ATS systems.',
      bg: 'bg-emerald-50/60',
      border: 'border-emerald-200',
      hoverBorder: 'hover:border-emerald-400 hover:bg-emerald-100/60 hover:shadow-emerald-100',
      iconColor: 'text-emerald-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
    },
    {
      id: 3,
      title: 'AI-Powered CV Builder',
      description:
        'This smart CV builder suggests better keywords, strong action verbs, and improved job descriptions to make your CV stand out.',
      bg: 'bg-purple-50/60',
      border: 'border-purple-200',
      hoverBorder: 'hover:border-purple-400 hover:bg-purple-100/60 hover:shadow-purple-100',
      iconColor: 'text-purple-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
        </svg>
      ),
    },
    {
      id: 4,
      title: 'Fast CV Builder Download Options',
      description:
        'Download your CV in PDF format instantly with our CV builder. Get a polished, professional document in seconds.',
      bg: 'bg-orange-50/60',
      border: 'border-orange-200',
      hoverBorder: 'hover:border-orange-400 hover:bg-orange-100/60 hover:shadow-orange-100',
      iconColor: 'text-orange-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
      ),
    },
    {
      id: 5,
      title: 'Multi-Version CV Builder',
      description:
        'Create multiple versions of your CV using the same CV builder for different job roles. Tailor each version to match specific job descriptions.',
      bg: 'bg-cyan-50/60',
      border: 'border-cyan-200',
      hoverBorder: 'hover:border-cyan-400 hover:bg-cyan-100/60 hover:shadow-cyan-100',
      iconColor: 'text-cyan-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v2.25A2.25 2.25 0 0113.5 21h-7.5A2.25 2.25 0 014.5 18.75v-10.5A2.25 2.25 0 016.75 6h2.25m3.75 0h7.5A2.25 2.25 0 0122.5 8.25v10.5A2.25 2.25 0 0120.25 21h-7.5a2.25 2.25 0 01-2.25-2.25v-10.5A2.25 2.25 0 0112.75 6z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="min-h-screen w-full bg-white flex flex-col justify-center items-center py-16 px-6 lg:px-12 font-sans">
      <div className="max-w-6xl w-full mx-auto text-center space-y-10">
        
        {/* Header Section */}
        <div className="space-y-3.5 max-w-2xl mx-auto">
          <span className="inline-block px-3.5 py-1 bg-blue-100 text-blue-600 font-medium text-xs md:text-sm rounded-full">
            Powerful Features
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Features of Our CV Builder
          </h2>
          <p className="text-base text-slate-600 max-w-xl mx-auto">
            Everything you need to create a professional, job-winning CV
          </p>
        </div>

        {/* Dynamic Card Layout */}
        <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto pt-2">
          {features.map((item) => (
            <div
              key={item.id}
              className={`w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] flex flex-col justify-start items-start text-left p-6 rounded-2xl border ${item.border} ${item.bg} ${item.hoverBorder} transform hover:-translate-y-2 hover:shadow-lg transition-all duration-300 ease-in-out cursor-pointer`}
            >
              <div className={`p-2.5 rounded-xl bg-white shadow-sm mb-5 mt-1 ${item.iconColor}`}>
                {item.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug">
                {item.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default CV3;