import React from "react";
import {
  buildAchievements,
  buildCertifications,
  buildContactItems,
  buildCoursework,
  buildEducation,
  buildExperiences,
  buildFullName,
  buildJobTitle,
  buildProjects,
  buildSkills,
  buildSummary,
} from "./resumeData";
import { ChipRow, MetaLine, ProjectLinks } from "./ResumeBits";

function Section({ title, children }) {
  return (
    <section className="mb-7 break-inside-avoid last:mb-0">
      <h2 className="mb-3 border-b-2 border-[#1d4ed8] pb-1 text-[12.5px] font-bold uppercase tracking-[0.14em] text-[#1d4ed8]">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Bullets({ lines }) {
  if (!lines || lines.length === 0) return null;

  return (
    <ul className="mt-2 list-disc space-y-1 pl-4 text-[12px] leading-[1.55] text-[#374151]">
      {lines.map((line, index) => (
        <li key={index}>{line}</li>
      ))}
    </ul>
  );
}

export default function ModernTemplate({ data }) {
  const name = buildFullName(data);
  const title = buildJobTitle(data);
  const contacts = buildContactItems(data);
  const summary = buildSummary(data);
  const experiences = buildExperiences(data);
  const projects = buildProjects(data);
  const skills = buildSkills(data);
  const education = buildEducation(data);
  const coursework = buildCoursework(data);
  const certifications = buildCertifications(data);
  const achievements = buildAchievements(data);

  return (
    <div className="bg-white font-sans text-[#1f2937]">
      <header className="bg-[#1d4ed8] px-[16mm] py-[12mm] text-white">
        <h1 className="text-[32px] font-bold leading-tight tracking-tight">{name}</h1>
        <p className="mt-1 text-[14.5px] font-medium text-blue-100">{title}</p>

        {contacts.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-1.5 text-[11.5px] text-blue-50">
            {contacts.map((contact) => (
              <li key={contact.label} className="flex items-baseline gap-1.5">
                <span className="font-semibold uppercase tracking-[0.08em] text-blue-200">
                  {contact.label}
                </span>
                <span>{contact.value}</span>
              </li>
            ))}
          </ul>
        )}
      </header>

      <div className="px-[16mm] py-[11mm]">
        {summary && (
          <Section title="Summary">
            <p className="text-[12px] leading-[1.6] text-[#374151]">{summary}</p>
          </Section>
        )}

        {experiences.length > 0 && (
          <Section title="Work Experience">
            {experiences.map((experience) => (
              <div key={experience.id} className="mb-4 break-inside-avoid last:mb-0">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <h3 className="text-[14px] font-bold text-[#111827]">
                    {experience.role || experience.company}
                  </h3>
                  {experience.dateLabel && (
                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-[#1d4ed8]">
                      {experience.dateLabel}
                    </span>
                  )}
                </div>
                <MetaLine
                  items={[experience.company, experience.location]}
                  className="mt-0.5 text-[12.5px] font-medium text-[#4b5563]"
                />
                <Bullets lines={experience.lines} />
              </div>
            ))}
          </Section>
        )}

        {projects.length > 0 && (
          <Section title="Projects">
            {projects.map((project) => (
              <div key={project.id} className="mb-4 break-inside-avoid last:mb-0">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <h3 className="text-[14px] font-bold text-[#111827]">{project.title || "Project"}</h3>
                  {project.dateLabel && (
                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-[#1d4ed8]">
                      {project.dateLabel}
                    </span>
                  )}
                </div>
                <MetaLine
                  items={[project.type, project.role]}
                  className="mt-0.5 text-[12.5px] font-medium text-[#4b5563]"
                />
                <ChipRow
                  items={project.technologies}
                  rowClassName="mt-1.5"
                  chipClassName="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                />
                <Bullets lines={project.lines} />
                <ProjectLinks
                  project={project}
                  rowClassName="mt-1.5"
                  linkClassName="text-[11px] font-medium text-[#1d4ed8] underline"
                />
              </div>
            ))}
          </Section>
        )}

        {skills.length > 0 && (
          <Section title="Skills">
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11.5px] font-medium text-[#1e40af]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </Section>
        )}

        {education && (
          <Section title="Education">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h3 className="text-[14px] font-bold text-[#111827]">{education.title}</h3>
              {education.year && (
                <span className="text-[11.5px] font-semibold text-[#6b7280]">{education.year}</span>
              )}
            </div>
            {education.organisation && (
              <p className="mt-0.5 text-[12.5px] font-medium text-[#4b5563]">
                {education.organisation}
              </p>
            )}
            {education.extra.map((line) => (
              <p key={line} className="mt-0.5 text-[12px] text-[#6b7280]">
                {line}
              </p>
            ))}
            <Bullets lines={education.lines} />
            {coursework.length > 0 && (
              <p className="mt-2 text-[11.5px] leading-[1.55] text-[#4b5563]">
                <span className="font-semibold text-[#374151]">Relevant coursework: </span>
                {coursework.join(", ")}
              </p>
            )}
          </Section>
        )}

        {certifications.length > 0 && (
          <Section title="Certifications">
            <Bullets
              lines={certifications.map((certification) =>
                [certification.name, certification.issuer, certification.year].filter(Boolean).join(" — ")
              )}
            />
          </Section>
        )}

        {achievements.length > 0 && (
          <Section title="Achievements">
            <Bullets lines={achievements} />
          </Section>
        )}
      </div>
    </div>
  );
}
