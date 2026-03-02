export const API_BASE = "https://orbit-ozih.onrender.com";

export const LANGUAGES: { label: string; jdoodle: string; ext: string }[] = [
    { label: "Python", jdoodle: "python3", ext: ".py" },
    { label: "JavaScript", jdoodle: "nodejs", ext: ".js" },
    { label: "C++", jdoodle: "cpp17", ext: ".cpp" },
    { label: "C", jdoodle: "c", ext: ".c" },
    { label: "Java", jdoodle: "java", ext: ".java" },
    { label: "TypeScript", jdoodle: "typescript", ext: ".ts" },
];

export const CURSOR_PAL = [
    "#f59e0b", "#22d3ee", "#a78bfa", "#34d399",
    "#f87171", "#fb923c", "#e879f9", "#60a5fa",
];

export const NAV = ["Lobby", "Profile", "Settings", "Contact Us"] as const;
export type Nav = typeof NAV[number];