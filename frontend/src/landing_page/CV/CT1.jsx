import React from 'react';
import CTimg1 from "../../resources/images/CT1.png";
import CTimg2 from "../../resources/images/CT2.png";
import CTimg3 from "../../resources/images/CT3.png";
import CTimg4 from "../../resources/images/CT4.png";

function CT1() {
  const templates = [
    { id: 1, img: CTimg1, title: 'Clean Professional' },
    { id: 2, img: CTimg2, title: 'Modern Header' },
    { id: 3, img: CTimg3, title: 'Dark Accent Executive' },
    { id: 4, img: CTimg4, title: 'Minimal Mint' },
  ];

  return (
    <section className="h-screen w-full bg-slate-50 flex items-center justify-center p-6 font-sans overflow-hidden">
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Content Column */}
        <div className="lg:col-span-5 space-y-4">
          <h1 className=" font-extrabold text-slate-900 leading-tight" style={{fontSize:"3rem"}}>
            CV Templates  <br />
            <span className="text-blue-600">Build Stunning Resumes with Vireza</span>
          </h1>

          <div className="space-y-3 text-slate-600 text-md leading-relaxed">
            <p>
              Searching for the perfect CV templates to impress recruiters? With Vireza CV Builder, you get access to modern, professional, and ATS-friendly CV templates designed to help you land your dream job faster.
            </p>
            <p>
              Our Vireza CV templates are crafted for every career stage—from freshers to experienced professionals—making it easier than ever to create a powerful CV that stands out.
            </p>
          </div>

          {/* Action Buttons (Fully Rounded Pills) */}
          <div className="flex items-center gap-3 pt-2">
            <button style={{borderRadius:"24px"}} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-full shadow transition-all duration-200">
              Explore Templates
            </button>
            <button style={{borderRadius:"15px",borderColor:"#222222"}} className="px-6 py-2.5 bg-white hover:bg-slate-100 text-blue-600 font-semibold text-sm border border-blue-600 rounded-full transition-all duration-200">
              Create My CV
            </button>
          </div>
        </div>

        {/* Right 2x2 Image Showcase Grid (Full Uncropped Images) */}
        <div className="lg:col-span-7 grid grid-cols-2 gap-4 items-center">
          {templates.map((item) => (
            <div 
              key={item.id}
              className="group relative bg-white rounded-xl p-1.5 shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-300 transform hover:-translate-y-1 transition-all duration-200 flex items-center justify-center"
            >
              <div className="w-full h-full rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
                <img 
                  src={item.img} 
                  alt={item.title}
                  className="w-full h-auto max-h-[38vh] object-contain group-hover:scale-105 transition-transform duration-300" 
                />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default CT1;