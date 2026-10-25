export type DoorBounds = {
  left: number; // percentage
  top: number; // percentage
  width: number; // percentage
  height: number; // percentage
};

export type Room = {
  id: string;
  title: string;
  realm: string;
  symbol: string;
  hue: string; // css color for glow
  intro: string;
  bounds: DoorBounds;
};

export const rooms: Room[] = [
  {
    id: "skills",
    title: "Skills",
    realm: "The Alchemist's Laboratory",
    symbol: "⚗",
    hue: "oklch(0.78 0.17 155)",
    intro: "Every artifact here hums with power. Touch one.",
    bounds: { left: 0.5, top: 13.0, width: 5.6, height: 45.0 },
  },
  {
    id: "contact",
    title: "Contact Me",
    realm: "The Observatory",
    symbol: "☾",
    hue: "oklch(0.75 0.16 250)",
    intro: "The quill begins to write…",
    bounds: { left: 14.8, top: 20.0, width: 7.2, height: 35.0 },
  },
  {
    id: "education",
    title: "Education",
    realm: "The Endless Library",
    symbol: "📜",
    hue: "oklch(0.82 0.16 85)",
    intro: "A book stirs on the lectern and opens itself.",
    bounds: { left: 29.0, top: 24.5, width: 6.8, height: 27.5 },
  },
  {
    id: "achievements",
    title: "Achievements",
    realm: "The Hall of Legends",
    symbol: "♛",
    hue: "oklch(0.72 0.22 305)",
    intro: "Relics of great deeds line the hall.",
    bounds: { left: 45.3, top: 26.0, width: 7.8, height: 25.5 },
  },
  {
    id: "experience",
    title: "Experience",
    realm: "The Guarded Vault",
    symbol: "⚷",
    hue: "oklch(0.65 0.22 25)",
    intro: "Three heads watch the vault. Step quietly.",
    bounds: { left: 63.6, top: 24.5, width: 6.8, height: 27.5 },
  },
  {
    id: "certifications",
    title: "Certifications",
    realm: "The Glass Vault",
    symbol: "✧",
    hue: "oklch(0.78 0.14 200)",
    intro: "Sealed in glass, each scroll awaits its reader.",
    bounds: { left: 77.2, top: 20.0, width: 7.2, height: 35.0 },
  },
  {
    id: "projects",
    title: "Projects",
    realm: "The Dragon Arena",
    symbol: "🜂",
    hue: "oklch(0.75 0.2 55)",
    intro: "A dragon guards three golden eggs. Claim one.",
    bounds: { left: 93.2, top: 13.0, width: 5.6, height: 45.0 },
  },
];

export const projects = [
  { name: "Zavran AI", desc: "AI product platform." },
  { name: "Shubh AI Studio", desc: "AI creative studio." },
  { name: "Moxsend", desc: "Smart outreach and sending." },
  { name: "MoxQuote", desc: "AI-powered quoting." },
  { name: "RenoCred / Taqdeer", desc: "Credit and fintech application." },
];

export const skills = ["Python", "SQL", "Java", "FastAPI", "LangChain", "LangGraph", "RAG", "Vector Databases", "PyTorch", "Hugging Face", "React", "Next.js", "Node.js", "Docker", "AWS", "PostgreSQL"];

// Placeholder content — replace with real details.
export const experience = [
  { role: "AI Engineer", org: "Your Company", period: "20XX — Present", note: "Building AI products and LLM applications." },
  { role: "Software Developer", org: "Previous Company", period: "20XX — 20XX", note: "Full-stack development." },
];
export const education = [{ degree: "Your Degree", school: "Your University", period: "20XX — 20XX" }];
export const certifications = ["Certification One", "Certification Two", "Certification Three"];
export const achievements = ["Shipped multiple AI products", "Built production AI applications", "Patent", "Key project accomplishments"];
export const contact = {
  name: "DILEEP SAI GALLA",
  email: "you@example.com",
  phone: "+91 00000 00000",
  github: "https://github.com/",
  linkedin: "https://linkedin.com/",
};
