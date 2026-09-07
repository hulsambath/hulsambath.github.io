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
    { label: "Years Experience", value: "3" },
    { label: "Apps Built & Shipped", value: "8" },
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
      company: "BookMeBus Co., Ltd.",
    },
    {
      icon: "🚍",
      title: "Oudong Express",
      image: "/assets/oudong_icon.jpg",
      description:
        "Get flexibility of rental options from daily, weekly, monthly, yearly with or without driver.",
      tech: ["Flutter", "Dart", "MVVM", "Firebase", "Multi-tenant"],
      demoUrl: null,
      sourceUrl: null,
      playStoreUrl:
        "https://play.google.com/store/apps/details?id=com.oudongexpress.app",
      appStoreUrl: "https://apps.apple.com/us/app/oudong-express/id6761469150",
      company: "BookMeBus Co., Ltd.",
    },
    {
      icon: "🚍",
      title: "iBUS",
      image: "/assets/ibus_icon.jpg",
      description:
        "iBUS offers safe, comfortable, and fast trips from Phnom Penh to Siem Reap. Travel in style with VIP Galaxy Vibe buses featuring spacious seats, reliable schedules, and easy online booking.",
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
        "BS Bus Cambodia is equipped with First-Class seating, VIP restrooms, a refreshing and comfortable atmosphere, safe driving, punctual departure times, hygienic meals/snacks, and full passenger insurance.",
      tech: ["Flutter", "Dart", "Flavors", "Firebase"],
      demoUrl: null,
      sourceUrl: null,
      playStoreUrl:
        "https://play.google.com/store/apps/details?id=com.bookmebus.bstransport",
      appStoreUrl: "https://apps.apple.com/in/app/bs-bus-cambodia/id6754649294",
      company: "BookMeBus Co., Ltd.",
    },
    {
      icon: "🌾",
      title: "CAO Farm Book",
      image: "/assets/caofarmbook_icon.jpg",
      description:
        "Agricultural farm management and record-keeping mobile application built with Flutter. Enables farmers and agricultural operators to log crop growth cycles, manage livestock records, monitor operational expenses, and synchronize field data with backend APIs.",
      tech: ["Flutter", "Dart", "REST API", "SQLite", "Provider"],
      demoUrl: null,
      sourceUrl: null,
      playStoreUrl:
        "https://play.google.com/store/apps/details?id=com.cammob.cao.farmbook",
      appStoreUrl:
        "https://apps.apple.com/kh/app/cao-farmbook-app/id6499300018",
      company: "CamMob Co., Ltd.",
    },
    {
      icon: "🏥",
      title: "VisionCareAI Detect & Consult",
      image: "/assets/visioncareai_icon.png",
      description:
        "Full-stack ophthalmic diagnostic and teleconsultation platform featuring a dual-stage ML pipeline (DenseNet disease classification + binary eye verification) with OpenCV CLAHE enhancement. Built with a hybrid inference engine combining cloud REST APIs and on-device TFLite fallback for offline operation, backed by a Laravel 11 Sanctum API and a Cupertino-styled Flutter mobile app with bilingual Khmer/English support.",
      tech: [
        "Flutter",
        "Dart",
        "TensorFlow Lite",
        "Python / Flask",
        "OpenCV",
        "Laravel 11",
        "Sanctum",
        "Provider",
      ],
      demoUrl: null,
      sourceUrl: "https://github.com/LengTech11/VisionCareAI-Detect-Consult",
      playStoreUrl: null,
      appStoreUrl: null,
      company: "School Project (CADT Capstone)",
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
      demoUrl: "https://photos.app.goo.gl/6zSm1oMRhwm6ByxFA",
      sourceUrl: null,
      playStoreUrl: null,
      appStoreUrl: null,
      company: "Personal Project",
    },
    {
      icon: "🍿",
      title: "Netflix Clone",
      image: "/assets/netflix_icon.png",
      description:
        "Feature-rich mobile entertainment streaming interface built with Flutter. Integrates TMDb RESTful APIs for trending movie discovery, category carousels, detailed synopsis modals, high-resolution poster caching, and video trailer playback.",
      tech: [
        "Flutter",
        "Dart",
        "REST API",
        "CachedNetworkImage",
        "Lottie",
        "CarouselSlider",
      ],
      demoUrl: null,
      sourceUrl: "https://github.com/hulsambath/netflex_api",
      playStoreUrl: null,
      appStoreUrl: null,
      company: "Personal Project",
    },
    {
      icon: "🚌",
      title: "BookMeBus",
      image: "/assets/bookmebus_icon.jpg",
      description:
        "Leading bus, ferry, and private taxi ticketing portal in Cambodia and Southeast Asia, connecting travelers with over 40 bus operators across Cambodia, Vietnam, Laos, and Thailand for simple, safe, and secure online bookings.",
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
        "Ship and maintain BookMeBus, a multi-vertical travel app (bus, ferry, hotel, airport transfer, private taxi) with ABA PayWay payments, live chat, coupons, and multi-language support across 80+ screen modules",
        "Built and shipped 4 production mobile apps at BMB: Hang Meas (live TV voting & event streaming), Oudong Express, iBUS, and BS Bus Cambodia from a flavor-based white-label Flutter architecture",
        "Contributed to the production React Native → Flutter migration of the operator platform and optimized reusable shared core packages",
        "Architected observable, testable mobile code using MVVM + Repository pattern, push notifications, and store privacy-compliance flows",
        "Created test cases, conducted QA, and managed production releases to the Google Play Store and Apple App Store",
      ],
    },
    {
      initials: "VC",
      role: "Lead Full-Stack & ML Mobile Engineer",
      company: "VisionCareAI (School Project / CADT Capstone)",
      companyUrl: "https://github.com/LengTech11/VisionCareAI-Detect-Consult",
      period: "2024 – 2025",
      bullets: [
        "Architected an end-to-end AI healthcare mobile ecosystem combining Flutter 3.38+, Laravel 11 API, and a Python Flask ML microservice",
        "Engineered a hybrid AI inference architecture (OnDeviceAiService) that queries cloud APIs when connected and falls back to on-device TFLite models for seamless offline diagnosis",
        "Integrated a dual-stage vision pipeline featuring CLAHE (Contrast Limited Adaptive Histogram Equalization) preprocessing, binary eye verification, and 5-class DenseNet ophthalmic classification",
        "Built a production-ready Laravel 11 RESTful backend featuring Sanctum bearer token auth, layered Service-Controller architecture, 18 database migrations, and localized Cambodian doctor/clinic seed data",
        "Designed an iOS Cupertino-first mobile UI with bilingual Khmer/English i18n, zero-overflow typography, photo picker/camera workflows, and dynamic local network host auto-discovery",
      ],
    },
    {
      initials: "CM",
      role: "Flutter Developer Intern",
      company: "CamMob Co., Ltd.",
      companyUrl: "https://www.cam-mob.com/",
      period: "January 2024 – April 2024",
      bullets: [
        "Developed CAO Farm Book, an agricultural farm management mobile application in Flutter for field data logging, crop tracking, and livestock records",
        "Worked with senior developers on state management, SQLite offline data caching, REST API integration, and responsive mobile UI improvements",
        "Practiced collaborative Agile workflows, code reviews, and cross-functional team debugging",
      ],
    },
    {
      initials: "P",
      role: "Software Engineer (Mobile & AI)",
      company: "Personal Projects (Trovara & Netflix Clone)",
      companyUrl: null,
      period: "2023 – Present",
      bullets: [
        "Architected and shipped Trovara, an AI-powered cross-platform notes app with MVVM + Repository pattern, offline-first ObjectBox storage, and a full RAG semantic vector search pipeline",
        "Built a Flutter Netflix Clone streaming interface integrating TMDb RESTful APIs, high-performance image caching, dynamic carousels, and trailer preview playback",
        "Implemented bidirectional Google Drive sync with conflict resolution, knowledge graphs, and quiz generation from user notes",
        "Integrated Google Play in-app purchases, bilingual Khmer/English i18n, Shorebird OTA updates, and automated CI/CD pipelines",
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
