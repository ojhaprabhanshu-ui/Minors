import React, { useEffect, useState } from "react";
import Resumeform from "./resume_builder_form/Resumeform";
import TemplatePicker from "./resume_templates/TemplatePicker";
import ResumeDocument from "./resume_templates/ResumeDocument";
import { getTemplate } from "./resume_templates/templates";
import { buildFullName } from "./resume_templates/resumeData";
import { useResume } from "./ResumeContext";
import "./ResumeBuilder.css";

const PRINT_MODE_CLASS = "resume-print-mode";
const PAGE_RULE = "@page { size: A4; margin: 0; }";

export default function ResumeWorkspace() {
  const { formData, templateId, setTemplateId, isComplete } = useResume();
  const [isPickerOpen, setPickerOpen] = useState(true);

  useEffect(() => {
    const pageStyle = document.createElement("style");
    pageStyle.setAttribute("data-resume-print", "");
    pageStyle.textContent = PAGE_RULE;

    document.body.classList.add(PRINT_MODE_CLASS);
    document.head.appendChild(pageStyle);

    return () => {
      document.body.classList.remove(PRINT_MODE_CLASS);
      pageStyle.remove();
    };
  }, []);

  const activeTemplate = getTemplate(templateId);
  const fullName = buildFullName(formData);
  const isPlaceholderName = fullName === "Your Name";

  const handleDownload = () => {
    const previousTitle = document.title;
    const fileBase = isPlaceholderName ? "Resume" : fullName.replace(/\s+/g, "_");

    const restoreTitle = () => {
      document.title = previousTitle;
      window.removeEventListener("afterprint", restoreTitle);
    };

    document.title = `${fileBase}_Resume`;
    window.addEventListener("afterprint", restoreTitle);
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Toolbar */}
      <div className="print-hide sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold text-slate-900">Resume Builder</h1>
            <p className="truncate text-xs text-slate-500">
              Template: <span className="font-semibold text-slate-700">{activeTemplate.name}</span>{" "}
              · preview updates as you type
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPickerOpen((open) => !open)}
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-blue-400 hover:text-blue-600"
            >
              {isPickerOpen ? "Hide templates" : "Change template"}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="rounded-full bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              Download PDF <span className="ml-1">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Template selection */}
      {isPickerOpen && (
        <div className="print-hide border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-[1500px] px-4 py-5">
            <div className="mb-3.5">
              <h2 className="text-sm font-bold text-slate-900">Choose a template</h2>
              <p className="text-xs text-slate-500">
                Each design is rendered live with your own details.
              </p>
            </div>

            <TemplatePicker
              data={formData}
              selectedId={templateId}
              onSelect={(id) => setTemplateId(id)}
            />
          </div>
        </div>
      )}

      {/* Completion banner */}
      {isComplete && (
        <div className="print-hide border-b border-emerald-200 bg-emerald-50">
          <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3 px-4 py-3">
            <p className="text-xs font-semibold text-emerald-800">
              <span className="mr-1.5">✓</span>
              Your resume is ready. Keep editing on the left — the preview stays in sync.
            </p>
            <button
              type="button"
              onClick={handleDownload}
              className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              Download PDF
            </button>
          </div>
        </div>
      )}

      {/* Form + live preview */}
      <div className="mx-auto grid max-w-[1500px] grid-cols-1 items-start gap-6 px-4 py-6 lg:grid-cols-2">
        <div className="print-hide min-w-0">
          <Resumeform />
        </div>

        <div className="preview-scroll min-w-0 lg:sticky lg:top-[70px] lg:max-h-[calc(100vh-92px)] lg:overflow-y-auto lg:pr-1">
          <p className="print-hide mb-2.5 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
            Live preview
          </p>

          <ResumeDocument templateId={templateId} data={formData} />

          <div className="print-hide mx-auto mt-4 max-w-[794px] pb-10 text-center">
            <button
              type="button"
              onClick={handleDownload}
              className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-slate-800"
            >
              Download / Print resume
            </button>
            <p className="mt-2 text-xs text-slate-500">
              Choose “Save as PDF” in the print dialog for a vector-text, ATS-readable file.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
