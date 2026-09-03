import React from "react";
import { RESUME_TEMPLATES, TEMPLATE_GROUPS } from "./templates";
import ResumeDocument from "./ResumeDocument";

const THUMBNAIL_SCALE = 0.22;
const PAGE_WIDTH = 794;

function Thumbnail({ template, data }) {
  return (
    <div className="relative h-[178px] w-full overflow-hidden border-b border-slate-100 bg-slate-50">
      <div
        className="absolute top-0"
        style={{
          left: "50%",
          marginLeft: `-${PAGE_WIDTH / 2}px`,
          width: `${PAGE_WIDTH}px`,
          transform: `scale(${THUMBNAIL_SCALE})`,
          transformOrigin: "top center",
        }}
      >
        <ResumeDocument templateId={template.id} data={data} thumbnail />
      </div>
    </div>
  );
}

export default function TemplatePicker({ data, selectedId, onSelect }) {
  return (
    <div className="space-y-6">
      {TEMPLATE_GROUPS.map((group) => {
        const templates = RESUME_TEMPLATES.filter((template) => template.group === group.id);
        if (templates.length === 0) return null;

        return (
          <div key={group.id}>
            <div className="mb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-700">
                {group.label}
              </h3>
              <p className="text-xs text-slate-500">{group.hint}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => {
                const isSelected = template.id === selectedId;

                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => onSelect(template.id)}
                    aria-pressed={isSelected}
                    className={`group relative flex flex-col overflow-hidden rounded-xl border bg-white text-left transition-all duration-200 ${
                      isSelected
                        ? "border-blue-600 shadow-[0_8px_24px_rgba(37,99,235,0.18)] ring-2 ring-blue-600/20"
                        : "border-slate-200 hover:border-blue-300 hover:shadow-md"
                    }`}
                  >
                    <Thumbnail template={template} data={data} />

                    {isSelected && (
                      <span className="absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[12px] font-bold text-white shadow">
                        ✓
                      </span>
                    )}

                    <div className="flex items-start justify-between gap-3 p-3.5">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900">{template.name}</p>
                        <p className="mt-0.5 text-xs leading-snug text-slate-500">{template.tagline}</p>
                      </div>
                      <span
                        className="mt-1 h-3.5 w-3.5 shrink-0 rounded-full"
                        style={{ backgroundColor: template.accent }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
