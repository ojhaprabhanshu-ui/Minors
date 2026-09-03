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

function Row({ label, children }) {
  return (
    <div className="grid grid-cols-[86px_1fr] gap-x-6 border-t border-[#e4e4e7] py-4 break-inside-avoid first:border-t-0 first:pt-0">
      <h2 className="pt-0.5 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[#a1a1aa]">
        {label}
      </h2>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function Lines({ lines }) {
  if (!lines || lines.length === 0) return null;

  return (
    <ul className="mt-1.5 space-y-1 text-[12px] leading-[1.6] text-[#3f3f46]">
      {lines.map((line, index) => (
        <li key={index} className="flex gap-2">
          <span className="mt-[7px] h-[3px] w-[3px] shrink-0 rounded-full bg-[#a1a1aa]" />
          <span>{line}</span>
        </li>
      ))}
    </ul>
  );
}

export default function MinimalTemplate({ data }) {
  const name = buildFullName(data);
  const title = buildJobTitle(data);
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
    <div className="bg-white px-[18mm] py-[16mm] font-sans text-[#27272a]">
      <header className="mb-8">
        <h1 className="text-[30px] font-light leading-tight tracking-[0.01em] text-[#18181b]">
          {name}
        </h1>
        <p className="mt-1.5 text-[11.5px] font-medium uppercase tracking-[0.24em] text-[#71717a]">
          {title}
        </p>

        {contacts.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[11.5px] text-[#52525b]">
            {contacts.map((contact) => (
              <li key={contact.label}>{contact.value}</li>
            ))}
          </ul>
        )}
      </header>

      <div>
        {summary && (
          <Row label="Profile">
            <p className="text-[12px] leading-[1.65] text-[#3f3f46]">{summary}</p>
          </Row>
        )}

        {skills.length > 0 && (
          <Row label="Skills">
            <div className="flex flex-wrap gap-x-2 gap-y-1.5 text-[12px] text-[#3f3f46]">
              {skills.map((skill, index) => (
                <span key={skill}>
                  {skill}
                  {index < skills.length - 1 && <span className="ml-2 text-[#d4d4d8]">/</span>}
                </span>
              ))}
            </div>
          </Row>
        )}

        {experiences.length > 0 && (
          <Row label="Experience">
            {experiences.map((experience) => (
              <div key={experience.id} className="mb-3.5 break-inside-avoid last:mb-0">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <h3 className="text-[13.5px] font-semibold text-[#18181b]">
                    {experience.role || experience.company}
                  </h3>
                  {experience.dateLabel && (
                    <span className="text-[11px] tracking-wide text-[#a1a1aa]">
                      {experience.dateLabel}
                    </span>
                  )}
                </div>
                <MetaLine
                  items={[experience.company, experience.location]}
                  className="text-[12px] text-[#71717a]"
                />
                <Lines lines={experience.lines} />
              </div>
            ))}
          </Row>
        )}

        {projects.length > 0 && (
          <Row label="Projects">
            {projects.map((project) => (
              <div key={project.id} className="mb-3.5 break-inside-avoid last:mb-0">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <h3 className="text-[13.5px] font-semibold text-[#18181b]">
                    {project.title || "Project"}
                  </h3>
                  {project.dateLabel && (
                    <span className="text-[11px] tracking-wide text-[#a1a1aa]">{project.dateLabel}</span>
                  )}
                </div>
                <MetaLine items={[project.type, project.role]} className="text-[12px] text-[#71717a]" />
                {project.technologies.length > 0 && (
                  <p className="mt-0.5 text-[11.5px] text-[#a1a1aa]">
                    {project.technologies.join(" · ")}
                  </p>
                )}
                <Lines lines={project.lines} />
                <ProjectLinks
                  project={project}
                  rowClassName="mt-1"
                  linkClassName="text-[11px] text-[#52525b] underline"
                />
              </div>
            ))}
          </Row>
        )}

        {education && (
          <Row label="Education">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h3 className="text-[13.5px] font-semibold text-[#18181b]">{education.title}</h3>
              {education.year && (
                <span className="text-[11px] tracking-wide text-[#a1a1aa]">{education.year}</span>
              )}
            </div>
            {education.organisation && (
              <p className="text-[12px] text-[#71717a]">{education.organisation}</p>
            )}
            {education.extra.map((line) => (
              <p key={line} className="text-[11.5px] text-[#a1a1aa]">
                {line}
              </p>
            ))}
            <Lines lines={education.lines} />
            {coursework.length > 0 && (
              <p className="mt-1.5 text-[11.5px] leading-[1.6] text-[#a1a1aa]">
                <span className="font-medium text-[#71717a]">Relevant coursework: </span>
                {coursework.join(", ")}
              </p>
            )}
          </Row>
        )}

        {certifications.length > 0 && (
          <Row label="Certificates">
            <Lines
              lines={certifications.map((certification) =>
                [certification.name, certification.issuer, certification.year].filter(Boolean).join(" — ")
              )}
            />
          </Row>
        )}

        {achievements.length > 0 && (
          <Row label="Achievements">
            <Lines lines={achievements} />
          </Row>
        )}
      </div>
    </div>
  );
}
