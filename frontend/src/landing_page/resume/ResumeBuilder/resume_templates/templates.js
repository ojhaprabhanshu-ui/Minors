import ChronologicalTemplate from "./ChronologicalTemplate";
import FunctionalTemplate from "./FunctionalTemplate";
import CombinationTemplate from "./CombinationTemplate";
import ModernTemplate from "./ModernTemplate";
import ProfessionalTemplate from "./ProfessionalTemplate";
import MinimalTemplate from "./MinimalTemplate";

export const RESUME_TEMPLATES = [
  {
    id: "chronological",
    name: "Chronological",
    group: "format",
    tagline: "Experience-led with dates down the left. Suits steady career progression.",
    accent: "#1d6bf3",
    Component: ChronologicalTemplate,
  },
  {
    id: "functional",
    name: "Functional",
    group: "format",
    tagline: "Skills-led, experience de-emphasised. Suits career changers and varied work.",
    accent: "#d97706",
    Component: FunctionalTemplate,
  },
  {
    id: "combination",
    name: "Combination",
    group: "format",
    tagline: "Skills summary plus chronological experience. Suits graduates and entry level.",
    accent: "#e11d48",
    Component: CombinationTemplate,
  },
  {
    id: "modern",
    name: "Modern",
    group: "design",
    tagline: "Coloured header, skill chips, clean sections.",
    accent: "#1d4ed8",
    Component: ModernTemplate,
  },
  {
    id: "professional",
    name: "Professional",
    group: "design",
    tagline: "Traditional serif single column. Maximum ATS compatibility.",
    accent: "#111827",
    Component: ProfessionalTemplate,
  },
  {
    id: "minimal",
    name: "Minimal",
    group: "design",
    tagline: "Quiet spacing, labelled rows, highly readable.",
    accent: "#71717a",
    Component: MinimalTemplate,
  },
];

export const TEMPLATE_GROUPS = [
  { id: "format", label: "Resume formats", hint: "The three formats explained on the Resume Templates page." },
  { id: "design", label: "Classic designs", hint: "Alternative visual styles rendering the same details." },
];

export const DEFAULT_TEMPLATE_ID = "chronological";

export function getTemplate(id) {
  return RESUME_TEMPLATES.find((template) => template.id === id) || RESUME_TEMPLATES[0];
}
