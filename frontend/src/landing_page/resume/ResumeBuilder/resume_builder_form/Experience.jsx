import React, { useState } from "react";

const Experience = ({ formData, setFormData, prevStep, handleSubmit }) => {
  const [errors, setErrors] = useState({
    jobTitle: "",
    company: "",
    numberofyears: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field-specific error as user types
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();

    let newErrors = {
      jobTitle: "",
      company: "",
      numberofyears: "",
    };

    let valid = true;

    // Job Title Validation
    if (!formData?.jobTitle?.trim()) {
      newErrors.jobTitle = "Job Title is required";
      valid = false;
    }

    // Company Name Validation
    if (!formData?.company?.trim()) {
      newErrors.company = "Company Name is required";
      valid = false;
    }

    // Number of Years Validation (Safely handling string or number type)
    const rawYears = formData?.numberofyears != null ? String(formData.numberofyears).trim() : "";
    if (!rawYears) {
      newErrors.numberofyears = "Number of years is required";
      valid = false;
    } else if (isNaN(rawYears) || Number(rawYears) <= 0) {
      newErrors.numberofyears = "Please enter a valid number of years";
      valid = false;
    }

    setErrors(newErrors);

    if (!valid) return;
    handleSubmit();
  };

  return (
    <div className="w-full">
      {/* Step Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">
          Step 3: Job Experience
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Add your professional details to complete your resume.
        </p>
      </div>

      {/* Form Body */}
      <form onSubmit={handleFinalSubmit} className="space-y-4">
        {/* Job Title */}
        <div>
          <label
            htmlFor="jobTitle"
            className="block text-xs font-semibold text-slate-600 mb-1"
          >
            Job Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="jobTitle"
            id="jobTitle"
            value={formData?.jobTitle || ""}
            onChange={handleChange}
            placeholder="Frontend Developer"
            className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
          />
          {errors.jobTitle && (
            <p className="text-rose-500 text-xs mt-1 font-medium">
              {errors.jobTitle}
            </p>
          )}
        </div>

        {/* Company Name */}
        <div>
          <label
            htmlFor="company"
            className="block text-xs font-semibold text-slate-600 mb-1"
          >
            Company Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="company"
            id="company"
            value={formData?.company || ""}
            onChange={handleChange}
            placeholder="Tech Corp"
            className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
          />
          {errors.company && (
            <p className="text-rose-500 text-xs mt-1 font-medium">
              {errors.company}
            </p>
          )}
        </div>

        {/* Number of Years */}
        <div>
          <label
            htmlFor="numberofyears"
            className="block text-xs font-semibold text-slate-600 mb-1"
          >
            Number of Years <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            name="numberofyears"
            id="numberofyears"
            value={formData?.numberofyears || ""}
            onChange={handleChange}
            placeholder="e.g. 2"
            min="1"
            className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
          />
          {errors.numberofyears && (
            <p className="text-rose-500 text-xs mt-1 font-medium">
              {errors.numberofyears}
            </p>
          )}
        </div>

        {/* Job Description */}
        <div>
          <label
            htmlFor="jobDescription"
            className="block text-xs font-semibold text-slate-600 mb-1"
          >
            Job Description
          </label>
          <textarea
            name="jobDescription"
            id="jobDescription"
            rows="3"
            value={formData?.jobDescription || ""}
            onChange={handleChange}
            placeholder="Describe key responsibilities and achievements..."
            className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm resize-none"
          />
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={prevStep}
            className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-sm py-2 transition-all active:scale-[0.98]"
          >
            Back
          </button>
          <button
            type="submit"
            className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm py-2 transition-all shadow-sm active:scale-[0.98]"
          >
            Complete Resume
          </button>
        </div>
      </form>
    </div>
  );
};

export default Experience;