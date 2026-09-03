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

function Section({ title, children }) {
  return (
    <section className="mb-6 break-inside-avoid last:mb-0">
      <h2 className="mb-2 border-b border-[#9ca3af] pb-1 text-[12.5px] font-bold uppercase tracking-[0.12em] text-[#111827]">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Lines({ lines, className = "" }) {
  if (!lines || lines.length === 0) return null;

  return (
    <ul className={`mt-1.5 list-disc space-y-1 pl-5 text-[12px] leading-[1.6] text-[#1f2937] ${className}`}>
      {lines.map((line, index) => (
        <li key={index}>{line}</li>
      ))}
    </ul>
  );
}

export default function ProfessionalTemplate({ data }) {
  const name = buildFullName(data);
  const title = buildJobTitle(data);
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
    <div className="bg-white px-[18mm] py-[14mm] font-serif text-[#111827]">
      <header className="text-center">
        <h1 className="text-[28px] font-bold uppercase leading-tight tracking-[0.14em]">{name}</h1>
        <p className="mt-1.5 text-[13px] tracking-[0.04em] text-[#374151]">{title}</p>

        {contacts.length > 0 && (
          <p className="mt-2.5 text-[11.5px] leading-[1.6] text-[#4b5563]">
            {contacts.map((contact) => contact.value).join("  |  ")}
          </p>
        )}
      </header>

      <hr className="mt-4 border-t-2 border-[#111827]" />

      <div className="mt-5">
        {summary && (
          <Section title="Summary">
            <p className="text-[12px] leading-[1.65] text-[#1f2937]">{summary}</p>
          </Section>
        )}

        {experiences.length > 0 && (
          <Section title="Work Experience">
            {experiences.map((experience) => (
              <div key={experience.id} className="mb-3.5 break-inside-avoid last:mb-0">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <h3 className="text-[13.5px] font-bold">{experience.role || experience.company}</h3>
                  {experience.dateLabel && (
                    <span className="text-[11.5px] italic text-[#4b5563]">{experience.dateLabel}</span>
                  )}
                </div>
                <MetaLine
                  items={[experience.company, experience.location]}
                  className="text-[12.5px] italic text-[#374151]"
                />
                <Lines lines={experience.lines} />
              </div>
            ))}
          </Section>
        )}

        {projects.length > 0 && (
          <Section title="Projects">
            {projects.map((project) => (
              <div key={project.id} className="mb-3.5 break-inside-avoid last:mb-0">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <h3 className="text-[13.5px] font-bold">{project.title || "Project"}</h3>
                  {project.dateLabel && (
                    <span className="text-[11.5px] italic text-[#4b5563]">{project.dateLabel}</span>
                  )}
                </div>
                <MetaLine
                  items={[project.type, project.role]}
                  className="text-[12.5px] italic text-[#374151]"
                />
                {project.technologies.length > 0 && (
                  <p className="mt-0.5 text-[12px] text-[#4b5563]">
                    <span className="font-semibold text-[#374151]">Technologies: </span>
                    {project.technologies.join(", ")}
                  </p>
                )}
                <Lines lines={project.lines} />
                <ProjectLinks
                  project={project}
                  rowClassName="mt-1"
                  linkClassName="text-[11.5px] underline"
                />
              </div>
            ))}
          </Section>
        )}

        {education && (
          <Section title="Education">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h3 className="text-[13.5px] font-bold">{education.title}</h3>
              {education.year && (
                <span className="text-[11.5px] italic text-[#4b5563]">{education.year}</span>
              )}
            </div>
            {education.organisation && (
              <p className="text-[12.5px] italic text-[#374151]">{education.organisation}</p>
            )}
            {education.extra.map((line) => (
              <p key={line} className="text-[12px] text-[#4b5563]">
                {line}
              </p>
            ))}
            <Lines lines={education.lines} />
            {coursework.length > 0 && (
              <p className="mt-1.5 text-[12px] leading-[1.6] text-[#4b5563]">
                <span className="font-semibold text-[#374151]">Relevant coursework: </span>
                {coursework.join(", ")}
              </p>
            )}
          </Section>
        )}

        {skills.length > 0 && (
          <Section title="Skills">
            <p className="text-[12px] leading-[1.7] text-[#1f2937]">{skills.join(" • ")}</p>
          </Section>
        )}

        {certifications.length > 0 && (
          <Section title="Certifications">
            <Lines
              lines={certifications.map((certification) =>
                [certification.name, certification.issuer, certification.year].filter(Boolean).join(" — ")
              )}
            />
          </Section>
        )}

        {achievements.length > 0 && (
          <Section title="Achievements">
            <Lines lines={achievements} />
          </Section>
        )}
      </div>
    </div>
  );
}
