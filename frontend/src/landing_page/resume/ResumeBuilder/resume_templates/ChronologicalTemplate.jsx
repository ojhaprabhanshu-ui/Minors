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
import { Bullets, ChipRow, MetaLine, ProjectLinks } from "./ResumeBits";

const ACCENT = "#1d6bf3";

function Section({ title, children }) {
  return (
    <section className="mb-5 break-inside-avoid last:mb-0">
      <h2
        className="mb-2.5 border-b border-slate-200 pb-1 text-[11.5px] font-bold uppercase tracking-[0.16em]"
        style={{ color: ACCENT }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function Entry({ when, children }) {
  return (
    <div className="mb-3.5 grid grid-cols-[100px_1fr] gap-x-4 break-inside-avoid last:mb-0">
      <p className="pt-[3px] text-[10.5px] leading-[1.5] text-slate-500">{when}</p>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export default function ChronologicalTemplate({ data }) {
  const name = buildFullName(data);
  const headline = buildJobTitle(data);
  const contacts = buildContactItems(data);
  const summary = buildSummary(data);
  const experiences = buildExperiences(data);
  const projects = buildProjects(data);
  const education = buildEducation(data);
  const skills = buildSkills(data);
  const coursework = buildCoursework(data);
  const certifications = buildCertifications(data);
  const achievements = buildAchievements(data);

  return (
    <div className="bg-white px-[16mm] py-[13mm] font-sans text-[#1f2937]">
      <header className="mb-5">
        <h1 className="text-[29px] font-bold leading-tight tracking-tight text-slate-900">{name}</h1>
        <p className="mt-0.5 text-[13.5px] font-semibold" style={{ color: ACCENT }}>
          {headline}
        </p>

        {contacts.length > 0 && (
          <p className="mt-2 text-[11px] leading-[1.6] text-slate-600">
            {contacts.map((contact) => contact.value).join("   |   ")}
          </p>
        )}

        <div className="mt-3 h-[3px] w-full" style={{ backgroundColor: ACCENT }} />
      </header>

      {summary && (
        <Section title="Summary">
          <p className="text-[12px] leading-[1.6] text-slate-700">{summary}</p>
        </Section>
      )}

      {experiences.length > 0 && (
        <Section title="Work Experience">
          {experiences.map((experience) => (
            <Entry key={experience.id} when={experience.dateLabel}>
              <h3 className="text-[13px] font-bold text-slate-900">
                {experience.role || experience.company}
              </h3>
              <MetaLine
                items={[experience.company, experience.location]}
                className="text-[11.5px] text-slate-600"
              />
              <Bullets
                lines={experience.lines}
                listClassName="mt-1.5 list-disc space-y-1 pl-4 text-[11.5px] leading-[1.55] text-slate-700"
              />
            </Entry>
          ))}
        </Section>
      )}

      {projects.length > 0 && (
        <Section title="Projects">
          {projects.map((project) => (
            <Entry key={project.id} when={project.dateLabel}>
              <h3 className="text-[13px] font-bold text-slate-900">
                {project.title || "Project"}
              </h3>
              <MetaLine
                items={[project.type, project.role]}
                className="text-[11.5px] text-slate-600"
              />
              <ChipRow
                items={project.technologies}
                rowClassName="mt-1.5"
                chipClassName="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-600"
              />
              <Bullets
                lines={project.lines}
                listClassName="mt-1.5 list-disc space-y-1 pl-4 text-[11.5px] leading-[1.55] text-slate-700"
              />
              <ProjectLinks
                project={project}
                rowClassName="mt-1.5"
                linkClassName="text-[10.5px] underline"
              />
            </Entry>
          ))}
        </Section>
      )}

      {education && (
        <Section title="Education">
          <Entry when={education.year}>
            <h3 className="text-[13px] font-bold text-slate-900">{education.title}</h3>
            <MetaLine
              items={[education.organisation, ...education.extra]}
              className="text-[11.5px] text-slate-600"
            />
            <Bullets
              lines={education.lines}
              listClassName="mt-1.5 list-disc space-y-1 pl-4 text-[11.5px] leading-[1.55] text-slate-700"
            />
            {coursework.length > 0 && (
              <p className="mt-1.5 text-[11px] leading-[1.55] text-slate-600">
                <span className="font-semibold text-slate-700">Relevant coursework: </span>
                {coursework.join(", ")}
              </p>
            )}
          </Entry>
        </Section>
      )}

      {skills.length > 0 && (
        <Section title="Skills">
          <ChipRow
            items={skills}
            chipClassName="rounded px-2 py-[3px] text-[11px] font-medium text-white"
            chipStyle={{ backgroundColor: ACCENT }}
            rowClassName="gap-1.5"
          />
        </Section>
      )}

      {certifications.length > 0 && (
        <Section title="Certifications">
          {certifications.map((certification) => (
            <div key={certification.id} className="mb-1 break-inside-avoid last:mb-0">
              <MetaLine
                items={[certification.name, certification.issuer, certification.year]}
                separator="—"
                className="text-[11.5px] text-slate-700"
              />
            </div>
          ))}
        </Section>
      )}

      {achievements.length > 0 && (
        <Section title="Achievements">
          <Bullets
            lines={achievements}
            listClassName="list-disc space-y-1 pl-4 text-[11.5px] leading-[1.55] text-slate-700"
          />
        </Section>
      )}
    </div>
  );
}
