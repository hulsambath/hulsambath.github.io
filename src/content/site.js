export const site = {
  author: {
    name: "Sambath HUL",
    title: "Software Engineer",
    email: "hulsambath14@gmail.com",
    phones: ["+855 88 708 5187", "+855 76 708 5187"],
    location: "Phnom Penh, Cambodia",
    age: 22,
    social: {
      github: "https://github.com/hulsambath",
      linkedin: "https://www.linkedin.com/in/hulsambath/",
      x: "https://x.com/hul_sambath",
    },
  },
  stats: [
    { label: "Years Experience", value: "2+" },
    { label: "Production Apps", value: "4" },
    { label: "Platform Targets", value: "6" },
  ],
  skills: {
    mobile: [
      {
        name: "Flutter",
        years: "3 yrs",
        icon: "/assets/flutter_logo.svg",
      },
      {
        name: "Dart",
        years: "3 yrs",
        icon: "/assets/dart_logo.svg",
      },
      {
        name: "MVVM Architecture",
        years: "2 yrs",
        icon: "/assets/android_logo.svg",
      },
      {
        name: "Firebase",
        years: "2 yrs",
        icon: "/assets/firebase_logo.svg",
      },
    ],
    web: [
      {
        name: "React",
        years: "2 yrs",
        icon: "/assets/react_logo.svg",
      },
      {
        name: "JavaScript",
        years: "3 yrs",
        icon: "/assets/javascript_logo.svg",
      },
      {
        name: "Tailwind CSS",
        years: "1 yr",
        icon: "/assets/tailwindcss_logo.svg",
      },
      {
        name: "Vite",
        years: "1 yr",
        icon: "/assets/vite_logo.svg",
      },
    ],
    tools: [
      {
        name: "Git & GitHub",
        years: "3 yrs",
        icon: "/assets/github_logo.svg",
      },
      {
        name: "CI/CD (GitHub Actions)",
        years: "2 yrs",
        icon: "/assets/githubactions_logo.svg",
      },
      {
        name: "Figma",
        years: "2 yrs",
        icon: "/assets/figma_logo.svg",
      },
      {
        name: "Testing & QA",
        years: "2 yrs",
        icon: "/assets/testinglibrary_logo.svg",
      },
    ],
  },
  technologies: {
    languages: [
      { name: "Dart", icon: "/assets/dart_logo.svg" },
      {
        name: "JavaScript",
        icon: "/assets/javascript_logo.svg",
      },
      {
        name: "Java",
        icon: "/assets/java_logo.svg",
      },
      { name: "Kotlin", icon: "/assets/kotlin_logo.svg" },
    ],
    frameworks: [
      { name: "Flutter", icon: "/assets/flutter_logo.svg" },
      { name: "React", icon: "/assets/react_logo.svg" },
      { name: "Vite", icon: "/assets/vite_logo.svg" },
    ],
    backend: [
      { name: "Firebase", icon: "/assets/firebase_logo.svg" },
      {
        name: "Google Cloud",
        icon: "/assets/googlecloud_logo.svg",
      },
    ],
    tools: [
      { name: "Git", icon: "/assets/git_logo.svg" },
      { name: "GitHub", icon: "/assets/github_logo.svg" },
      {
        name: "GitHub Actions",
        icon: "/assets/githubactions_logo.svg",
      },
      { name: "Figma", icon: "/assets/figma_logo.svg" },
      { name: "Postman", icon: "/assets/postman_logo.svg" },
      { name: "ADB", icon: "/assets/android_logo.svg" },
      { name: "asdf", icon: null, textColor: "#B744B8" },
      {
        name: "VS Code",
        icon: "/assets/vscode_logo.svg",
      },
      { name: "Cursor", icon: "/assets/cursor_logo.svg" },
      { name: "Docker", icon: "/assets/docker_logo.svg" },
      { name: "ChatGPT", icon: "/assets/chatgpt_logo.svg" },
      {
        name: "FlutterFire CLI",
        icon: "/assets/firebase_logo.svg",
      },
      {
        name: "Google Play Console",
        icon: "/assets/playconsole_icon.png",
      },
      { name: "Fastlane", icon: "/assets/fastlane_logo.svg" },
    ],
    architecture: [
      { name: "MVVM", icon: "/assets/android_logo.svg" },
      { name: "Provider", icon: "/assets/flutter_logo.svg" },
    ],
    developmentEnvironment: [
      { name: "Ubuntu", icon: "/assets/ubuntu_logo.svg" },
      { name: "ADB", icon: "/assets/android_logo.svg" },
      { name: "asdf", icon: null, textColor: "#B744B8" },
      { name: "Cursor", icon: "/assets/cursor_logo.svg" },
      { name: "Docker", icon: "/assets/docker_logo.svg" },
      { name: "MCP Server", icon: null, useLocalImage: true },
    ],
  },
  projects: [
    {
      icon: "🚌",
      title: "BookMeBus",
      image: "/assets/bookmebus_icon.jpg",
      description:
        "Flagship consumer travel super-app covering five booking verticals — bus, ferry, hotel, airport transfer, and private taxi — across 80+ screen modules. Features ABA PayWay payments, live chat & customer service, coupon/promo codes, multi-language, push notifications, booking & transaction history, and privacy-compliance flows.",
      tech: ["Flutter", "Dart", "ABA PayWay", "Firebase", "Provider"],
      demoUrl: null,
      sourceUrl: null,
      playStoreUrl:
        "https://play.google.com/store/apps/details?id=com.bookmebus.bookmebus",
      appStoreUrl:
        "https://apps.apple.com/in/app/bookmebus-bus-ferry-and-taxi/id1101077306",
      company: "BookMeBus Co., Ltd.",
    },
    {
      icon: "🚍",
      title: "iBus",
      image: "/assets/ibus_icon.jpg",
      description:
        "A branded bus operator app built and released to production from a shared white-label Flutter codebase with a flavor-based build system. Owns its configs, signing key, theme, and Android source set, with dedicated feature work (search-trip UI, departure-date scrolling). Built on the React Native → Flutter migration of the operator platform.",
      tech: ["Flutter", "Dart", "Flavors", "Firebase", "CI/CD"],
      demoUrl: null,
      sourceUrl: null,
      playStoreUrl:
        "https://play.google.com/store/apps/details?id=com.bookmebus.ibus",
      appStoreUrl: "https://apps.apple.com/in/app/ibus-express/id6756961793",
      company: "BookMeBus Co., Ltd.",
    },
    {
      icon: "🚐",
      title: "BS Bus Cambodia",
      image: "/assets/bsbus_icon.jpg",
      description:
        "A branded operator app (the `bstransport` flavor) released to production from the same shared white-label Flutter codebase, with its own theme, configs, and assets. Part of the operator platform’s flavor-based multi-brand build system.",
      tech: ["Flutter", "Dart", "Flavors", "Firebase"],
      demoUrl: null,
      sourceUrl: null,
      playStoreUrl:
        "https://play.google.com/store/apps/details?id=com.bookmebus.bstransport",
      appStoreUrl: "https://apps.apple.com/in/app/bs-bus-cambodia/id6754649294",
      company: "BookMeBus Co., Ltd.",
    },
    {
      icon: "🎬",
      title: "HangMeas App",
      image: "/assets/hangmeas_icon.jpg",
      description:
        "An all-in-one entertainment & live-voting platform — YouTube live-stream integration with real-time viewer counts, an interactive vote tap-counter for national TV shows (Got Talent, The Voice Cambodia), event & show details, ticketing, in-app vote top-up, social login, and maps. Primary author/maintainer (358 commits) across 6 platform targets on a multi-tenant MVVM monorepo.",
      tech: [
        "Flutter",
        "Dart",
        "Firebase",
        "YouTube Live",
        "In-App Purchase",
        "MVVM",
      ],
      demoUrl: "https://youtube.com/watch?v=PtlsVe9Ljvk",
      sourceUrl: null,
      playStoreUrl:
        "https://play.google.com/store/apps/details?id=com.hangmeas.app",
      appStoreUrl:
        "https://apps.apple.com/in/app/hang-meas-mobile/id6748306637",
      company: "Company Project",
    },
    {
      icon: "🔍",
      title: "Trovara",
      image: "/assets/trovara_icon.svg",
      description:
        "AI-powered personal notes app with a full RAG pipeline for semantic chat over your notes — vector search, query rewriting, and multi-LLM support (Gemini / OpenAI / OpenRouter). Builds a knowledge graph linking related notes, generates quizzes from your content, and surfaces analytics in an Insights tab. Imports from Obsidian, Notion, and Storypad; bidirectional Google Drive sync; offline-first ObjectBox storage; English/Khmer i18n; and a Pro tier with Google Play billing. Built with MVVM and Shorebird OTA updates.",
      tech: [
        "Flutter",
        "Dart",
        "ObjectBox",
        "RAG",
        "Knowledge Graph",
        "Google Drive API",
        "In-App Purchase",
        "MVVM",
      ],
      demoUrl: null,
      sourceUrl: null,
      playStoreUrl: null,
      appStoreUrl: null,
    },
    {
      icon: "🚍",
      title: "Oudong Express",
      image: "/assets/oudong_icon.jpg",
      description:
        "A second tenant proving out the multi-tenant white-label architecture, sharing a common core package with dedicated prod/staging flavors and Firebase configs. Includes documented performance-optimization work across the shared 25K-LOC reusable core of HTTP clients, models, and services.",
      tech: ["Flutter", "Dart", "MVVM", "Firebase", "Multi-tenant"],
      demoUrl: null,
      sourceUrl: null,
      playStoreUrl:
        "https://play.google.com/store/apps/details?id=com.oudongexpress.app",
      appStoreUrl: "https://apps.apple.com/us/app/oudong-express/id6761469150",
      company: "Company Project",
    },
    {
      icon: "🛠️",
      title: "Developer Tooling",
      description:
        "AI-assisted development infrastructure: a Dockerized Node.js MCP (Model Context Protocol) HTTP bridge server, a published VS Code extension for copying file references, plus custom Claude Code skills, hooks, and style-guide automation (MVVM, Repository pattern, i18n, tests) across the monorepos.",
      tech: ["Node.js", "Docker", "MCP", "VS Code Extension"],
      demoUrl: null,
      sourceUrl: null,
    },
    {
      icon: "🌐",
      title: "Portfolio Website",
      image: "/assets/portfolio_icon.svg",
      description:
        "Modern, responsive portfolio website built with React and Tailwind CSS. Features smooth animations, dark mode, mobile-first design, SEO optimization, and automated GitHub Pages deployment.",
      tech: ["React", "Tailwind CSS", "Vite", "GitHub Actions"],
      demoUrl: null,
      sourceUrl: "https://github.com/hulsambath/hulsambath.github.io",
    },
  ],
  experience: [
    {
      initials: "BM",
      role: "Software Engineer (Mobile)",
      company: "BookMeBus Co., Ltd.",
      companyUrl: "https://bookmebus.com/en/about_us",
      period: "June 2024 – Present",
      bullets: [
        "Ship and maintain BookMeBus, a multi-vertical travel super-app (bus, ferry, hotel, airport transfer, private taxi) with ABA PayWay payments, live chat, coupons, and multi-language support across 80+ screen modules",
        "Built and released two branded operator apps — iBus and BS Bus Cambodia — from a single flavor-based white-label Flutter codebase, and contributed to the React Native → Flutter migration",
        "Set up projects using MVVM + Repository architecture with a clean, observable, testable code structure; integrated push notifications and privacy-compliance flows",
        "Delivered cross-platform apps spanning up to 6 OS targets from one Flutter codebase, with code-gen pipelines and full i18n",
        "Created test cases, performed QA, and released apps to the Google Play Store",
      ],
    },
    {
      initials: "CM",
      role: "Flutter Developer Intern",
      company: "CamMob Co., Ltd.",
      companyUrl: "https://www.cam-mob.com/",
      period: "January 2024 – April 2024",
      bullets: [
        "Assisted in building Flutter mobile applications in a collaborative environment",
        "Worked with senior developers on state management, API integration, and UI improvements",
        "Improved teamwork, debugging, and development workflows through hands-on mentorship",
      ],
    },
    {
      initials: "N",
      role: "Software Engineer - notemyminds",
      company: "Personal Project",
      companyUrl: null,
      period: "2023 - Present",
      bullets: [
        "Architected and developed notemyminds, a cross-platform note-taking app with MVVM pattern",
        "Implemented Google Drive synchronization with conflict resolution and offline-first architecture",
        "Built comprehensive tagging system with analytics and insights generation",
        "Designed and implemented internationalization support (English/Khmer) with easy_localization",
        "Created robust CI/CD pipeline with automated builds and credential management using SOPS",
      ],
    },
  ],
  testimonials: [
    {
      quote:
        "Sambath delivered our app on time with outstanding quality. Highly recommend.",
      author: "Chan Sophea",
      role: "Product Manager, TechCorp Solutions",
    },
    {
      quote:
        "Great collaborator and problem solver. Elevated our codebase and release cadence.",
      author: "Kim Dara",
      role: "Engineering Lead, MobileFirst Inc",
    },
  ],
  resume: {
    href: "/resume.pdf",
    filename: "Sambath-Resume.pdf",
  },
};
