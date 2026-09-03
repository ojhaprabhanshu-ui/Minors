import React, { createContext, useContext, useMemo, useState } from "react";

let entryCounter = 0;
const nextId = (prefix) => `${prefix}-${(entryCounter += 1)}`;

export const createExperience = () => ({
  id: nextId("exp"),
  jobTitle: "",
  company: "",
  location: "",
  startDate: "",
  endDate: "",
  isPresent: false,
  responsibilities: "",
});

export const createProject = () => ({
  id: nextId("proj"),
  title: "",
  projectType: "",
  role: "",
  technologies: "",
  description: "",
  startDate: "",
  endDate: "",
  githubLink: "",
  liveLink: "",
});

export const createCertification = () => ({
  id: nextId("cert"),
  name: "",
  issuer: "",
  year: "",
});

export const PROJECT_TYPES = [
  "College project",
  "Academic project",
  "Personal project",
  "Hackathon project",
  "Professional project",
];

export const EMPTY_RESUME = {
  // Step 1 — personal
  firstname: "",
  middlename: "",
  lastname: "",
  email: "",
  phone: "",
  dateofbirth: "",
  address: "",
  summary: "",

  // Step 2 — education
  school: "",
  course: "",
  college: "",
  yearofgraduation: "",
  educationDescription: "",
  coursework: "",
  skills: [""],

  // Step 3 — experience (optional, repeatable)
  experiences: [createExperience()],

  // Step 4 — projects (optional, repeatable)
  projects: [createProject()],

  // Step 5 — extras (optional)
  certifications: [createCertification()],
  achievements: [""],
};

const ResumeContext = createContext(null);

export function ResumeProvider({ children }) {
  const [formData, setFormData] = useState(EMPTY_RESUME);
  const [templateId, setTemplateId] = useState("chronological");
  const [isComplete, setIsComplete] = useState(false);

  const helpers = useMemo(
    () => ({
      // Repeatable object lists: experiences, projects, certifications
      addEntry: (listKey, factory) =>
        setFormData((prev) => ({
          ...prev,
          [listKey]: [...(Array.isArray(prev[listKey]) ? prev[listKey] : []), factory()],
        })),

      updateEntry: (listKey, id, patch) =>
        setFormData((prev) => ({
          ...prev,
          [listKey]: (Array.isArray(prev[listKey]) ? prev[listKey] : []).map((entry) =>
            entry.id === id ? { ...entry, ...patch } : entry
          ),
        })),

      removeEntry: (listKey, id) =>
        setFormData((prev) => ({
          ...prev,
          [listKey]: (Array.isArray(prev[listKey]) ? prev[listKey] : []).filter(
            (entry) => entry.id !== id
          ),
        })),

      // Plain string lists: skills, achievements
      addString: (listKey) =>
        setFormData((prev) => ({
          ...prev,
          [listKey]: [...(Array.isArray(prev[listKey]) ? prev[listKey] : []), ""],
        })),

      updateString: (listKey, index, value) =>
        setFormData((prev) => {
          const list = [...(Array.isArray(prev[listKey]) ? prev[listKey] : [])];
          list[index] = value;
          return { ...prev, [listKey]: list };
        }),

      removeString: (listKey, index) =>
        setFormData((prev) => {
          const list = (Array.isArray(prev[listKey]) ? prev[listKey] : []).filter(
            (_, position) => position !== index
          );
          return { ...prev, [listKey]: list.length > 0 ? list : [""] };
        }),
    }),
    []
  );

  const value = useMemo(
    () => ({
      formData,
      setFormData,
      templateId,
      setTemplateId,
      isComplete,
      setIsComplete,
      ...helpers,
    }),
    [formData, templateId, isComplete, helpers]
  );

  return <ResumeContext.Provider value={value}>{children}</ResumeContext.Provider>;
}

export function useResume() {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error("useResume must be used inside a <ResumeProvider>");
  }
  return context;
}
