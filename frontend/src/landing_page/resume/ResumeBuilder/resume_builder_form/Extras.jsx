import React from "react";
import { createCertification } from "../ResumeContext";

const CERT_KEY = "certifications";
const ACHIEVEMENT_KEY = "achievements";

const inputClass =
  "w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm";

const labelClass = "block text-xs font-semibold text-slate-600 mb-1";

const Extras = ({
  formData,
  prevStep,
  handleSubmit,
  addEntry,
  updateEntry,
  removeEntry,
  addString,
  updateString,
  removeString,
}) => {
  const certifications = Array.isArray(formData.certifications) ? formData.certifications : [];
  const achievements =
    Array.isArray(formData.achievements) && formData.achievements.length > 0
      ? formData.achievements
      : [""];

  const handleCertChange = (id) => (event) => {
    const { name, value } = event.target;
    updateEntry(CERT_KEY, id, { [name]: value });
  };

  return (
    <div className="w-full">
      {/* Step Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">
          Step 5: Certifications &amp; Achievements
          <span className="ml-2 align-middle text-xs font-semibold text-slate-400">OPTIONAL</span>
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Add anything that strengthens your profile. Both sections can be left empty.
        </p>
      </div>

      {/* Certifications */}
      <div className="mb-6">
        <h3 className="mb-3 text-sm font-bold text-slate-700">Certifications</h3>

        <div className="space-y-3">
          {certifications.map((certification, index) => (
            <div
              key={certification.id}
              className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Certification {index + 1}
                </p>
                {certifications.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEntry(CERT_KEY, certification.id)}
                    className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-100"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className={labelClass} htmlFor={`${certification.id}-name`}>
                    Certification Name
                  </label>
                  <input
                    type="text"
                    id={`${certification.id}-name`}
                    name="name"
                    value={certification.name || ""}
                    onChange={handleCertChange(certification.id)}
                    placeholder="AWS Certified Cloud Practitioner"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor={`${certification.id}-year`}>
                    Year
                  </label>
                  <input
                    type="text"
                    id={`${certification.id}-year`}
                    name="year"
                    value={certification.year || ""}
                    onChange={handleCertChange(certification.id)}
                    placeholder="2025"
                    className={inputClass}
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className={labelClass} htmlFor={`${certification.id}-issuer`}>
                    Issuing Organisation
                  </label>
                  <input
                    type="text"
                    id={`${certification.id}-issuer`}
                    name="issuer"
                    value={certification.issuer || ""}
                    onChange={handleCertChange(certification.id)}
                    placeholder="Amazon Web Services"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => addEntry(CERT_KEY, createCertification)}
          className="mt-3 w-full rounded-lg border border-dashed border-blue-300 bg-blue-50/50 py-2.5 text-xs font-semibold text-blue-600 transition-colors hover:border-blue-400 hover:bg-blue-50"
        >
          + Add another certification
        </button>
      </div>

      {/* Achievements */}
      <div>
        <h3 className="mb-3 text-sm font-bold text-slate-700">Achievements</h3>

        <div className="space-y-2">
          {achievements.map((achievement, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={achievement || ""}
                onChange={(event) => updateString(ACHIEVEMENT_KEY, index, event.target.value)}
                placeholder={`Achievement ${index + 1}`}
                className={inputClass}
              />

              {achievements.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeString(ACHIEVEMENT_KEY, index)}
                  className="shrink-0 rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-100"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => addString(ACHIEVEMENT_KEY)}
          className="mt-2 text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700"
        >
          + Add another achievement
        </button>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-3 pt-4 mt-6 border-t border-slate-100">
        <button
          type="button"
          onClick={prevStep}
          className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-sm py-2 transition-all active:scale-[0.98]"
        >
          Back
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm py-2 transition-all shadow-sm active:scale-[0.98]"
        >
          Complete Resume
        </button>
      </div>
    </div>
  );
};

export default Extras;
