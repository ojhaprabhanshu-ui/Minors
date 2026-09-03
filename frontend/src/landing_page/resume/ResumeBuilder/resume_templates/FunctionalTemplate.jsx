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
import { Bullets, MetaLine, ProjectLinks } from "./ResumeBits";

const ACCENT = "#d97706";

function Section({ title, children }) {
  return (
    <section className="mb-5 break-inside-avoid last:mb-0">
      <h2 className="mb-2 flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-[0.16em] text-slate-900">
        <span className="inline-block h-[10px] w-[10px] rounded-sm" style={{ backgroundColor: ACCENT }} />
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function FunctionalTemplate({ data }) {
  const name = buildFullName(data);
  const headline = buildJobTitle(data);
  const contacts = buildContactItems(data);
  const summary = buildSummary(data);
  const skills = buildSkills(data);
  const experiences = buildExperiences(data);
  const projects = buildProjects(data);
  const education = buildEducation(data);
  const coursework = buildCoursework(data);
  const certifications = buildCertifications(data);
  const achievements = buildAchievements(data);

  return (
    <div className="bg-white font-sans text-[#1f2937]">
      <header
        className="border-l-[6px] px-[16mm] py-[11mm]"
        style={{ borderColor: ACCENT, backgroundColor: "#fffbf3" }}
      >
        <h1 className="text-[28px] font-bold leading-tight tracking-tight text-slate-900">{name}</h1>
        <p className="mt-0.5 text-[13px] font-semibold uppercase tracking-[0.1em]" style={{ color: ACCENT }}>
          {headline}
        </p>

        {contacts.length > 0 && (
          <ul className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-slate-600">
            {contacts.map((contact) => (
              <li key={contact.label}>
                <span className="font-semibold text-slate-500">{contact.label}: </span>
                {contact.value}
              </li>
            ))}
          </ul>
        )}
      </header>

      <div className="px-[16mm] py-[10mm]">
        {summary && (
          <Section title="Profile">
            <p className="text-[12px] leading-[1.6] text-slate-700">{summary}</p>
          </Section>
        )}

        {skills.length > 0 && (
          <Section title="Core Skills">
            <div className="rounded-md border border-amber-200 bg-amber-50/50 p-3">
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-amber-200 bg-white px-2.5 py-1 text-[11px] font-medium text-amber-900"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </Section>
        )}

        {experiences.length > 0 && (
          <Section title="Professional Background">
            {experiences.map((experience) => (
              <div key={experience.id} className="mb-3 break-inside-avoid last:mb-0">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <h3 className="text-[12.5px] font-bold text-slate-900">
                    {experience.role || experience.company}
                  </h3>
                  {experience.dateLabel && (
                    <span className="text-[10.5px] text-slate-500">{experience.dateLabel}</span>
                  )}
                </div>
                <MetaLine
                  items={[experience.company, experience.location]}
                  className="text-[11px] text-slate-600"
                />
                <Bullets
                  lines={experience.lines}
                  listClassName="mt-1 list-disc space-y-0.5 pl-4 text-[11.5px] leading-[1.55] text-slate-700"
                />
              </div>
            ))}
          </Section>
        )}

        {projects.length > 0 && (
          <Section title="Projects">
            {projects.map((project) => (
              <div key={project.id} className="mb-3 break-inside-avoid last:mb-0">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <h3 className="text-[12.5px] font-bold text-slate-900">{project.title || "Project"}</h3>
                  {project.dateLabel && (
                    <span className="text-[10.5px] text-slate-500">{project.dateLabel}</span>
                  )}
                </div>
                <MetaLine items={[project.type, project.role]} className="text-[11px] text-slate-600" />
                {project.technologies.length > 0 && (
                  <p className="mt-1 text-[11px] text-slate-600">
                    <span className="font-semibold text-slate-700">Technologies: </span>
                    {project.technologies.join(", ")}
                  </p>
                )}
                <Bullets
                  lines={project.lines}
                  listClassName="mt-1 list-disc space-y-0.5 pl-4 text-[11.5px] leading-[1.55] text-slate-700"
                />
                <ProjectLinks
                  project={project}
                  rowClassName="mt-1"
                  linkClassName="text-[10.5px] underline"
                />
              </div>
            ))}
          </Section>
        )}

        {education && (
          <Section title="Education">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h3 className="text-[12.5px] font-bold text-slate-900">{education.title}</h3>
              {education.year && <span className="text-[10.5px] text-slate-500">{education.year}</span>}
            </div>
            <MetaLine
              items={[education.organisation, ...education.extra]}
              className="text-[11px] text-slate-600"
            />
            <Bullets
              lines={education.lines}
              listClassName="mt-1 list-disc space-y-0.5 pl-4 text-[11.5px] leading-[1.55] text-slate-700"
            />
            {coursework.length > 0 && (
              <p className="mt-1 text-[11px] leading-[1.55] text-slate-600">
                <span className="font-semibold text-slate-700">Relevant coursework: </span>
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
              listClassName="list-disc space-y-0.5 pl-4 text-[11.5px] leading-[1.55] text-slate-700"
            />
          </Section>
        )}

        {achievements.length > 0 && (
          <Section title="Achievements">
            <Bullets
              lines={achievements}
              listClassName="list-disc space-y-0.5 pl-4 text-[11.5px] leading-[1.55] text-slate-700"
            />
          </Section>
        )}
      </div>
    </div>
  );
}
