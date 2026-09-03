import React from "react";
import { createExperience } from "../ResumeContext";

const LIST_KEY = "experiences";

const inputClass =
  "w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm";

const labelClass = "block text-xs font-semibold text-slate-600 mb-1";

const Experience = ({ formData, nextStep, prevStep, addEntry, updateEntry, removeEntry }) => {
  const experiences = Array.isArray(formData.experiences) ? formData.experiences : [];

  const handleChange = (id) => (event) => {
    const { name, value } = event.target;
    updateEntry(LIST_KEY, id, { [name]: value });
  };

  const handlePresentChange = (id) => (event) => {
    const isPresent = event.target.checked;
    updateEntry(LIST_KEY, id, isPresent ? { isPresent, endDate: "" } : { isPresent });
  };

  return (
    <div className="w-full">
      {/* Step Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">
          Step 3: Work Experience
          <span className="ml-2 align-middle text-xs font-semibold text-slate-400">OPTIONAL</span>
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Students and fresh graduates can skip this section entirely — add projects on the next step
          instead.
        </p>
      </div>

      <div className="space-y-4">
        {experiences.map((experience, index) => (
          <div
            key={experience.id}
            className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Experience {index + 1}
              </p>
              {experiences.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEntry(LIST_KEY, experience.id)}
                  className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-100"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor={`${experience.id}-jobTitle`}>
                  Job Title
                </label>
                <input
                  type="text"
                  id={`${experience.id}-jobTitle`}
                  name="jobTitle"
                  value={experience.jobTitle || ""}
                  onChange={handleChange(experience.id)}
                  placeholder="Frontend Developer"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass} htmlFor={`${experience.id}-company`}>
                  Company Name
                </label>
                <input
                  type="text"
                  id={`${experience.id}-company`}
                  name="company"
                  value={experience.company || ""}
                  onChange={handleChange(experience.id)}
                  placeholder="Tech Corp"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass} htmlFor={`${experience.id}-location`}>
                  Location
                </label>
                <input
                  type="text"
                  id={`${experience.id}-location`}
                  name="location"
                  value={experience.location || ""}
                  onChange={handleChange(experience.id)}
                  placeholder="Pune, India"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass} htmlFor={`${experience.id}-startDate`}>
                    Start Date
                  </label>
                  <input
                    type="month"
                    id={`${experience.id}-startDate`}
                    name="startDate"
                    value={experience.startDate || ""}
                    onChange={handleChange(experience.id)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor={`${experience.id}-endDate`}>
                    End Date
                  </label>
                  <input
                    type="month"
                    id={`${experience.id}-endDate`}
                    name="endDate"
                    value={experience.isPresent ? "" : experience.endDate || ""}
                    disabled={experience.isPresent}
                    onChange={handleChange(experience.id)}
                    className={`${inputClass} disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400`}
                  />
                </div>
              </div>
            </div>

            <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-600">
              <input
                type="checkbox"
                checked={Boolean(experience.isPresent)}
                onChange={handlePresentChange(experience.id)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              I currently work here
            </label>

            <div className="mt-3">
              <label className={labelClass} htmlFor={`${experience.id}-responsibilities`}>
                Responsibilities / Achievements
              </label>
              <textarea
                id={`${experience.id}-responsibilities`}
                name="responsibilities"
                rows="4"
                value={experience.responsibilities || ""}
                onChange={handleChange(experience.id)}
                placeholder={"Built a component library used by 4 product teams\nCut page load time by 35%"}
                className={`${inputClass} resize-none`}
              />
              <p className="text-slate-400 text-xs mt-1">
                One achievement per line — each line becomes a bullet on your resume.
              </p>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => addEntry(LIST_KEY, createExperience)}
          className="w-full rounded-lg border border-dashed border-blue-300 bg-blue-50/50 py-2.5 text-xs font-semibold text-blue-600 transition-colors hover:border-blue-400 hover:bg-blue-50"
        >
          + Add another experience
        </button>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-3 pt-4 mt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={prevStep}
          className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-sm py-2 transition-all active:scale-[0.98]"
        >
          Back
        </button>

        <button
          type="button"
          onClick={nextStep}
          className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm py-2 transition-all shadow-sm active:scale-[0.98]"
        >
          Next Step
        </button>
      </div>
    </div>
  );
};

export default Experience;
