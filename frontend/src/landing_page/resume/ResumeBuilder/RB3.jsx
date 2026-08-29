import React from 'react';

export default function RB3() {
  return (
    <section className="bg-white py-16 px-4 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto flex flex-col items-center">
        
        {/* Section Heading */}
        <h2 className=" font-extrabold text-slate-900 text-center " style={{fontSize:"3rem",marginBottom:"2rem",fontWeight:"bolder"}}>
          Before vs After VIREZA
        </h2>

        {/* Comparison Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mb-12">
          
          {/* BEFORE CARD */}
          <div className="border border-red-200 bg-red-50/20 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col justify-between">
            <div>
              {/* Card Header */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">Without VIREZA</h3>
                <span className="text-red-500 font-bold text-xl">✕</span>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-slate-600">ATS Match Score:</span>
                  <span className="text-sm font-bold text-red-500">38%</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-red-500 h-full rounded-full" style={{ width: '38%' }}></div>
                </div>
              </div>

              {/* Bullet Points */}
              <ul className="space-y-4 mb-6">
                <li className="flex items-center gap-3 text-slate-700 font-medium">
                  <span className="w-6 h-6 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-xs font-bold">
                    ✕
                  </span>
                  Vague duty descriptions
                </li>
                <li className="flex items-center gap-3 text-slate-700 font-medium">
                  <span className="w-6 h-6 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-xs font-bold">
                    ✕
                  </span>
                  Missing role-critical keywords
                </li>
                <li className="flex items-center gap-3 text-slate-700 font-medium">
                  <span className="w-6 h-6 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-xs font-bold">
                    ✕
                  </span>
                  Unstructured layout filters reject
                </li>
              </ul>
            </div>

            {/* Example Box */}
            <div className="p-4 bg-white rounded-xl border border-red-100 text-sm italic text-slate-500">
              "Handled daily business task operations and assisted team members with projects."
            </div>
          </div>

          {/* AFTER CARD */}
          <div className="border border-emerald-200 bg-emerald-50/20 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col justify-between">
            <div>
              {/* Card Header */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">With VIREZA</h3>
                <span className="text-emerald-500 font-bold text-xl">✓</span>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-slate-600">ATS Match Score:</span>
                  <span className="text-sm font-bold text-emerald-500">95%</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>

              {/* Bullet Points */}
              <ul className="space-y-4 mb-6">
                <li className="flex items-center gap-3 text-slate-700 font-medium">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">
                    ✓
                  </span>
                  Impact-driven metric statements
                </li>
                <li className="flex items-center gap-3 text-slate-700 font-medium">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">
                    ✓
                  </span>
                  Industry-targeted keyword density
                </li>
                <li className="flex items-center gap-3 text-slate-700 font-medium">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">
                    ✓
                  </span>
                  100% scanner-compliant structure
                </li>
              </ul>
            </div>

            {/* Example Box */}
            <div className="p-4 bg-white rounded-xl border border-emerald-100 text-sm italic text-slate-600">
              "Architected workflow automation saving 14+ engineering hours weekly and boosting output by 35%."
            </div>
          </div>

        </div>

        {/* Footer Text */}
        <p className="text-xl sm:text-2xl font-bold text-slate-900 text-center">
          Same experience. <span className="text-blue-600">Exponentially higher callbacks.</span>
        </p>

      </div>
    </section>
  );
}