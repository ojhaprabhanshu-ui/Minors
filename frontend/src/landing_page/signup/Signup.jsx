import React from "react";

const Signup = () => {
  return (
    <div className="h-screen w-screen flex items-center content-center bg-red-200  ">

        {/* Left Branding */}
      <div className="h-full w-1/2 bg-red-500 flex flex-col items-center content-center">
      
          <h1 className="text-3xl md:text-6xl font-bold tracking-tight mb-4 mt-30">
            Welcome to Minors!
          </h1>
          <p className="text-slate-300 text-center mt-15 md:text-xl leading-relaxed">
            Join our collaborative platform <br/> for your next big idea.
          </p>
        
      </div>
      <div className="h-full w-1/2 bg-gray-400"></div>
    </div>
  );
};

export default Signup;
