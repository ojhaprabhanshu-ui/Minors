import React from "react";
import resume from "../../resources/images/resume_img.png";
import resume_2 from "../../resources/images/resume_img_2.jpg";
import resume_3 from "../../resources/images/resume_img_3.png";
import resume_4 from "../../resources/images/resume_img_4.jpg";
import resume_5 from "../../resources/images/resume_img_5.jpg";

const Page_2 = () => {
  return (
    <div className="bg-white w-screen h-max p-10 flex flex-col items-center">

      <div className="flex items-center justify-between py-20 px-10 w-full">
        <div>
          <h1 className="text-5xl font-bold">
            Create a Job-Ready
            <br /> Resume in <span className="text-blue-500">Minutes.</span>
          </h1>
        </div>
        <div className="flex flex-col gap-2.5 items-start text-xl">
          <h1 className="text-base">
            Create your resume easily with
            <br /> our AI builder and proffessional template
          </h1>
          <button className="bg-blue-500 px-5 py-3 rounded-full text-white hover:cursor-pointer hover:bg-black active:scale-95 text-sm">
            Build my Resume
          </button>
        </div>
      </div>

      <div className="px-10 py-20 flex items-center justify-between w-full ">
        <img
          src={resume}
          alt=""
          className="h-130 object-contain rounded-lg drop-shadow-2xl"
        />
        <div className="w-170  flex flex-col gap-2.5 items-start text-xl">
          <h3 className="text-blue-500 text-base">How it works</h3>
          <h1 className="text-4xl font-bold">
            3 Step.
            <br />5 Minutes
          </h1>
          <h1 className="text-base">
            Build a resume that gets noticed. Our AI-powered ATS resume builder
            helps you craft tailored, professional resume that pass Applicant
            Tracking Systems with ease-so you can focus on landing interviews,
            not fighting with formatting.{" "}
          </h1>
          <button className="bg-blue-500 px-5 py-3 rounded-full text-white hover:cursor-pointer hover:bg-black active:scale-95 text-sm">
            Get Started
          </button>
        </div>
      </div>

      <div className=" flex items-center justify-between px-10 py-20 w-4/5 ">

        <div className="bg-gray-100 h-105 w-max px-10 py-15 rounded-3xl flex flex-col gap-4 items-start justify-start group hover:bg-blue-500 shadow-xl">
          <h1 class="flex aspect-square w-18 items-center justify-center rounded-xl font-semibold bg-black text-4xl font-black text-white shadow-lg group-hover:bg-white group-hover:text-blue-500 ">
            1.
          </h1>
          <h1 className="text-3xl group-hover:text-white">
            Choose
            <br /> Template
          </h1>
          <h1 className="w-50 text-gray-400  group-hover:text-gray-200">
            Pick a design that fits your style from our modern template
            collection
          </h1>
        </div>

        <div className="bg-gray-100 h-105  w-max px-10 py-15 rounded-3xl flex flex-col gap-4 items-start justify-star group hover:bg-blue-500 shadow-xl">
          <h1 class="flex aspect-square w-18 items-center justify-center rounded-xl font-semibold bg-black text-4xl font-black text-white shadow-lg  group-hover:bg-white group-hover:text-blue-500">
            2.
          </h1>
          <h1 className="text-3xl group-hover:text-white">
            Customize
            <br /> Your Resume
          </h1>
          <h1 className="w-50 text-gray-400 group-hover:text-gray-200">
            Adjust colors, fonts, and layout to create a personalised
            professional look.
          </h1>
        </div>

        <div className="bg-gray-100 h-105 w-max px-10 py-15 rounded-3xl flex flex-col gap-4 items-start justify-start group hover:bg-blue-500 shadow-xl">
          <h1 class="flex aspect-square w-18 items-center justify-center rounded-xl font-semibold bg-black text-4xl font-black text-white shadow-lg  group-hover:bg-white group-hover:text-blue-500">
            3.
          </h1>
          <h1 className="text-3xl group-hover:text-white">
            Easy
            <br /> Download
          </h1>
          <h1 className="w-50 text-gray-400 group-hover:text-gray-200">
            Instantly download your polished resume as a PDF in just one click.
          </h1>
        </div>
      </div>
      
      <div className=" px-10 py-20 flex items-center justify-between w-full ">
        <div className="w-170  flex flex-col gap-2.5 items-start text-xl">
          <h3 className="text-blue-500 text-base">Targeted Resume</h3>
          <h1 className="text-4xl font-bold">
            GET RESUME
            <br /> <span>TAILORED</span> FOR JOB.
          </h1>
          <h1 className="text-base">
            Paste any job description, and our AI will highlight the right
            keyword and skills.Instantly generate a tailored resume that matches
            the role and improve your chanches of landing an interview.{" "}
          </h1>
          <button className="bg-blue-100 px-7 py-3 rounded-md text-blue-500 border-2 border-blue-500 hover:cursor-pointer hover:bg-black hover:text-white hover:border-white  active:scale-95 text-sm shadow-lg shadow-blue-100">
            Targeted Resume
          </button>
        </div>
        <img
          src={resume_2}
          alt=""
          className="h-130 object-contain rounded-lg "
        />
      </div>

      <div className=" px-10 py-20 flex items-center justify-between w-full  ">
        <img
          src={resume_3}
          alt=""
          className="h-110 object-contain rounded-3xl "
        />
        <div className="w-170  flex flex-col gap-2.5 items-start text-xl">
          <h3 className="text-blue-500 text-base">AI Resume Enhancer</h3>
          <h1 className="text-4xl font-bold">
            Transform your old resume into a
            <br />
            <span className="text-orange-400">
              modern, ATS-friendly version
            </span>
          </h1>
          <h1 className="text-base">
            Instantly upgrade your existing resume our AI powered enhancement
            tool. It rewrites and ooptimizes your content to align your
            recruiterexpactions and Applicant Tracking System - helping you
            stand out in every job application.{" "}
          </h1>
          <button className="bg-orange-100 px-7 py-3 rounded-md text-orange-500 border-2 border-orange-300 hover:cursor-pointer hover:bg-black hover:text-white hover:border-white  active:scale-95 text-sm shadow-lg shadow-orange-100">
            Enhance My Resume
          </button>
        </div>
      </div>

      <div className=" px-10 py-20 flex items-center justify-between w-full  ">
        <div className="w-170  flex flex-col gap-2.5 items-start text-xl">
          <h3 className="text-blue-500 text-base">ATS Score Checker</h3>
          <h1 className="text-4xl font-bold">
            Check and analyze your
            <br />
            <span className="text-green-700">resume score.</span>
          </h1>
          <h1 className="text-base">
            Easily check your resume's ATS score with our AI-powered tool and
            see how well your skills and experience match recruiter
            expectations.{" "}
          </h1>
          <button className="bg-green-100 px-7 py-3 rounded-md text-green-600 border-2 border-green-600 hover:cursor-pointer hover:bg-black hover:text-white hover:border-white  active:scale-95 text-sm shadow-lg shadow-greeen-100">
            Check My Score
          </button>
        </div>
        <img
          src={resume_4}
          alt=""
          className="h-110 object-contain rounded-3xl "
        />
      </div>

      <div className=" px-10 py-20 flex items-center justify-between w-full  ">
        <img
          src={resume_5}
          alt=""
          className="h-110 object-contain rounded-3xl "
        />
        <div className="w-170  flex flex-col gap-2.5 items-start text-xl">
          <h3 className="text-blue-500 text-base">Easy Customization</h3>
          <h1 className="text-4xl font-bold">
            <span className="text-red-500">Quickly customize your</span>
            <br />
            resume with AI.
          </h1>
          <h1 className="text-base">
            Use your interactive builder to customize your resume witha wide
            range of controls. Easily adjust layouts, fonts, colors, and spacing
            to craft a design that matches your style while staying
            professional.{" "}
          </h1>
          <button className="bg-red-200 px-7 py-3 rounded-md text-red-600 border-2 border-red-600 hover:cursor-pointer hover:bg-black hover:text-white hover:border-white  active:scale-95 text-sm shadow-lg shadow-red-200">
            Customize Your Resume
          </button>
        </div>
      </div>

    </div>
  );
};

export default Page_2;
