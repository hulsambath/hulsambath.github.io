import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { site } from "./content/site.js";

const mcpLogo = "/assets/mcp_logo.png";
const sections = [
  "home",
  "about",
  "skills",
  "projects",
  "experience",
  "contact",
] as const;
type SectionId = (typeof sections)[number];

export default function App() {
  const [activeSection, setActiveSection] = useState<SectionId>("home");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;

          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: SectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDownloadResume = async () => {
    const resumePdfUrl = "/Sambath_HUL_CV.pdf";
    try {
      const response = await fetch(resumePdfUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = "Sambath_HUL_CV.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading resume:", error);
      const link = document.createElement("a");
      link.href = resumePdfUrl;
      link.download = "Sambath_HUL_CV.pdf";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => scrollToSection("home")}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
              S
            </div>
            <span className="text-lg font-semibold tracking-tight">
              {site.author.name}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-8 md:flex">
              {sections.map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className={`text-sm font-medium capitalize transition-colors ${
                    activeSection === section
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {section}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="/llms.txt" target="_blank" rel="noreferrer">
                llms.txt
              </a>
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex flex-col">
        {/* Hero Section */}
        <section
          id="home"
          className="relative flex min-h-[92vh] flex-col justify-center px-6 pt-24 pb-16 overflow-hidden"
        >
          {/* Subtle grid background */}
          <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

          <div className="mx-auto max-w-6xl w-full">
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* Left Column: Headline, Value Prop & Actions */}
              <div className="lg:col-span-7 space-y-6 text-left">
                {/* Live Status Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/25 bg-primary/10 text-primary text-xs font-semibold tracking-wide backdrop-blur-sm shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>Available for Engineering Roles • Phnom Penh, KH</span>
                </div>

                <div className="space-y-3">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground">
                    Hi, I'm{" "}
                    <span className="bg-gradient-to-r from-primary via-amber-500 to-orange-400 bg-clip-text text-transparent">
                      {site.author.name}
                    </span>
                  </h1>
                  <p className="text-xl sm:text-2xl font-semibold text-foreground/90 tracking-tight">
                    Mobile & Applied AI Software Engineer
                  </p>
                </div>

                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
                  Specializing in high-performance{" "}
                  <strong className="text-foreground font-medium">Flutter</strong>{" "}
                  mobile architectures, on-device{" "}
                  <strong className="text-foreground font-medium">
                    Edge AI (TensorFlow Lite)
                  </strong>
                  , and resilient full-stack backends. Shipped 4+ production apps
                  across travel super-apps, live event voting, and ophthalmic
                  healthcare.
                </p>

                {/* Actions & Social Links */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Button
                    size="lg"
                    onClick={() => scrollToSection("projects")}
                    className="font-semibold shadow-md gap-2"
                  >
                    <span>Explore Projects</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={handleDownloadResume}
                    className="font-semibold gap-2 border-border/80 hover:bg-muted/60"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" x2="12" y1="15" y2="3" />
                    </svg>
                    <span>Download CV</span>
                  </Button>

                  {/* Micro Social Icons */}
                  <div className="flex items-center gap-2 pl-1">
                    <a
                      href={site.author.social.github}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="GitHub"
                      className="p-2.5 rounded-lg border border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-card transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                    </a>
                    <a
                      href={site.author.social.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="LinkedIn"
                      className="p-2.5 rounded-lg border border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-card transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                    </a>
                    <a
                      href={`mailto:${site.author.email}`}
                      aria-label="Email"
                      className="p-2.5 rounded-lg border border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-card transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

              {/* Right Column: The Engineer Dossier Portrait Card */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative mx-auto w-full max-w-sm sm:max-w-md">
                  {/* Ambient glowing backlight */}
                  <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-primary/35 via-amber-500/25 to-orange-500/15 blur-3xl opacity-70 pointer-events-none" />

                  {/* Blueprint chassis */}
                  <div className="relative rounded-3xl border border-border/80 bg-card/90 backdrop-blur-xl p-4 sm:p-5 shadow-2xl transition-all duration-500 hover:border-primary/50 group">
                    {/* Header bar */}
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/50 text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-semibold text-foreground">
                          {site.author.title}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-muted/80 text-muted-foreground text-[10px] font-medium tracking-wide">
                        CADT '25
                      </span>
                    </div>

                    {/* Studio Portrait Container with corner crosshairs */}
                    <div className="relative rounded-2xl overflow-hidden bg-muted/40 aspect-[4/5] border border-border/60">
                      {/* Corner crosshairs */}
                      <span className="absolute top-2 left-2 text-[11px] font-mono text-foreground/40 z-10 select-none">
                        +
                      </span>
                      <span className="absolute top-2 right-2 text-[11px] font-mono text-foreground/40 z-10 select-none">
                        +
                      </span>
                      <span className="absolute bottom-2 left-2 text-[11px] font-mono text-foreground/40 z-10 select-none">
                        +
                      </span>
                      <span className="absolute bottom-2 right-2 text-[11px] font-mono text-foreground/40 z-10 select-none">
                        +
                      </span>

                      <img
                        src="/assets/sambath_portrait.jpg"
                        alt={site.author.name}
                        className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.025]"
                      />

                      {/* Subtle bottom gradient to blend badges */}
                      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/90 via-background/40 to-transparent pointer-events-none" />

                      {/* Floating Badge 1: Bottom Left */}
                      <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-background/90 backdrop-blur-md border border-border/80 shadow-md text-xs font-semibold">
                        <span className="text-sm">📱</span>
                        <span className="tracking-tight text-foreground">
                          4+ Store Apps
                        </span>
                      </div>

                      {/* Floating Badge 2: Bottom Right */}
                      <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-background/90 backdrop-blur-md border border-border/80 shadow-md text-xs font-semibold">
                        <span className="text-sm">🔬</span>
                        <span className="tracking-tight text-foreground">
                          Edge AI (TFLite)
                        </span>
                      </div>
                    </div>

                    {/* Technical footer strip */}
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/50 font-mono text-[10px] text-muted-foreground/80">
                      <span>11.5564° N, 104.9282° E</span>
                      <span className="text-primary font-medium tracking-wide">
                        PHNOM PENH, KH
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Metric Strip */}
            <div className="mt-16 w-full grid grid-cols-2 sm:grid-cols-4 gap-4 p-3 sm:p-4 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md shadow-sm">
              {[
                { label: "Production Dart LOC", value: "208K+", icon: "💻" },
                { label: "Live Store Apps", value: "4 Apps", icon: "🚀" },
                { label: "Target OS Platforms", value: "6 OS", icon: "🌐" },
                { label: "Edge AI Diagnosis", value: "100% Offline", icon: "⚡" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/40 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg shrink-0">
                    {stat.icon}
                  </div>
                  <div>
                    <div className="font-bold text-lg text-foreground tracking-tight">
                      {stat.value}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="w-full h-px bg-border/50 max-w-6xl mx-auto"></div>

        {/* About Section */}
        <section id="about" className="px-6 py-24 bg-muted/30">
          <div className="mx-auto max-w-5xl">
            <div className="space-y-4 mb-16 text-center">
              <h2 className="text-3xl font-bold tracking-tight">About Me</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Get to know more about my background and education.
              </p>
            </div>

            <div className="grid md:grid-cols-5 gap-12 items-start">
              <div className="md:col-span-3 space-y-6 text-lg text-muted-foreground leading-relaxed">
                <p>
                  I'm <strong className="text-foreground">Sambath HUL</strong>,
                  a{" "}
                  <strong className="text-foreground">Software Engineer</strong>{" "}
                  and a recent graduate from the{" "}
                  <strong className="text-foreground">
                    Cambodia Academy of Digital Technology (CADT)
                  </strong>
                  , specialized in{" "}
                  <strong className="text-foreground">
                    Software Engineering
                  </strong>
                  .
                </p>
                <p>
                  I have{" "}
                  <strong className="text-foreground">
                    2+ years of hands-on experience
                  </strong>{" "}
                  designing, building, and shipping production software — from
                  cross-platform mobile apps with Flutter and Firebase to web
                  apps and developer tooling — including releases to the{" "}
                  <strong className="text-foreground">
                    Google Play Store and Apple App Store
                  </strong>
                  .
                </p>
                <p>
                  I'm passionate about clean architecture, seamless user
                  experiences, and scalable systems. I'm eager to contribute to
                  a forward-thinking team and continue growing as a software
                  engineer.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t mt-8">
                  {site.stats.map((s) => (
                    <div key={s.label}>
                      <div className="text-3xl font-bold text-primary">
                        {s.value}
                      </div>
                      <div className="text-sm font-medium text-muted-foreground mt-1">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2 space-y-8">
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4">Education</h3>
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">
                      Bachelor of Computer Science (Software Engineering)
                    </p>
                    <a
                      href="https://cadt.edu.kh"
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-primary hover:underline underline-offset-4 inline-block my-1"
                    >
                      Cambodia Academy of Digital Technology (CADT)
                    </a>
                    <p className="text-sm text-muted-foreground">2021 – 2025</p>
                    <p className="text-sm text-muted-foreground mt-3">
                      Gained strong foundations in software architecture, mobile
                      app development, and collaborative project work.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border bg-card p-6 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4">What I Do</h3>
                  <ul className="space-y-3">
                    {[
                      "Mobile App Development (Flutter)",
                      "Web Development (React / Next.js)",
                      "Backend & Developer Tooling (Node.js)",
                      "CI/CD & Release Automation",
                      "UI/UX Design",
                      "Testing & QA",
                    ].map((item) => (
                      <li
                        key={item}
                        className="flex items-center text-sm text-muted-foreground"
                      >
                        <div className="mr-3 h-1.5 w-1.5 rounded-full bg-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="w-full h-px bg-border/50 max-w-6xl mx-auto"></div>

        {/* Skills Section */}
        <section id="skills" className="px-6 py-24">
          <div className="mx-auto max-w-5xl">
            <div className="space-y-4 mb-16 text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                Skills & Technologies
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                A look at the technologies and tools I work with every day.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-16">
              {[
                { title: "Mobile Development", items: site.skills.mobile },
                { title: "Web Development", items: site.skills.web },
                { title: "Tools & Others", items: site.skills.tools },
              ].map((category) => (
                <div
                  key={category.title}
                  className="rounded-xl border bg-card p-6 shadow-sm"
                >
                  <h3 className="text-lg font-semibold mb-6">
                    {category.title}
                  </h3>
                  <div className="space-y-4">
                    {category.items.map((sk) => (
                      <div
                        key={sk.name}
                        className="flex justify-between items-center text-sm"
                      >
                        <div className="flex items-center gap-2 font-medium">
                          {sk.icon && (
                            <img
                              src={sk.icon}
                              alt={sk.name}
                              className="w-4 h-4 object-contain"
                            />
                          )}
                          {sk.name}
                        </div>
                        {sk.years && (
                          <span className="text-xs font-medium text-primary whitespace-nowrap">
                            {sk.years}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Tools Grid */}
            <div className="space-y-12">
              {[
                { title: "Languages", items: site.technologies.languages },
                {
                  title: "Frameworks & Libraries",
                  items: site.technologies.frameworks,
                },
                { title: "Backend & Cloud", items: site.technologies.backend },
                {
                  title: "Architecture & Patterns",
                  items: site.technologies.architecture,
                },
                { title: "Development Tools", items: site.technologies.tools },
                {
                  title: "Development Environment",
                  items: site.technologies.developmentEnvironment,
                },
              ].map((group) => (
                <div key={group.title}>
                  <h3 className="text-xl font-semibold mb-6">{group.title}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {group.items.map((tech) => (
                      <div
                        key={tech.name}
                        className="flex flex-col items-center justify-center rounded-xl border border-border/60 bg-card/50 backdrop-blur-md p-4 text-center shadow-sm hover:border-primary/50 hover:bg-card/70 transition-colors"
                      >
                        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
                          {"useLocalImage" in tech &&
                          tech.useLocalImage &&
                          tech.name === "MCP Server" ? (
                            <img
                              src={mcpLogo}
                              alt={tech.name}
                              className="w-9 h-9 object-contain"
                            />
                          ) : tech.icon ? (
                            <img
                              src={tech.icon}
                              alt={tech.name}
                              className="w-9 h-9 object-contain"
                            />
                          ) : (
                            <span
                              className="text-sm font-bold leading-none"
                              style={{
                                color:
                                  ("textColor" in tech && tech.textColor) ||
                                  "#B744B8",
                              }}
                            >
                              {tech.name}
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">
                          {tech.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="w-full h-px bg-border/50 max-w-6xl mx-auto"></div>

        {/* Projects Section */}
        <section id="projects" className="px-6 py-24 bg-muted/30">
          <div className="mx-auto max-w-6xl">
            <div className="space-y-4 mb-16 text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                Featured Projects
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Some of my recent work that I am proud of.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {site.projects.map((p) => (
                <div
                  key={p.title}
                  className="flex flex-col rounded-xl border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="h-48 flex items-center justify-center bg-muted border-b relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.title}
                        className="w-24 h-24 object-contain rounded-[22.5%] shadow-sm z-10"
                      />
                    ) : (
                      <span className="text-4xl z-10" aria-hidden="true">
                        {p.icon}
                      </span>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-semibold mb-2">{p.title}</h3>
                    <p className="text-sm text-muted-foreground mb-6 flex-1">
                      {p.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {p.tech.map((t) => (
                        <span
                          key={t}
                          className="px-2.5 py-0.5 bg-secondary text-secondary-foreground rounded-md text-xs font-medium"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-auto">
                      {p.playStoreUrl && p.playStoreUrl !== "#" && (
                        <Button size="sm" asChild>
                          <a
                            href={p.playStoreUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5"
                          >
                            <img
                              src="/assets/googleplay_btn.svg"
                              alt=""
                              aria-hidden="true"
                              className="w-3.5 h-3.5"
                            />
                            Play Store
                          </a>
                        </Button>
                      )}
                      {p.appStoreUrl && p.appStoreUrl !== "#" && (
                        <Button size="sm" asChild>
                          <a
                            href={p.appStoreUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5"
                          >
                            <img
                              src="/assets/appstore_btn.svg"
                              alt=""
                              aria-hidden="true"
                              className="w-3.5 h-3.5"
                            />
                            App Store
                          </a>
                        </Button>
                      )}
                      {p.sourceUrl && p.sourceUrl !== "#" && (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={p.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Source
                          </a>
                        </Button>
                      )}
                      {p.demoUrl && p.demoUrl !== "#" && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={p.demoUrl} target="_blank" rel="noreferrer">
                            {p.demoUrl.includes("youtu")
                              ? "Watch Demo"
                              : "View Live"}
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="w-full h-px bg-border/50 max-w-6xl mx-auto"></div>

        {/* Experience Section */}
        <section id="experience" className="px-6 py-24">
          <div className="mx-auto max-w-3xl">
            <div className="space-y-4 mb-16 text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                Work Experience
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                My professional journey and roles.
              </p>
            </div>

            <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
              {site.experience.map((e) => (
                <div
                  key={e.role + e.company}
                  className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border bg-background text-primary font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    {e.initials}
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2">
                      <h3 className="font-bold text-lg">{e.role}</h3>
                      <time className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-md mt-2 sm:mt-0">
                        {e.period}
                      </time>
                    </div>
                    <p className="font-medium text-primary mb-4 text-sm">
                      {e.companyUrl ? (
                        <a
                          href={e.companyUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline underline-offset-4"
                        >
                          {e.company}
                        </a>
                      ) : (
                        e.company
                      )}
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4 marker:text-muted">
                      {e.bullets.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="w-full h-px bg-border/50 max-w-6xl mx-auto"></div>

        {/* Contact Section */}
        <section id="contact" className="px-6 py-24 bg-muted/30">
          <div className="mx-auto max-w-5xl">
            <div className="space-y-4 mb-16 text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                Get In Touch
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Feel free to reach out for collaborations, opportunities, or
                just to say hi.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-semibold mb-2">
                    Let's work together!
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    I'm always interested in new opportunities and exciting
                    projects. Whether you have a question or just want to say
                    hi, I'll try my best to get back to you!
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border bg-background shadow-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-muted-foreground"
                      >
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Email</p>
                      <a
                        href={`mailto:${site.author.email}`}
                        className="text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4 transition-colors"
                      >
                        {site.author.email}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border bg-background shadow-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-muted-foreground"
                      >
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Phone</p>
                      {site.author.phones.map((ph) => (
                        <p key={ph} className="text-sm text-muted-foreground">
                          {ph}
                        </p>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border bg-background shadow-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-muted-foreground"
                      >
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">
                        {site.author.location}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    window.location.href = `mailto:${site.author.email}`;
                  }}
                >
                  <div className="space-y-2">
                    <label
                      htmlFor="name"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="message"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Your message..."
                    ></textarea>
                  </div>
                  <Button type="submit" className="w-full">
                    Send Message
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background py-12 text-center">
        <div className="mx-auto max-w-5xl flex flex-col items-center gap-6">
          <div className="flex gap-6">
            <a
              href="https://github.com/hulsambath"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="sr-only">GitHub</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
            <a
              href="https://linkedin.com/in/hulsambath"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="sr-only">LinkedIn</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
            <a
              href="https://x.com/hul_sambath"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="sr-only">X</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Sambath HUL. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
