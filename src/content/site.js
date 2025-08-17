export const site = {
  author: {
    name: 'Sambath HUL',
    title: 'Flutter Developer',
    email: 'hulsambath14@gmail.com',
    phones: ['+855 88 708 518 7', '+855 76 708 518 7'],
    location: 'Phnom Penh, Cambodia',
    age: 22,
    social: {
      github: 'https://github.com/hulsambath',
      linkedin: 'https://www.linkedin.com/in/hulsambath/',
      x: 'https://x.com/hul_sambath'
    }
  },
  stats: [
    { label: 'Years Experience', value: '2+' },
    { label: 'Projects Completed', value: '10+' },
    { label: 'Play Store Apps', value: '2+' }
  ],
  skills: {
    mobile: [
      { name: 'Flutter', levelPct: 95, icon: 'https://cdn.simpleicons.org/flutter/02569B' },
      { name: 'Dart', levelPct: 90, icon: 'https://cdn.simpleicons.org/dart/0175C2' },
      { name: 'MVVM Architecture', levelPct: 88, icon: 'https://cdn.simpleicons.org/android/3DDC84' },
      { name: 'Firebase', levelPct: 85, icon: 'https://cdn.simpleicons.org/firebase/FFCA28' }
    ],
    web: [
      { name: 'React', levelPct: 85, icon: 'https://cdn.simpleicons.org/react/61DAFB' },
      { name: 'JavaScript', levelPct: 80, icon: 'https://cdn.simpleicons.org/javascript/F7DF1E' },
      { name: 'Tailwind CSS', levelPct: 85, icon: 'https://cdn.simpleicons.org/tailwindcss/06B6D4' },
      { name: 'Vite', levelPct: 85, icon: 'https://cdn.simpleicons.org/vite/646CFF' }
    ],
    tools: [
      { name: 'Git & GitHub', levelPct: 92, icon: 'https://cdn.simpleicons.org/github/181717' },
      { name: 'CI/CD (GitHub Actions)', levelPct: 88, icon: 'https://cdn.simpleicons.org/githubactions/2088FF' },
      { name: 'Figma', levelPct: 85, icon: 'https://cdn.simpleicons.org/figma/F24E1E' },
      { name: 'Testing & QA', levelPct: 80, icon: 'https://cdn.simpleicons.org/testinglibrary/E33332' }
    ]
  },
  technologies: {
    languages: [
      { name: 'Dart', icon: 'https://cdn.simpleicons.org/dart/0175C2' },
      { name: 'JavaScript', icon: 'https://cdn.simpleicons.org/javascript/F7DF1E' },
      { name: 'Java', icon: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/java/java-original.svg' },
      { name: 'Kotlin', icon: 'https://cdn.simpleicons.org/kotlin/7F52FF' }
    ],
    frameworks: [
      { name: 'Flutter', icon: 'https://cdn.simpleicons.org/flutter/02569B' },
      { name: 'React', icon: 'https://cdn.simpleicons.org/react/61DAFB' },
      { name: 'Vite', icon: 'https://cdn.simpleicons.org/vite/646CFF' }
    ],
    backend: [
      { name: 'Firebase', icon: 'https://cdn.simpleicons.org/firebase/FFCA28' },
      { name: 'Google Cloud', icon: 'https://cdn.simpleicons.org/googlecloud/4285F4' }
    ],
    tools: [
      { name: 'Git', icon: 'https://cdn.simpleicons.org/git/F05032' },
      { name: 'GitHub', icon: 'https://cdn.simpleicons.org/github/181717' },
      { name: 'GitHub Actions', icon: 'https://cdn.simpleicons.org/githubactions/2088FF' },
      { name: 'Figma', icon: 'https://cdn.simpleicons.org/figma/F24E1E' },
      { name: 'Postman', icon: 'https://cdn.simpleicons.org/postman/FF6C37' },
      { name: 'ADB', icon: 'https://cdn.simpleicons.org/android/3DDC84' },
      { name: 'asdf', icon: null, textColor: '#B744B8' },
      { name: 'VS Code', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg' },
      { name: 'Cursor', icon: 'https://cdn.simpleicons.org/cursor/000000' },
      { name: 'Docker', icon: 'https://cdn.simpleicons.org/docker/2496ED' },
      { name: 'ChatGPT', icon: 'https://cdn.simpleicons.org/openai/412991' },
      { name: 'FlutterFire CLI', icon: 'https://cdn.simpleicons.org/firebase/FFCA28' },
      { name: 'Google Play Console', icon: 'https://cdn.simpleicons.org/googleplay/414141' },
      { name: 'Fastlane', icon: 'https://cdn.simpleicons.org/fastlane/00F200' }
    ],
    architecture: [
      { name: 'MVVM', icon: 'https://cdn.simpleicons.org/android/3DDC84' },
      { name: 'Provider', icon: 'https://cdn.simpleicons.org/flutter/02569B' }
    ],
    developmentEnvironment: [
      { name: 'Ubuntu', icon: 'https://cdn.simpleicons.org/ubuntu/E95420' },
      { name: 'ADB', icon: 'https://cdn.simpleicons.org/android/3DDC84' },
      { name: 'asdf', icon: null, textColor: '#B744B8' },
      { name: 'Cursor', icon: 'https://cdn.simpleicons.org/cursor/000000' },
      { name: 'Docker', icon: 'https://cdn.simpleicons.org/docker/2496ED' },
      { name: 'MCP Server', icon: null, useLocalImage: true },
    ]
  },
  projects: [
    {
      icon: '📝',
      title: 'notemyminds',
      description:
        'A comprehensive Flutter note-taking app with rich text editing, advanced tagging system, Google Drive sync, analytics, and cross-platform support. Built with MVVM architecture, ObjectBox, and Provider state management.',
      tech: ['Flutter', 'Dart', 'ObjectBox', 'Google Drive API', 'Provider'],
      demoUrl: null,
      sourceUrl: 'https://github.com/hulsambath/notemyminds'
    },
    {
      icon: '🎬',
      title: 'HangMeas App',
      description:
        'An all-in-one entertainment platform mobile app where users can book tickets for live TV shows (Got Talent, The Voice Cambodia) and stream movies and series. Built with MVP approach focusing on core features like ticket booking and streaming.',
      tech: ['Flutter', 'Dart', 'Firebase', 'MVVM', 'State Management'],
      demoUrl: 'https://youtube.com/watch?v=PtlsVe9Ljvk',
      sourceUrl: null,
      company: 'Company Project'
    },
    {
      icon: '🌐',
      title: 'Portfolio Website',
      description:
        'Modern, responsive portfolio website built with React and Tailwind CSS. Features smooth animations, dark mode, mobile-first design, SEO optimization, and automated GitHub Pages deployment.',
      tech: ['React', 'Tailwind CSS', 'Vite', 'GitHub Actions'],
      demoUrl: null,
      sourceUrl: 'https://github.com/hulsambath/hulsambath.github.io'
    },
    {
      icon: '🍔',
      title: 'YandexEats Clone',
      description:
        'Food delivery mobile application built with Flutter, featuring restaurant listings, order management, real-time tracking, and payment integration. Cross-platform support for Android and iOS.',
      tech: ['Flutter', 'Dart', 'Firebase', 'State Management'],
      demoUrl: '#',
      sourceUrl: 'https://github.com/hulsambath/YandexEats'
    }
  ],
  experience: [
    {
      initials: 'BM',
      role: 'Flutter Developer',
      company: 'BookMeBus Co., Ltd.',
      companyUrl: 'https://bookmebus.com/en/about_us',
      period: 'June 2024 – Present',
      bullets: [
        'Contributed to the development of BookMe+, a mobile app for event e-ticketing',
        'Implemented features for browsing events, purchasing tickets, and processing secure payments through ABA Payway integration',
        'Set up the project using MVVM architecture with a clean and observable code structure',
        'Created test cases, performed QA testing, and successfully released the Android app to the Google Play Store'
      ]
    },
    {
      initials: 'CM',
      role: 'Flutter Developer Intern',
      company: 'CamMob Co., Ltd.',
      companyUrl: 'https://www.cam-mob.com/',
      period: 'January 2024 – April 2024',
      bullets: [
        'Assisted in building Flutter mobile applications in a collaborative environment',
        'Worked with senior developers on state management, API integration, and UI improvements',
        'Improved teamwork, debugging, and development workflows through hands-on mentorship'
      ]
    },
    {
      initials: 'N',
      role: 'Flutter Developer - notemyminds',
      company: 'Personal Project',
      companyUrl: null,
      period: '2023 - Present',
      bullets: [
        'Architected and developed notemyminds, a cross-platform note-taking app with MVVM pattern',
        'Implemented Google Drive synchronization with conflict resolution and offline-first architecture',
        'Built comprehensive tagging system with analytics and insights generation',
        'Designed and implemented internationalization support (English/Khmer) with easy_localization',
        'Created robust CI/CD pipeline with automated builds and credential management using SOPS'
      ]
    }
  ],
  testimonials: [
    {
      quote: 'Sambath delivered our app on time with outstanding quality. Highly recommend.',
      author: 'Chan Sophea',
      role: 'Product Manager, TechCorp Solutions'
    },
    {
      quote: 'Great collaborator and problem solver. Elevated our codebase and release cadence.',
      author: 'Kim Dara',
      role: 'Engineering Lead, MobileFirst Inc'
    }
  ],
  resume: {
    href: '/resume.pdf',
    filename: 'Sambath-Resume.pdf'
  }
};
