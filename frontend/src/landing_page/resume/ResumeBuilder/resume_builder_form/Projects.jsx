import React from "react";
import { createProject, PROJECT_TYPES } from "../ResumeContext";

const LIST_KEY = "projects";

const inputClass =
  "w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm";

const labelClass = "block text-xs font-semibold text-slate-600 mb-1";

const Projects = ({ formData, nextStep, prevStep, addEntry, updateEntry, removeEntry }) => {
  const projects = Array.isArray(formData.projects) ? formData.projects : [];

  const handleChange = (id) => (event) => {
    const { name, value } = event.target;
    updateEntry(LIST_KEY, id, { [name]: value });
  };

  return (
    <div className="w-full">
      {/* Step Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">
          Step 4: Projects
          <span className="ml-2 align-middle text-xs font-semibold text-slate-400">OPTIONAL</span>
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          College, academic, personal, hackathon or professional work — projects can stand on their
          own without any work experience.
        </p>
      </div>

      <div className="space-y-4">
        {projects.map((project, index) => (
          <div
            key={project.id}
            className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Project {index + 1}
              </p>
              {projects.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEntry(LIST_KEY, project.id)}
                  className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-100"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor={`${project.id}-title`}>
                  Project Title
                </label>
                <input
                  type="text"
                  id={`${project.id}-title`}
                  name="title"
                  value={project.title || ""}
                  onChange={handleChange(project.id)}
                  placeholder="Campus Placement Portal"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass} htmlFor={`${project.id}-projectType`}>
                  Project Type
                </label>
                <select
                  id={`${project.id}-projectType`}
                  name="projectType"
                  value={project.projectType || ""}
                  onChange={handleChange(project.id)}
                  className={inputClass}
                >
                  <option value="">Select a type</option>
                  {PROJECT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass} htmlFor={`${project.id}-role`}>
                  Your Role / Contribution
                </label>
                <input
                  type="text"
                  id={`${project.id}-role`}
                  name="role"
                  value={project.role || ""}
                  onChange={handleChange(project.id)}
                  placeholder="Frontend lead"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass} htmlFor={`${project.id}-technologies`}>
                  Technologies Used
                </label>
                <input
                  type="text"
                  id={`${project.id}-technologies`}
                  name="technologies"
                  value={project.technologies || ""}
                  onChange={handleChange(project.id)}
                  placeholder="React, Node.js, MongoDB"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass} htmlFor={`${project.id}-startDate`}>
                  Start Date
                  <span className="ml-1.5 font-normal text-slate-400">(if applicable)</span>
                </label>
                <input
                  type="month"
                  id={`${project.id}-startDate`}
                  name="startDate"
                  value={project.startDate || ""}
                  onChange={handleChange(project.id)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass} htmlFor={`${project.id}-endDate`}>
                  End Date
                  <span className="ml-1.5 font-normal text-slate-400">(if applicable)</span>
                </label>
                <input
                  type="month"
                  id={`${project.id}-endDate`}
                  name="endDate"
                  value={project.endDate || ""}
                  onChange={handleChange(project.id)}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="mt-3">
              <label className={labelClass} htmlFor={`${project.id}-description`}>
                Project Description
              </label>
              <textarea
                id={`${project.id}-description`}
                name="description"
                rows="4"
                value={project.description || ""}
                onChange={handleChange(project.id)}
                placeholder={
                  "What problem it solves and what you built\nResults, scale, or anything measurable"
                }
                className={`${inputClass} resize-none`}
              />
              <p className="text-slate-400 text-xs mt-1">
                One point per line — each line becomes a bullet on your resume.
              </p>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor={`${project.id}-githubLink`}>
                  GitHub Link
                  <span className="ml-1.5 font-normal text-slate-400">(if available)</span>
                </label>
                <input
                  type="url"
                  id={`${project.id}-githubLink`}
                  name="githubLink"
                  value={project.githubLink || ""}
                  onChange={handleChange(project.id)}
                  placeholder="https://github.com/username/repo"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass} htmlFor={`${project.id}-liveLink`}>
                  Live Demo Link
                  <span className="ml-1.5 font-normal text-slate-400">(if available)</span>
                </label>
                <input
                  type="url"
                  id={`${project.id}-liveLink`}
                  name="liveLink"
                  value={project.liveLink || ""}
                  onChange={handleChange(project.id)}
                  placeholder="https://project-demo.vercel.app"
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => addEntry(LIST_KEY, createProject)}
          className="w-full rounded-lg border border-dashed border-blue-300 bg-blue-50/50 py-2.5 text-xs font-semibold text-blue-600 transition-colors hover:border-blue-400 hover:bg-blue-50"
        >
          + Add another project
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

export default Projects;
