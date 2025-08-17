import { useEffect, useState } from 'react';
import { site } from './content/site.js';

export default function App() {
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'skills', 'projects', 'experience', 'contact'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;
          
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background-dark text-text-primary-dark relative overflow-hidden">
      {/* Animated Background Circles */}
      <div className="animated-circles">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="fixed top-0 w-full glass-nav border-b border-surface-700 z-50">
          <div className="container-max px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="text-xl font-bold gradient-text" aria-label="Brand name">{site.author.name}</div>
              <div className="hidden md:flex space-x-8">
                {['home', 'about', 'skills', 'projects', 'experience', 'contact'].map((section) => (
                  <button
                    key={section}
                    onClick={() => scrollToSection(section)}
                    className={`capitalize transition-colors duration-200 ${
                      activeSection === section
                        ? 'text-primary-500 font-medium'
                        : 'text-text-secondary-dark hover:text-primary-400'
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
        <section id="home" className="section-padding pt-24 glass-bg section-with-separator">
          <div className="container-max text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                Hi, I'm <span className="gradient-text">{site.author.name}</span> 👋
              </h1>
              <p className="text-xl md:text-2xl text-text-secondary-dark mb-8 max-w-3xl mx-auto">
                {site.author.title} passionate about creating exceptional mobile and web experiences
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="btn-primary" onClick={() => scrollToSection('projects')} aria-label="View my work">View My Work</button>
                <a className="btn-secondary text-center" href={site.resume.href} download={site.resume.filename} aria-label="Download resume">Download Resume</a>
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
        <section id="about" className="section-padding glass-bg section-with-separator">
          <div className="container-max">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 m3-text-primary">About Me</h2>
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <p className="text-lg text-text-secondary-dark mb-6 leading-relaxed">
                    I'm a dedicated software engineer with expertise in Flutter and React development. I love building user-centric applications that solve real-world problems and deliver exceptional user experiences.
                  </p>
                  <p className="text-lg text-text-secondary-dark mb-6 leading-relaxed">
                    With a strong foundation in mobile and web development, I specialize in creating scalable, maintainable, and performant applications that users love to interact with.
                  </p>
                  <div className="flex gap-4">
                    {site.stats.map((s) => (
                      <div key={s.label} className="text-center">
                        <div className="text-2xl font-bold text-primary-500">{s.value}</div>
                        <div className="text-sm text-text-secondary-dark">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-primary-500/10 rounded-2xl p-8 border border-primary-500/20">
                  <h3 className="text-xl font-semibold mb-4 m3-text-primary">What I Do</h3>
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
                      API Development
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
        <section id="skills" className="section-padding glass-bg section-with-separator">
          <div className="container-max">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 m3-text-primary">Skills & Technologies</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="glass-card p-6 rounded-xl card-hover border border-surface-700">
                <h3 className="text-xl font-semibold mb-4 text-primary-500">Mobile Development</h3>
                <div className="space-y-3">
                  {site.skills.mobile.map((sk) => (
                    <div key={sk.name} className="flex justify-between items-center">
                      <span className="text-text-secondary-dark">{sk.name}</span>
                      <div className="w-24 bg-surface-600 rounded-full h-2" aria-hidden="true">
                        <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${sk.levelPct}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-6 rounded-xl card-hover border border-surface-700">
                <h3 className="text-xl font-semibold mb-4 text-primary-500">Web Development</h3>
                <div className="space-y-3">
                  {site.skills.web.map((sk) => (
                    <div key={sk.name} className="flex justify-between items-center">
                      <span className="text-text-secondary-dark">{sk.name}</span>
                      <div className="w-24 bg-surface-600 rounded-full h-2" aria-hidden="true">
                        <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${sk.levelPct}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-6 rounded-xl card-hover border border-surface-700">
                <h3 className="text-xl font-semibold mb-4 text-primary-500">Tools & Others</h3>
                <div className="space-y-3">
                  {site.skills.tools.map((sk) => (
                    <div key={sk.name} className="flex justify-between items-center">
                      <span className="text-text-secondary-dark">{sk.name}</span>
                      <div className="w-24 bg-surface-600 rounded-full h-2" aria-hidden="true">
                        <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${sk.levelPct}%` }}></div>
                      </div>
                    </div>
                  ))}
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
        <section id="projects" className="section-padding glass-bg section-with-separator">
          <div className="container-max">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 m3-text-primary">Featured Projects</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {site.projects.map((p) => (
                <div key={p.title} className="glass-card rounded-xl overflow-hidden card-hover border border-surface-700">
                  <div className="h-48 bg-primary-500/10 flex items-center justify-center border-b border-surface-700">
                    <span className="text-4xl" aria-hidden="true">{p.icon}</span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 m3-text-primary">{p.title}</h3>
                    <p className="text-text-secondary-dark mb-4">{p.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {p.tech.map((t) => (
                        <span key={t} className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm border border-primary-500/30">{t}</span>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <a className="btn-primary text-sm" href={p.demoUrl} target="_blank" rel="noreferrer">View Demo</a>
                      <a className="btn-secondary text-sm" href={p.sourceUrl} target="_blank" rel="noreferrer">Source Code</a>
                    </div>
                  </div>
                </div>
              ))}
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
        <section id="experience" className="section-padding section-with-separator">
          <div className="container-max">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 m3-text-primary">Work Experience</h2>
            <div className="max-w-4xl mx-auto">
              <div className="space-y-8">
                {site.experience.map((e) => (
                  <div key={e.role + e.company} className="flex gap-6">
                    <div className="flex-shrink-0 w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold" aria-hidden="true">
                      {e.initials}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-1 m3-text-primary">{e.role}</h3>
                      <p className="text-primary-500 font-medium mb-2">{e.company}</p>
                      <p className="text-text-secondary-dark mb-3">{e.period}</p>
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
        </section>

        {/* Separator 5 */}
        <div className="section-separator">
          <div className="separator-glow"></div>
          <div className="separator-line"></div>
          <div className="separator-icon">📞</div>
        </div>

        {/* Contact Section */}
        <section id="contact" className="section-padding glass-bg">
          <div className="container-max">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 m3-text-primary">Get In Touch</h2>
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12">
                <div>
                  <h3 className="text-2xl font-semibold mb-6 m3-text-primary">Let's work together!</h3>
                  <p className="text-text-secondary-dark mb-8 leading-relaxed">
                    I'm always interested in new opportunities and exciting projects. 
                    Whether you have a question or just want to say hi, feel free to reach out!
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white">
                        📧
                      </div>
                      <div>
                        <p className="font-medium m3-text-primary">Email</p>
                        <p className="text-text-secondary-dark"><a className="underline underline-offset-4" href={`mailto:${site.author.email}`}>{site.author.email}</a></p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white">
                        📱
                      </div>
                      <div>
                        <p className="font-medium m3-text-primary">Phone</p>
                        {site.author.phones.map((ph) => (
                          <p key={ph} className="text-text-secondary-dark">{ph}</p>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white">
                        📍
                      </div>
                      <div>
                        <p className="font-medium m3-text-primary">Location</p>
                        <p className="text-text-secondary-dark">{site.author.location}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="glass-card p-8 rounded-xl border border-surface-700">
                  <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); window.location.href = `mailto:${site.author.email}`; }} aria-label="Contact form">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary-dark mb-2">Name</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-surface-700 border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-text-secondary-dark"
                        placeholder="Your name"
                      aria-label="Your name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary-dark mb-2">Email</label>
                      <input
                        type="email"
                        className="w-full px-4 py-3 bg-surface-700 border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-text-secondary-dark"
                        placeholder="your@email.com"
                      aria-label="Your email" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary-dark mb-2">Message</label>
                      <textarea
                        rows="4"
                        className="w-full px-4 py-3 bg-surface-700 border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-text-secondary-dark"
                        placeholder="Your message..."
                      aria-label="Your message"></textarea>
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
              <a href="https://github.com/hulsambath" className="text-text-secondary-dark hover:text-primary-400 transition-colors">
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a href="https://linkedin.com/in/hulsambath" className="text-text-secondary-dark hover:text-primary-400 transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="https://twitter.com/your-handle" className="text-text-secondary-dark hover:text-primary-400 transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
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
