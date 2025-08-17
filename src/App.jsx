import { useEffect, useState } from "react";
import notemymindsIcon from "./assets/1024x1024.png";
import hangmeasLogo from "./assets/hangmeas_logo.png";
import logo from "./assets/logo.png";
import mcpLogo from "./assets/mcp_logo.png";
import resumePdf from "./assets/Sambath_HUL_CV.pdf";
import { site } from "./content/site.js";

export default function App() {
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        "home",
        "about",
        "skills",
        "projects",
        "experience",
        "contact",
      ];
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

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId).scrollIntoView({ behavior: "smooth" });
  };

  const handleDownloadResume = async () => {
    try {
      // Fetch the PDF file as a blob
      const response = await fetch(resumePdf);
      const blob = await response.blob();

      // Create a blob URL
      const blobUrl = window.URL.createObjectURL(blob);

      // Create a temporary anchor element to trigger download
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = "Sambath_HUL_CV.pdf";
      document.body.appendChild(link);
      link.click();

      // Clean up: remove the link and revoke the blob URL
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading resume:", error);
      // Fallback: try direct download
      const link = document.createElement("a");
      link.href = resumePdf;
      link.download = "Sambath_HUL_CV.pdf";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen text-text-primary-dark relative overflow-hidden">
      {/* Animated Background Circles */}
      <div className="animated-circles">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="fixed top-0 w-full backdrop-blur-xl border-b border-outline-variant/30 z-50 shadow-m3-1">
          <div className="container-max px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <img src={logo} alt="<HS> Logo" className="w-16 h-16" />
                <div
                  className="text-xl font-bold gradient-text"
                  aria-label="Brand name"
                >
                  {site.author.name}
                </div>
              </div>
              <div className="hidden md:flex space-x-8">
                {[
                  "home",
                  "about",
                  "skills",
                  "projects",
                  "experience",
                  "contact",
                ].map((section) => (
                  <button
                    key={section}
                    onClick={() => scrollToSection(section)}
                    className={`capitalize transition-colors duration-200 ${
                      activeSection === section
                        ? "text-primary-500 font-medium"
                        : "text-text-secondary-dark hover:text-primary-400"
                    }`}
                  >
                    {section}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section
          id="home"
          className="section-padding pt-24 section-with-separator"
        >
          <div className="container-max text-center">
            <div className="max-w-4xl mx-auto">
              <div className="m3-card bg-surface-container-highest/30 p-12">
                <h1 className="text-5xl md:text-7xl font-bold mb-6">
                  Hi, I'm{" "}
                  <span className="gradient-text">{site.author.name}</span> 👋
                </h1>
                <p className="text-xl md:text-2xl text-text-secondary-dark mb-8 max-w-3xl mx-auto">
                  {site.author.title} passionate about creating exceptional
                  mobile and web experiences
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    className="btn-primary"
                    onClick={() => scrollToSection("projects")}
                    aria-label="View my work"
                  >
                    View My Work
                  </button>
                  <button
                    className="btn-secondary text-center"
                    onClick={handleDownloadResume}
                    aria-label="Download resume"
                  >
                    Download Resume
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Separator 1 */}
        <div className="section-separator">
          <div className="separator-glow"></div>
          <div className="separator-line"></div>
          <div className="separator-icon">👨‍💻</div>
        </div>

        {/* About Section */}
        <section id="about" className="section-padding section-with-separator">
          <div className="container-max">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 m3-text-primary">
                About Me
              </h2>
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="m3-card bg-surface-container-highest/30 p-8">
                  <p className="text-lg text-text-secondary-dark mb-6 leading-relaxed">
                    I'm{" "}
                    <strong className="text-primary-400">Sambath HUL</strong>, a{" "}
                    <strong className="text-primary-400">
                      Flutter Developer
                    </strong>{" "}
                    and a recent graduate from the{" "}
                    <strong className="text-primary-400">
                      Cambodia Academy of Digital Technology (CADT)
                    </strong>
                    , specialized in{" "}
                    <strong className="text-primary-400">
                      Software Engineering
                    </strong>
                    .
                  </p>
                  <p className="text-lg text-text-secondary-dark mb-6 leading-relaxed">
                    I have nearly{" "}
                    <strong className="text-primary-400">
                      two years of hands-on experience
                    </strong>{" "}
                    building mobile applications using Flutter and Firebase,
                    including publishing apps on the{" "}
                    <strong className="text-primary-400">
                      Google Play Store
                    </strong>
                    .
                  </p>
                  <p className="text-lg text-text-secondary-dark mb-6 leading-relaxed">
                    I'm passionate about crafting seamless user experiences,
                    clean architecture, and scalable mobile solutions. I'm eager
                    to contribute to a forward-thinking team and continue
                    growing as a professional mobile developer.
                  </p>
                  <div className="flex gap-4">
                    {site.stats.map((s) => (
                      <div key={s.label} className="text-center">
                        <div className="text-2xl font-bold text-primary-500">
                          {s.value}
                        </div>
                        <div className="text-sm text-text-secondary-dark">
                          {s.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="m3-card p-8 bg-primary-500/20 border-primary-500/20">
                  <h3 className="text-xl font-semibold mb-4 m3-text-primary">
                    Education
                  </h3>
                  <div className="mb-6">
                    <p className="font-medium text-text-primary-dark mb-1">
                      Bachelor of Computer Science (Software Engineering)
                    </p>
                    <p className="text-primary-500 text-sm mb-2">
                      <a
                        href="https://cadt.edu.kh/about/"
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-primary-400 underline underline-offset-2 transition-colors"
                      >
                        Cambodia Academy of Digital Technology (CADT)
                      </a>
                    </p>
                    <p className="text-text-secondary-dark text-sm">
                      Gained strong foundations in software architecture, mobile
                      app development, and collaborative project work using
                      modern technologies.
                    </p>
                  </div>
                  <h3 className="text-xl font-semibold mb-4 m3-text-primary mt-6">
                    What I Do
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-center text-text-secondary-dark">
                      <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                      Mobile App Development (Flutter)
                    </li>
                    <li className="flex items-center text-text-secondary-dark">
                      <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                      Web Development (React)
                    </li>
                    <li className="flex items-center text-text-secondary-dark">
                      <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                      UI/UX Design
                    </li>
                    <li className="flex items-center text-text-secondary-dark">
                      <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                      Testing & QA
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Separator 2 */}
        <div className="section-separator">
          <div className="separator-glow"></div>
          <div className="separator-line"></div>
          <div className="separator-icon">⚡</div>
        </div>

        {/* Skills Section */}
        <section id="skills" className="section-padding section-with-separator">
          <div className="container-max">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 m3-text-primary">
              Skills & Technologies
            </h2>
            <div className="m3-card-elevated bg-surface-container-highest/30 p-8">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="m3-card-elevated bg-surface-container-highest/30 p-6 card-hover">
                  <h3 className="text-xl font-semibold mb-4 text-primary-500">
                    Mobile Development
                  </h3>
                  <div className="space-y-3">
                    {site.skills.mobile.map((sk) => (
                      <div
                        key={sk.name}
                        className="flex justify-between items-center"
                      >
                        <div className="flex items-center gap-2">
                          {sk.icon && (
                            <img
                              src={sk.icon}
                              alt={sk.name}
                              className="w-5 h-5"
                            />
                          )}
                          <span className="text-text-secondary-dark">
                            {sk.name}
                          </span>
                        </div>
                        <div
                          className="w-24 bg-surface-container-high rounded-m3-2xl h-2"
                          aria-hidden="true"
                        >
                          <div
                            className="bg-primary-500 h-2 rounded-m3-2xl transition-all duration-500"
                            style={{ width: `${sk.levelPct}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="m3-card-elevated bg-surface-container-highest/30 p-6 card-hover">
                  <h3 className="text-xl font-semibold mb-4 text-primary-500">
                    Web Development
                  </h3>
                  <div className="space-y-3">
                    {site.skills.web.map((sk) => (
                      <div
                        key={sk.name}
                        className="flex justify-between items-center"
                      >
                        <div className="flex items-center gap-2">
                          {sk.icon && (
                            <img
                              src={sk.icon}
                              alt={sk.name}
                              className="w-5 h-5"
                            />
                          )}
                          <span className="text-text-secondary-dark">
                            {sk.name}
                          </span>
                        </div>
                        <div
                          className="w-24 bg-surface-container-high rounded-m3-2xl h-2"
                          aria-hidden="true"
                        >
                          <div
                            className="bg-primary-500 h-2 rounded-m3-2xl transition-all duration-500"
                            style={{ width: `${sk.levelPct}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="m3-card-elevated bg-surface-container-highest/30 p-6 card-hover">
                  <h3 className="text-xl font-semibold mb-4 text-primary-500">
                    Tools & Others
                  </h3>
                  <div className="space-y-3">
                    {site.skills.tools.map((sk) => (
                      <div
                        key={sk.name}
                        className="flex justify-between items-center"
                      >
                        <div className="flex items-center gap-2">
                          {sk.icon && (
                            <img
                              src={sk.icon}
                              alt={sk.name}
                              className="w-5 h-5"
                            />
                          )}
                          <span className="text-text-secondary-dark">
                            {sk.name}
                          </span>
                        </div>
                        <div
                          className="w-24 bg-surface-container-high rounded-m3-2xl h-2"
                          aria-hidden="true"
                        >
                          <div
                            className="bg-primary-500 h-2 rounded-m3-2xl transition-all duration-500"
                            style={{ width: `${sk.levelPct}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Separator 2.5 */}
        <div className="section-separator">
          <div className="separator-glow"></div>
          <div className="separator-line"></div>
          <div className="separator-icon">🛠️</div>
        </div>

        {/* Technology & Tools Section */}
        <section
          id="technologies"
          className="section-padding section-with-separator"
        >
          <div className="container-max">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 m3-text-primary">
              Technology & Tools
            </h2>
            <div className="m3-card bg-surface-container-highest/30 p-8">
              <div className="space-y-12">
                {/* Languages */}
                <div>
                  <h3 className="text-2xl font-semibold mb-6 text-primary-500">
                    Languages
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {site.technologies.languages.map((tech) => (
                      <div
                        key={tech.name}
                        className="m3-card-elevated bg-surface-container-highest/30 p-4 card-hover flex flex-col items-center justify-center text-center"
                      >
                        <img
                          src={tech.icon}
                          alt={tech.name}
                          className="w-12 h-12 mb-3"
                        />
                        <span className="text-sm text-text-secondary-dark font-medium">
                          {tech.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Frameworks */}
                <div>
                  <h3 className="text-2xl font-semibold mb-6 text-primary-500">
                    Frameworks & Libraries
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {site.technologies.frameworks.map((tech) => (
                      <div
                        key={tech.name}
                        className="m3-card-elevated bg-surface-container-highest/30 p-4 card-hover flex flex-col items-center justify-center text-center"
                      >
                        <img
                          src={tech.icon}
                          alt={tech.name}
                          className="w-12 h-12 mb-3"
                        />
                        <span className="text-sm text-text-secondary-dark font-medium">
                          {tech.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Backend & Cloud */}
                <div>
                  <h3 className="text-2xl font-semibold mb-6 text-primary-500">
                    Backend & Cloud
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {site.technologies.backend.map((tech) => (
                      <div
                        key={tech.name}
                        className="m3-card-elevated bg-surface-container-highest/30 p-4 card-hover flex flex-col items-center justify-center text-center"
                      >
                        <img
                          src={tech.icon}
                          alt={tech.name}
                          className="w-12 h-12 mb-3"
                        />
                        <span className="text-sm text-text-secondary-dark font-medium">
                          {tech.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Architecture & Patterns */}
                <div>
                  <h3 className="text-2xl font-semibold mb-6 text-primary-500">
                    Architecture & Patterns
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {site.technologies.architecture.map((tech) => (
                      <div
                        key={tech.name}
                        className="m3-card-elevated bg-surface-container-highest/30 p-4 card-hover flex flex-col items-center justify-center text-center"
                      >
                        <img
                          src={tech.icon}
                          alt={tech.name}
                          className="w-12 h-12 mb-3"
                        />
                        <span className="text-sm text-text-secondary-dark font-medium">
                          {tech.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tools */}
                <div>
                  <h3 className="text-2xl font-semibold mb-6 text-primary-500">
                    Development Tools
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {site.technologies.tools.map((tech) => (
                      <div
                        key={tech.name}
                        className="m3-card-elevated bg-surface-container-highest/30 p-4 card-hover flex flex-col items-center justify-center text-center"
                      >
                        {tech.icon ? (
                          <img
                            src={tech.icon}
                            alt={tech.name}
                            className="w-12 h-12 mb-3"
                          />
                        ) : (
                          <div className="w-12 h-12 mb-3 flex items-center justify-center">
                            <span
                              className="text-2xl font-bold"
                              style={{ color: tech.textColor || "#B744B8" }}
                            >
                              {tech.name}
                            </span>
                          </div>
                        )}
                        <span className="text-sm text-text-secondary-dark font-medium">
                          {tech.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Development Environment */}
                <div>
                  <h3 className="text-2xl font-semibold mb-6 text-primary-500">
                    Development Environment
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {site.technologies.developmentEnvironment.map((tech) => (
                      <div
                        key={tech.name}
                        className="m3-card-elevated bg-surface-container-highest/30 p-4 card-hover flex flex-col items-center justify-center text-center"
                      >
                        {tech.useLocalImage && tech.name === "MCP Server" ? (
                          <img
                            src={mcpLogo}
                            alt={tech.name}
                            className="w-12 h-12 mb-3"
                          />
                        ) : tech.icon ? (
                          <img
                            src={tech.icon}
                            alt={tech.name}
                            className="w-12 h-12 mb-3"
                          />
                        ) : (
                          <div className="w-12 h-12 mb-3 flex items-center justify-center">
                            <span
                              className="text-2xl font-bold"
                              style={{ color: tech.textColor || "#B744B8" }}
                            >
                              {tech.name}
                            </span>
                          </div>
                        )}
                        <span className="text-sm text-text-secondary-dark font-medium">
                          {tech.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Separator 3 */}
        <div className="section-separator">
          <div className="separator-glow"></div>
          <div className="separator-line"></div>
          <div className="separator-icon">🚀</div>
        </div>

        {/* Projects Section */}
        <section
          id="projects"
          className="section-padding section-with-separator"
        >
          <div className="container-max">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 m3-text-primary">
              Featured Projects
            </h2>
            <div className="m3-card bg-surface-container-highest/30 p-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {site.projects.map((p) => (
                  <div
                    key={p.title}
                    className="m3-card-elevated bg-surface-container-highest/30 overflow-hidden card-hover"
                  >
                    <div
                      className={`h-48 flex items-center justify-center border-b border-outline-variant/30 ${
                        p.title === "notemyminds"
                          ? "bg-gradient-to-br from-primary-500/10 via-primary-400/5 to-primary-600/10"
                          : p.title === "Portfolio Website"
                          ? "bg-gradient-to-br from-orange-500/10 via-orange-400/5 to-orange-600/10"
                          : p.title === "HangMeas App"
                          ? "bg-gradient-to-br from-red-500/10 via-orange-400/5 to-yellow-500/10"
                          : "bg-primary-500/20"
                      }`}
                    >
                      {p.title === "notemyminds" ? (
                        <img
                          src={notemymindsIcon}
                          alt={p.title}
                          className="w-32 h-32 object-contain rounded-xl shadow-lg transition-transform duration-200 hover:scale-105"
                        />
                      ) : p.title === "Portfolio Website" ? (
                        <img
                          src={logo}
                          alt={p.title}
                          className="w-32 h-32 object-contain rounded-xl shadow-lg transition-transform duration-200 hover:scale-105"
                        />
                      ) : p.title === "HangMeas App" ? (
                        <img
                          src={hangmeasLogo}
                          alt={p.title}
                          className="w-32 h-32 object-contain rounded-xl shadow-lg transition-transform duration-200 hover:scale-105"
                        />
                      ) : (
                        <span className="text-4xl" aria-hidden="true">
                          {p.icon}
                        </span>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2 m3-text-primary">
                        {p.title}
                      </h3>
                      <p className="text-text-secondary-dark mb-4">
                        {p.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {p.tech.map((t) => (
                          <span
                            key={t}
                            className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-m3-2xl text-sm border border-primary-500/30"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-3">
                        {p.sourceUrl && p.sourceUrl !== "#" ? (
                          <a
                            className="btn-secondary text-sm"
                            href={p.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Source Code
                          </a>
                        ) : null}
                        {p.demoUrl &&
                        p.demoUrl !== "#" &&
                        p.demoUrl.includes("youtu") ? (
                          <a
                            className="flex items-center gap-2 bg-[#FF0000] hover:bg-[#CC0000] active:bg-[#990000] text-white font-medium py-3 px-6 rounded-m3-lg transition-all duration-200 shadow-m3-2 hover:shadow-m3-3 active:shadow-m3-1 text-sm"
                            href={p.demoUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                            </svg>
                            Watch Demo
                          </a>
                        ) : p.demoUrl && p.demoUrl !== "#" ? (
                          <a
                            className="btn-secondary text-sm"
                            href={p.demoUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View Demo
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Separator 4 */}
        <div className="section-separator">
          <div className="separator-glow"></div>
          <div className="separator-line"></div>
          <div className="separator-icon">💼</div>
        </div>

        {/* Experience Section */}
        <section
          id="experience"
          className="section-padding section-with-separator"
        >
          <div className="container-max">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 m3-text-primary">
              Work Experience
            </h2>
            <div className="max-w-4xl mx-auto">
              <div className="m3-card bg-surface-container-highest/30 p-8">
                <div className="space-y-8">
                  {site.experience.map((e) => (
                    <div key={e.role + e.company} className="flex gap-6">
                      <div
                        className="flex-shrink-0 w-16 h-16 bg-primary-500 rounded-m3-3xl flex items-center justify-center text-white font-bold shadow-m3-2"
                        aria-hidden="true"
                      >
                        {e.initials}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-1 m3-text-primary">
                          {e.role}
                        </h3>
                        <p className="text-primary-500 font-medium mb-2">
                          {e.companyUrl ? (
                            <a
                              href={e.companyUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:text-primary-400 underline underline-offset-2 transition-colors"
                            >
                              {e.company}
                            </a>
                          ) : (
                            e.company
                          )}
                        </p>
                        <p className="text-text-secondary-dark mb-3">
                          {e.period}
                        </p>
                        <ul className="text-text-secondary-dark space-y-2">
                          {e.bullets.map((b, i) => (
                            <li key={i}>• {b}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Separator 5 */}
        <div className="section-separator">
          <div className="separator-glow"></div>
          <div className="separator-line"></div>
          <div className="separator-icon">📞</div>
        </div>

        {/* Contact Section */}
        <section id="contact" className="section-padding">
          <div className="container-max">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 m3-text-primary">
              Get In Touch
            </h2>
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12">
                <div className="m3-card bg-surface-container-highest/30 p-8">
                  <h3 className="text-2xl font-semibold mb-6 m3-text-primary">
                    Let's work together!
                  </h3>
                  <p className="text-text-secondary-dark mb-8 leading-relaxed">
                    I'm always interested in new opportunities and exciting
                    projects. Whether you have a question or just want to say
                    hi, feel free to reach out!
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-500 rounded-m3-3xl flex items-center justify-center text-white shadow-m3-1">
                        📧
                      </div>
                      <div>
                        <p className="font-medium m3-text-primary">Email</p>
                        <p className="text-text-secondary-dark">
                          <a
                            className="underline underline-offset-4"
                            href={`mailto:${site.author.email}`}
                          >
                            {site.author.email}
                          </a>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-500 rounded-m3-3xl flex items-center justify-center text-white shadow-m3-1">
                        📱
                      </div>
                      <div>
                        <p className="font-medium m3-text-primary">Phone</p>
                        {site.author.phones.map((ph) => (
                          <p key={ph} className="text-text-secondary-dark">
                            {ph}
                          </p>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-500 rounded-m3-3xl flex items-center justify-center text-white shadow-m3-1">
                        📍
                      </div>
                      <div>
                        <p className="font-medium m3-text-primary">Location</p>
                        <p className="text-text-secondary-dark">
                          {site.author.location}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="m3-card-elevated p-8">
                  <form
                    className="space-y-6"
                    onSubmit={(e) => {
                      e.preventDefault();
                      window.location.href = `mailto:${site.author.email}`;
                    }}
                    aria-label="Contact form"
                  >
                    <div>
                      <label className="block text-sm font-medium text-text-secondary-dark mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-surface-container-high border-2 border-outline-variant rounded-m3-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white placeholder-text-secondary-dark transition-all"
                        placeholder="Your name"
                        aria-label="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary-dark mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        className="w-full px-4 py-3 bg-surface-container-high border-2 border-outline-variant rounded-m3-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white placeholder-text-secondary-dark transition-all"
                        placeholder="your@email.com"
                        aria-label="Your email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary-dark mb-2">
                        Message
                      </label>
                      <textarea
                        rows="4"
                        className="w-full px-4 py-3 bg-surface-container-high border-2 border-outline-variant rounded-m3-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white placeholder-text-secondary-dark transition-all"
                        placeholder="Your message..."
                        aria-label="Your message"
                      ></textarea>
                    </div>
                    <button type="submit" className="w-full btn-primary">
                      Send Message
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-surface-950 text-white py-12 border-t border-surface-800">
          <div className="container-max text-center">
            <div className="flex justify-center space-x-6 mb-6">
              <a
                href="https://github.com/hulsambath"
                className="text-text-secondary-dark hover:text-primary-400 transition-colors"
              >
                <span className="sr-only">GitHub</span>
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com/in/hulsambath"
                className="text-text-secondary-dark hover:text-primary-400 transition-colors"
              >
                <span className="sr-only">LinkedIn</span>
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a
                href="https://x.com/hul_sambath"
                className="text-text-secondary-dark hover:text-primary-400 transition-colors"
              >
                <span className="sr-only">X</span>
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
            <p className="text-text-secondary-dark">
              © 2024 Sambath. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
