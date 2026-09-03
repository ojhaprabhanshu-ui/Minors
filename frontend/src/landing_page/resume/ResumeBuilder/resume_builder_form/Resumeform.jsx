import React from "react";
import { useState } from "react";
import Personaldetails from "./Personaldetails";
import Education from "./Education";
import Experience from "./Experience";
import Projects from "./Projects";
import Extras from "./Extras";
import { useResume } from "../ResumeContext";

const STEPS = [
  { label: "Personal", hint: "Required" },
  { label: "Education", hint: "Required" },
  { label: "Experience", hint: "Optional" },
  { label: "Projects", hint: "Optional" },
  { label: "Extras", hint: "Optional" },
];

const Resumeform = () => {
  const [step, setStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1);
  const {
    formData,
    setFormData,
    setIsComplete,
    addEntry,
    updateEntry,
    removeEntry,
    addString,
    updateString,
    removeString,
  } = useResume();

  const goToStep = (target) => {
    const next = Math.min(Math.max(target, 1), STEPS.length);
    setStep(next);
    setMaxStep((prev) => Math.max(prev, next));
  };

  const nextStep = () => goToStep(step + 1);
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = () => {
    setIsComplete(true);
  };

  return (
    <div className="mx-auto w-full max-w-2xl rounded-xl border border-gray-100 bg-white p-6 shadow-md">
      {/* Progress Bar Header */}
      <div className="mb-6 border-b pb-4">
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          {STEPS.map((item, index) => {
            const position = index + 1;
            const isActive = step === position;
            const isDone = step > position;
            const isLocked = position > maxStep;

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => goToStep(position)}
                disabled={isLocked}
                title={isLocked ? "Complete the earlier steps first" : item.hint}
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors sm:text-xs ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : isDone
                      ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                      : "bg-gray-50 text-gray-400"
                } ${isLocked ? "cursor-not-allowed opacity-60" : ""}`}
              >
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] ${
                    isActive ? "bg-white/25" : isDone ? "bg-blue-600 text-white" : "bg-gray-200"
                  }`}
                >
                  {isDone ? "✓" : position}
                </span>
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-1.5 rounded-full bg-blue-600 transition-all duration-300"
            style={{ width: `${(step / STEPS.length) * 100}%` }}
          />
        </div>

        <p className="mt-2 text-[11px] text-gray-500">
          Step {step} of {STEPS.length} · {STEPS[step - 1].hint}
          {STEPS[step - 1].hint === "Optional" && " — skip it if it does not apply to you"}
        </p>
      </div>

      {/* Render Steps Dynamically */}
      {step === 1 && (
        <Personaldetails formData={formData} setFormData={setFormData} nextStep={nextStep} />
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
          nextStep={nextStep}
          prevStep={prevStep}
          addEntry={addEntry}
          updateEntry={updateEntry}
          removeEntry={removeEntry}
        />
      )}
      {step === 4 && (
        <Projects
          formData={formData}
          nextStep={nextStep}
          prevStep={prevStep}
          addEntry={addEntry}
          updateEntry={updateEntry}
          removeEntry={removeEntry}
        />
      )}
      {step === 5 && (
        <Extras
          formData={formData}
          prevStep={prevStep}
          handleSubmit={handleSubmit}
          addEntry={addEntry}
          updateEntry={updateEntry}
          removeEntry={removeEntry}
          addString={addString}
          updateString={updateString}
          removeString={removeString}
        />
      )}
    </div>
  );
};

export default Resumeform;
