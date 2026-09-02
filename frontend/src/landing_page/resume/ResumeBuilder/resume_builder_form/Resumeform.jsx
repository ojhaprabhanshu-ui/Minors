import React from "react";
import { useState } from "react";
import Personaldetails from "./Personaldetails";
import Education from "./Education";
import Experience from "./Experience";

const Resumeform = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1
    firstname: "",
    middlename: "",
    lastname: "",
    email: "",
    phone: "",
    dateofbirth : "",
    address : "",

    // Step 2
    school :"",
    course: "",
    college: "",
    yearofgraduation : "",
    educationDescription: "",
    skills : [""],
    // Step 3
    jobTitle: "",
    numberofyears :"",
    company: "",
    jobDescription: "",
  });

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = () => {
    // You can export, pass to API, or trigger state handlers here
    console.log("Final Resume Data Centralized:", formData);
    
  };

  return (
    <div className="mx-auto my-8 max-w-xl rounded-xl bg-white p-6 shadow-md border border-gray-100">
      {/* Progress Bar Header */}
      <div className="mb-6 flex items-center justify-between border-b pb-4">
        <span
          className={`text-sm font-semibold ${step >= 1 ? "text-blue-600" : "text-gray-400"}`}
        >
          1. Personal
        </span>
        <span
          className={`text-sm font-semibold ${step >= 2 ? "text-blue-600" : "text-gray-400"}`}
        >
          2. Education
        </span>
        <span
          className={`text-sm font-semibold ${step === 3 ? "text-blue-600" : "text-gray-400"}`}
        >
          3. Experience
        </span>
      </div>

      {/* Render Steps Dynamically */}
      {step === 1 && (
        <Personaldetails
          formData={formData}
          setFormData={setFormData}
          nextStep={nextStep}
        />
      )}
      {step === 2 && (
        <Education
          formData={formData}
          setFormData={setFormData}
          nextStep={nextStep}
          prevStep={prevStep}
        />
      )}
      {step === 3 && (
        <Experience
          formData={formData}
          setFormData={setFormData}
          prevStep={prevStep}
          handleSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default Resumeform;
