import React from "react";
import { getTemplate } from "./templates";

const PAGE_HEIGHT = "min-h-[1122px]";

export default function ResumeDocument({ templateId, data, thumbnail = false }) {
  const { Component } = getTemplate(templateId);

  if (thumbnail) {
    return (
      <div className={`resume-page w-[794px] overflow-hidden bg-white ${PAGE_HEIGHT}`}>
        <Component data={data} />
      </div>
    );
  }

  return (
    <div
      className={`resume-page mx-auto w-full max-w-[794px] overflow-hidden bg-white shadow-[0_10px_40px_rgba(15,23,42,0.14)] ${PAGE_HEIGHT}`}
    >
      <Component data={data} />
    </div>
  );
}
