// Generates /llms.txt and /llms-full.txt from src/content/site.js so that AI
// agents / LLMs can read a clean, structured summary of the portfolio.
// Spec: https://llmstxt.org  (same convention used by https://hono.dev/llms-full.txt)
// Wired into predev/prebuild in package.json — keep it data-driven, not hand-edited.

import fs from "node:fs/promises";
import path from "node:path";
import { site } from "./src/content/site.js";

const SITE_URL = "https://hulsambath.github.io";
const PUBLIC_DIR = path.resolve("public");

// Education is rendered in the About section of App.tsx (not in site.js); mirror it here.
const education = {
  degree: "Bachelor of Computer Science (Software Engineering)",
  school: "Cambodia Academy of Digital Technology (CADT)",
  schoolUrl: "https://cadt.edu.kh",
  period: "2021 – 2025",
  note: "Gained strong foundations in software architecture, mobile app development, and collaborative project work.",
};

const bio =
  "Sambath HUL is a Software Engineer based in Phnom Penh, Cambodia, with 2+ years of " +
  "hands-on experience designing, building, and shipping production software — primarily " +
  "cross-platform mobile apps with Flutter and Firebase, plus web apps and developer tooling. " +
  "He has built and released multiple apps to the Google Play Store and Apple App Store, " +
  "including white-label / multi-tenant platforms, and works with an MVVM + Repository architecture, " +
  "full internationalization (English/Khmer), and CI/CD automation.";

const { author, stats, skills, technologies, experience, projects } = site;

const contactLines = [
  `- Name: ${author.name}`,
  `- Title: ${author.title}`,
  `- Location: ${author.location}`,
  `- Email: ${author.email}`,
  author.phones?.length ? `- Phone: ${author.phones.join(", ")}` : null,
  `- Website: ${SITE_URL}`,
  `- GitHub: ${author.social.github}`,
  `- LinkedIn: ${author.social.linkedin}`,
  `- X (Twitter): ${author.social.x}`,
].filter(Boolean);

function projectLinks(p) {
  return [
    p.playStoreUrl ? `  - Play Store: ${p.playStoreUrl}` : null,
    p.appStoreUrl ? `  - App Store: ${p.appStoreUrl}` : null,
    p.sourceUrl && p.sourceUrl !== "#" ? `  - Source: ${p.sourceUrl}` : null,
    p.demoUrl && p.demoUrl !== "#" ? `  - Demo: ${p.demoUrl}` : null,
  ].filter(Boolean);
}

/* ------------------------------- llms-full.txt ------------------------------ */
function buildFull() {
  const L = [];
  L.push(`# ${author.name} — ${author.title}`);
  L.push("");
  L.push(`> ${bio} This file is a structured, plain-text representation of his portfolio (${SITE_URL}) for AI agents and LLMs.`);
  L.push("");
  L.push(...contactLines);
  L.push("");

  L.push("## Summary");
  L.push(bio);
  L.push("");

  L.push("## Highlights");
  for (const s of stats) L.push(`- ${s.value} ${s.label}`);
  L.push("");

  L.push("## Education");
  L.push(`- ${education.degree}`);
  L.push(`- ${education.school} (${education.schoolUrl})`);
  L.push(`- ${education.period}`);
  L.push(`- ${education.note}`);
  L.push("");

  L.push("## Skills");
  for (const [group, items] of Object.entries(skills)) {
    L.push(`### ${group[0].toUpperCase() + group.slice(1)}`);
    for (const sk of items) L.push(`- ${sk.name}${sk.years ? ` — ${sk.years}` : ""}`);
    L.push("");
  }

  L.push("## Technologies");
  for (const [group, items] of Object.entries(technologies)) {
    const label = group.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
    L.push(`- ${label}: ${items.map((t) => t.name).join(", ")}`);
  }
  L.push("");

  L.push("## Experience");
  for (const e of experience) {
    const at = e.companyUrl ? `${e.company} (${e.companyUrl})` : e.company;
    L.push(`### ${e.role} — ${at}`);
    L.push(`${e.period}`);
    for (const b of e.bullets) L.push(`- ${b}`);
    L.push("");
  }

  L.push("## Projects");
  for (const p of projects) {
    L.push(`### ${p.title}${p.company ? ` — ${p.company}` : ""}`);
    L.push(p.description);
    if (p.tech?.length) L.push(`  - Tech: ${p.tech.join(", ")}`);
    L.push(...projectLinks(p));
    L.push("");
  }

  L.push("## Contact");
  L.push(`Reach ${author.name} at ${author.email} or via the links above.`);
  L.push("");

  return L.join("\n");
}

/* --------------------------------- llms.txt -------------------------------- */
function buildIndex() {
  const L = [];
  L.push(`# ${author.name} — ${author.title}`);
  L.push("");
  L.push(
    `> ${stats.map((s) => `${s.value} ${s.label.toLowerCase()}`).join(", ")}. ` +
      `Software Engineer in ${author.location}. Designs, builds, and ships production software — mobile apps with Flutter and Firebase, web apps, and developer tooling.`,
  );
  L.push("");
  L.push(...contactLines);
  L.push("");

  L.push("## Projects");
  for (const p of projects) {
    const link = p.playStoreUrl || p.appStoreUrl || p.sourceUrl || p.demoUrl || SITE_URL;
    const head = p.description.split(". ")[0];
    const firstSentence = head.endsWith(".") ? head : head + ".";
    L.push(`- [${p.title}](${link}): ${firstSentence}`);
  }
  L.push("");

  L.push("## Full details");
  L.push(`- [Complete portfolio (plain text)](${SITE_URL}/llms-full.txt)`);
  L.push(`- [Portfolio website](${SITE_URL})`);
  L.push("");

  return L.join("\n");
}

async function main() {
  await fs.mkdir(PUBLIC_DIR, { recursive: true });
  await fs.writeFile(path.join(PUBLIC_DIR, "llms-full.txt"), buildFull(), "utf-8");
  await fs.writeFile(path.join(PUBLIC_DIR, "llms.txt"), buildIndex(), "utf-8");
  console.log("Generated public/llms.txt and public/llms-full.txt");
}

main().catch((err) => {
  console.error("generate_llms failed:", err);
  process.exit(1);
});
