export const site = {
  author: {
    name: 'Sambath',
    title: 'Software Engineer',
    email: 'hulsambath14@gmail.com',
    phones: ['+855 88 708 518 7', '+855 76 708 518 7'],
    location: 'Phnom Penh, Cambodia',
    social: {
      github: 'https://github.com/hulsambath',
      linkedin: 'https://www.linkedin.com/in/hulsambath/',
      twitter: 'https://twitter.com/your-handle'
    }
  },
  stats: [
    { label: 'Years Experience', value: '3+' },
    { label: 'Projects Completed', value: '20+' },
    { label: 'Happy Clients', value: '15+' }
  ],
  skills: {
    mobile: [
      { name: 'Flutter', levelPct: 95 },
      { name: 'Dart', levelPct: 90 },
      { name: 'Firebase', levelPct: 85 }
    ],
    web: [
      { name: 'React', levelPct: 90 },
      { name: 'JavaScript', levelPct: 88 },
      { name: 'Tailwind CSS', levelPct: 85 }
    ],
    tools: [
      { name: 'Git', levelPct: 92 },
      { name: 'Figma', levelPct: 80 },
      { name: 'Docker', levelPct: 75 }
    ]
  },
  projects: [
    {
      icon: '🎟',
      title: 'Ticket Booking App',
      description:
        'A comprehensive Flutter app for booking event, bus, and ferry tickets with real-time availability and secure payment processing.',
      tech: ['Flutter', 'Firebase', 'Stripe'],
      demoUrl: '#',
      sourceUrl: '#'
    },
    {
      icon: '💳',
      title: 'Banking App',
      description:
        'A secure mobile banking application with biometric authentication, transaction management, and real-time notifications.',
      tech: ['Flutter', 'Node.js', 'MongoDB'],
      demoUrl: '#',
      sourceUrl: '#'
    },
    {
      icon: '🛒',
      title: 'E-Commerce Platform',
      description:
        'A full-stack e-commerce solution with React frontend, admin dashboard, and integrated payment processing.',
      tech: ['React', 'Express.js', 'PostgreSQL'],
      demoUrl: '#',
      sourceUrl: '#'
    }
  ],
  experience: [
    {
      initials: 'S',
      role: 'Senior Software Engineer',
      company: 'TechCorp Solutions',
      period: '2022 - Present',
      bullets: [
        'Led development of 5+ Flutter applications with 100k+ downloads',
        'Implemented CI/CD pipelines reducing deployment time by 60%',
        'Mentored 3 junior developers and conducted code reviews'
      ]
    },
    {
      initials: 'M',
      role: 'Mobile Developer',
      company: 'MobileFirst Inc',
      period: '2020 - 2022',
      bullets: [
        'Developed cross-platform mobile applications using Flutter',
        'Collaborated with UI/UX designers to implement pixel-perfect designs',
        'Optimized app performance achieving 40% faster load times'
      ]
    },
    {
      initials: 'J',
      role: 'Junior Developer',
      company: 'StartupXYZ',
      period: '2019 - 2020',
      bullets: [
        'Built responsive web applications using React and modern JavaScript',
        'Worked with REST APIs and integrated third-party services',
        'Participated in agile development processes and sprint planning'
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

