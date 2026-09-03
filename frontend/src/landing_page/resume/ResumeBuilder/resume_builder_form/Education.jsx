import React, { useState } from "react";

const Education = ({ formData, setFormData, nextStep, prevStep }) => {
  const [errors, setErrors] = useState({
    school: "",
    college: "",
    course: "",
    yearofgraduation: "",
    skills: "",
  });

  // Ensure skills array fallback
  const skillsList = Array.isArray(formData?.skills) && formData.skills.length > 0
    ? formData.skills
    : [""];

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // Update specific skill index
  const handleSkillChange = (index, value) => {
    const updatedSkills = [...skillsList];
    updatedSkills[index] = value;

    setFormData((prev) => ({
      ...prev,
      skills: updatedSkills,
    }));

    setErrors((prev) => ({
      ...prev,
      skills: "",
    }));
  };

  // Add new skill input field
  const addSkill = () => {
    setFormData((prev) => ({
      ...prev,
      skills: [...skillsList, ""],
    }));
  };

  // Remove skill input field
  const removeSkill = (index) => {
    if (skillsList.length > 1) {
      const updatedSkills = skillsList.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        skills: updatedSkills,
      }));
    }
  };

  const handleNext = (e) => {
    e.preventDefault();

    let newErrors = {
      school: "",
      college: "",
      course : "",
      yearofgraduation: "",
      skills: "",
    };

    let valid = true;

    // Validation checks
    if (!formData.school?.trim()) {
      newErrors.school = "School / Course is required";
      valid = false;
    }

    if (!formData.college?.trim()) {
      newErrors.college = "College / University is required";
      valid = false;
    }

    if (!formData.yearofgraduation?.trim()) {
      newErrors.yearofgraduation = "Year of graduation is required";
      valid = false;
    }

    const hasValidSkill = skillsList.some(
      (s) => typeof s === "string" && s.trim().length > 0
    );

    if (!hasValidSkill) {
      newErrors.skills = "At least one skill is required";
      valid = false;
    }

    setErrors(newErrors);

    if (!valid) return;
    nextStep();
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">
          Step 2: Education Details
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Provide your academic background and key technical skills.
        </p>
      </div>

      {/* Form Container */}
      <form onSubmit={handleNext} className="space-y-4">
        {/* School / Course */}
        <div>
          <label htmlFor="school" className="block text-xs font-semibold text-slate-600 mb-1">
            School <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="school"
            id="school"
            value={formData.school || ""}
            onChange={handleChange}
            placeholder="High School / B.Tech"
            className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
          />
          {errors.school && (
            <p className="text-rose-500 text-xs mt-1 font-medium">{errors.school}</p>
          )}
        </div>
        <div>
          <label htmlFor="school" className="block text-xs font-semibold text-slate-600 mb-1">
             Course <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="course"
            id="course"
            value={formData.course || ""}
            onChange={handleChange}
            placeholder="B.Tech"
            className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
          />
          {errors.course && (
            <p className="text-rose-500 text-xs mt-1 font-medium">{errors.course}</p>
          )}
        </div>

        {/* College / University */}
        <div>
          <label htmlFor="college" className="block text-xs font-semibold text-slate-600 mb-1">
            College / University <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="college"
            id="college"
            value={formData.college || ""}
            onChange={handleChange}
            placeholder="ABC University"
            className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
          />
          {errors.college && (
            <p className="text-rose-500 text-xs mt-1 font-medium">{errors.college}</p>
          )}
        </div>

        {/* Year of Graduation */}
        <div>
          <label htmlFor="yearofgraduation" className="block text-xs font-semibold text-slate-600 mb-1">
            Year of Graduation <span className="text-rose-500">*</span>
          </label>
          <input
            type="year"
            name="yearofgraduation"
            id="yearofgraduation"
            value={formData.yearofgraduation || ""}
            onChange={handleChange}
            className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
          />
          {errors.yearofgraduation && (
            <p className="text-rose-500 text-xs mt-1 font-medium">{errors.yearofgraduation}</p>
          )}
        </div>

        {/* Relevant Coursework (Optional) */}
        <div>
          <label htmlFor="coursework" className="block text-xs font-semibold text-slate-600 mb-1">
            Relevant Coursework
            <span className="ml-1.5 font-normal text-slate-400">(optional)</span>
          </label>
          <input
            type="text"
            name="coursework"
            id="coursework"
            value={formData.coursework || ""}
            onChange={handleChange}
            placeholder="Data Structures, Operating Systems, DBMS"
            className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
          />
          <p className="text-slate-400 text-xs mt-1">Separate subjects with commas.</p>
        </div>

        {/* Dynamic Skills Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Skills <span className="text-rose-500">*</span>
          </label>

          <div className="space-y-2">
            {skillsList.map((skill, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={skill || ""}
                  onChange={(e) => handleSkillChange(index, e.target.value)}
                  placeholder={`Skill ${index + 1}`}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                />

                {skillsList.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition-colors shrink-0"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          {errors.skills && (
            <p className="text-rose-500 text-xs mt-1 font-medium">{errors.skills}</p>
          )}

          <button
            type="button"
            onClick={addSkill}
            className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            + Add Another Skill
          </button>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="educationDescription" className="block text-xs font-semibold text-slate-600 mb-1">
            Description
          </label>
          <textarea
            name="educationDescription"
            id="educationDescription"
            rows="3"
            value={formData.educationDescription || ""}
            onChange={handleChange}
            placeholder="Mention relevant coursework, honors, or activities..."
            className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm resize-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={prevStep}
            className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-sm py-2 transition-all"
          >
            Back
          </button>
          <button
            type="submit"
            className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm py-2 transition-all shadow-sm"
          >
            Next Step
          </button>
        </div>
      </form>
    </div>
  );
};

export default Education;