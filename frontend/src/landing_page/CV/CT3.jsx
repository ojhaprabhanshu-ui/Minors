import React from 'react';

function CT3() {
  const features = [
    {
      id: 1,
      title: 'Professional CV Templates',
      description:
        'Perfect for corporate roles. These Vireza CV templates focus on clarity, structure, and strong presentation.',
      bg: 'bg-blue-50/60',
      border: 'border-blue-200',
      hoverBorder: 'hover:border-blue-400 hover:bg-blue-100/60 hover:shadow-blue-100',
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100/80',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V4.5a2.25 2.25 0 00-2.25-2.25h-3a2.25 2.25 0 00-2.25 2.25v1.644m9 0l-9 0" />
        </svg>
      ),
    },
    {
      id: 2,
      title: 'Modern CV Templates',
      description:
        'Want something stylish? Our modern CV templates combine design and readability. Ideal for creative and tech roles.',
      bg: 'bg-purple-50/60',
      border: 'border-purple-200',
      hoverBorder: 'hover:border-purple-400 hover:bg-purple-100/60 hover:shadow-purple-100',
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-100/80',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
        </svg>
      ),
    },
    {
      id: 3,
      title: 'ATS-Friendly CV Templates',
      description:
        'Every Vireza CV template is optimized for ATS systems. Ensures your resume gets through automated screening tools.',
      bg: 'bg-emerald-50/60',
      border: 'border-emerald-200',
      hoverBorder: 'hover:border-emerald-400 hover:bg-emerald-100/60 hover:shadow-emerald-100',
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-100/80',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75l2.25 2.25 4.5-4.5M12 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
    },
    {
      id: 4,
      title: 'Fresher CV Templates',
      description:
        'New to the job market? Designed to highlight education, skills, and potential using Vireza CV Builder.',
      bg: 'bg-amber-50/60',
      border: 'border-amber-200',
      hoverBorder: 'hover:border-amber-400 hover:bg-amber-100/60 hover:shadow-amber-100',
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-100/80',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5z" />
        </svg>
      ),
    },
    {
      id: 5,
      title: 'Creative CV Templates',
      description:
        'Stand out with unique layouts. Perfect for designers, marketers, and creative professionals.',
      bg: 'bg-pink-50/60',
      border: 'border-pink-200',
      hoverBorder: 'hover:border-pink-400 hover:bg-pink-100/60 hover:shadow-pink-100',
      iconColor: 'text-pink-600',
      iconBg: 'bg-pink-100/80',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M10.5 8.197L5.803 12.894" />
        </svg>
      ),
    },
  ];

  return (
    <section className="min-h-screen w-full bg-white flex flex-col justify-center items-center py-16 px-6 lg:px-12 font-sans">
      <div className="max-w-6xl w-full mx-auto text-center space-y-10">
        
        {/* Header Section */}
        <div className="space-y-3.5 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Explore Different Types of Vireza CV Templates
          </h2>
          <p className="text-lg text-slate-600 max-w-xl mx-auto">
            Find the perfect template for your industry and career level
          </p>
        </div>

        {/* Dynamic Card Layout (3 top, 2 bottom centered) */}
        <div className="max-w-6xl mx-auto space-y-6 pt-2">
          {/* Top Row: 3 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className={`flex flex-col justify-start items-start text-left p-6 rounded-2xl border ${item.border} ${item.bg} ${item.hoverBorder} transform hover:-translate-y-2 hover:shadow-lg transition-all duration-300 ease-in-out cursor-pointer`}
              >
                <div className={`p-3 rounded-xl ${item.iconBg} ${item.iconColor} shadow-sm mb-5`}>
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2.5 leading-snug">
                  {item.title}
                </h3>
                <p className="text-base text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom Row: 2 Cards Centered */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {features.slice(3, 5).map((item) => (
              <div
                key={item.id}
                className={`flex flex-col justify-start items-start text-left p-6 rounded-2xl border ${item.border} ${item.bg} ${item.hoverBorder} transform hover:-translate-y-2 hover:shadow-lg transition-all duration-300 ease-in-out cursor-pointer`}
              >
                <div className={`p-3 rounded-xl ${item.iconBg} ${item.iconColor} shadow-sm mb-5`}>
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2.5 leading-snug">
                  {item.title}
                </h3>
                <p className="text-base text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

export default CT3;