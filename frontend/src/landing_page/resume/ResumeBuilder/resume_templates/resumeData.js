const text = (value) => {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value).trim();
  return "";
};

const unique = (values) =>
  values.filter((value, index) => Boolean(value) && values.indexOf(value) === index);

const keyOf = (entry, index, prefix) => text(entry?.id) || `${prefix}-${index}`;

/* ------------------------------------------------------------------ *
 * Identity & contact
 * ------------------------------------------------------------------ */

export const buildFullName = (data = {}) => {
  const parts = [data.firstname, data.middlename, data.lastname].map(text).filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : "Your Name";
};

export const formatDate = (value) => {
  const raw = text(value);
  if (!raw) return "";

  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (!iso) return raw;

  const date = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  if (Number.isNaN(date.getTime())) return raw;

  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

export const formatMonth = (value) => {
  const raw = text(value);
  if (!raw) return "";

  const iso = /^(\d{4})-(\d{2})$/.exec(raw);
  if (!iso) return raw;

  const date = new Date(Number(iso[1]), Number(iso[2]) - 1, 1);
  if (Number.isNaN(date.getTime())) return raw;

  return date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
};

export const buildContactItems = (data = {}) => {
  const items = [];

  const email = text(data.email);
  if (email) items.push({ label: "Email", value: email });

  const phone = text(data.phone);
  if (phone) items.push({ label: "Phone", value: phone });

  const address = text(data.address);
  if (address) items.push({ label: "Location", value: address });

  const dob = formatDate(data.dateofbirth);
  if (dob) items.push({ label: "Date of Birth", value: dob });

  return items;
};

/* ------------------------------------------------------------------ *
 * Text helpers
 * ------------------------------------------------------------------ */

export const toLines = (value) =>
  text(value)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

export const splitList = (value) =>
  unique(
    text(value)
      .split(/[,\n]/)
      .map((item) => item.trim())
      .filter(Boolean)
  );

/**
 * Only http(s) is allowed through. A resume link is rendered into an href, so
 * anything else (javascript:, data:, ...) is dropped rather than trusted.
 */
export const safeUrl = (value) => {
  const raw = text(value);
  if (!raw) return "";

  if (/^https?:\/\//i.test(raw)) return raw;
  if (/^[\w-]+(\.[\w-]+)+(\/\S*)?$/i.test(raw)) return `https://${raw}`;

  return "";
};

export const displayUrl = (value) => text(value).replace(/^https?:\/\//i, "").replace(/\/$/, "");

export const buildDateRange = (entry = {}) => {
  const start = formatMonth(entry.startDate);
  const end = entry.isPresent ? "Present" : formatMonth(entry.endDate);

  if (start && end) return `${start} — ${end}`;
  return start || end || "";
};

/* ------------------------------------------------------------------ *
 * Sections — every builder returns [] or "" when there is nothing to show,
 * so a template can hide a section with a single length/truthiness check.
 * ------------------------------------------------------------------ */

export const buildSummary = (data = {}) => text(data.summary);

export const buildSkills = (data = {}) =>
  unique(Array.isArray(data.skills) ? data.skills.map(text) : []);

export const buildCoursework = (data = {}) => splitList(data.coursework);

export const buildAchievements = (data = {}) =>
  unique(Array.isArray(data.achievements) ? data.achievements.map(text) : []);

export const buildEducation = (data = {}) => {
  const course = text(data.course);
  const school = text(data.school);
  const college = text(data.college);
  const year = text(data.yearofgraduation);
  const lines = toLines(data.educationDescription);

  if (!course && !school && !college && !year && lines.length === 0) return null;

  const title = course || school || college;
  const organisation = [college, school].find((value) => value && value !== title) || "";
  const extra = unique([school, college].filter((value) => value && value !== title && value !== organisation));

  return { title, organisation, extra, year, lines };
};

export const buildExperiences = (data = {}) => {
  const list = Array.isArray(data.experiences) ? data.experiences : [];

  return list
    .map((entry, index) => ({
      id: keyOf(entry, index, "exp"),
      role: text(entry?.jobTitle),
      company: text(entry?.company),
      location: text(entry?.location),
      dateLabel: buildDateRange(entry || {}),
      lines: toLines(entry?.responsibilities),
    }))
    .filter((entry) => entry.role || entry.company || entry.location || entry.dateLabel || entry.lines.length > 0);
};

export const buildProjects = (data = {}) => {
  const list = Array.isArray(data.projects) ? data.projects : [];

  return list
    .map((entry, index) => ({
      id: keyOf(entry, index, "proj"),
      title: text(entry?.title),
      type: text(entry?.projectType),
      role: text(entry?.role),
      technologies: splitList(entry?.technologies),
      dateLabel: buildDateRange(entry || {}),
      lines: toLines(entry?.description),
      github: safeUrl(entry?.githubLink),
      live: safeUrl(entry?.liveLink),
    }))
    .filter(
      (project) =>
        project.title ||
        project.role ||
        project.dateLabel ||
        project.technologies.length > 0 ||
        project.lines.length > 0 ||
        project.github ||
        project.live
    );
};

export const buildCertifications = (data = {}) => {
  const list = Array.isArray(data.certifications) ? data.certifications : [];

  return list
    .map((entry, index) => ({
      id: keyOf(entry, index, "cert"),
      name: text(entry?.name),
      issuer: text(entry?.issuer),
      year: text(entry?.year),
    }))
    .filter((certification) => certification.name || certification.issuer);
};

/** Headline under the name: the most recent role the user gave us. */
export const buildJobTitle = (data = {}) => {
  const [firstExperience] = buildExperiences(data);
  return firstExperience?.role || "Professional Title";
};
