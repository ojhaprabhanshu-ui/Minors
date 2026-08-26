import React from "react";
import { CircleCheck } from "lucide-react";

const Page_1 = () => {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center gap-5">
      <h1 className="text-6xl font-bold text-center">
        Land your <span className="text-blue-500"> dream job. </span>
        <br /> With AI resume
      </h1>

      <p className="text-center font-medium">
        Build a proffessional, ATS friendly resume in minutes with the power of
        AI. <br />
        Highlight your skills, achievements, and experience to get noticed by{" "}
        <br /> recruiters and land your dream job faster.
      </p>
      <div className="flex items-center justify-center gap-9">
        <h6 className="font-medium flex items-center justify-center gap-2">
          <CircleCheck size={36} strokeWidth={0.85} color="blue" /> ATS Score
          Checker
        </h6>
        <h6 className="font-medium flex items-center justify-center gap-2">
          <CircleCheck size={36} strokeWidth={0.85} color="blue" />
          Interactive Resume Customization
        </h6>
        <h6 className="font-medium flex items-center justify-center gap-2">
          <CircleCheck size={36} strokeWidth={0.85} color="blue" />
          AI Resume Creation
        </h6>
        <h6 className="font-medium flex items-center justify-center gap-2">
          <CircleCheck size={36} strokeWidth={0.85} color="blue" />
          Expert Insights
        </h6>
      </div>
      <button className="bg-blue-500 rounded-full px-5 py-2 hover:cursor-pointer text-white active:scale-95 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-md"
      >
        Build My Resume
      </button>
    </div>
  );
};

export default Page_1;
