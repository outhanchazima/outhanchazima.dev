import { Portfolio } from '../models/portfolio.model';

/** Single source of truth for all portfolio content. */
export const PORTFOLIO: Portfolio = {
  profile: {
    name: 'Outhan Chazima',
    role: 'Senior Software Engineer',
    specialism: 'System Design & Architecture',
    location: 'Nairobi, Kenya',
    email: 'outhanchazima@gmail.com',
    phone: '+254 714 690 698',
    tagline:
      'I design and build scalable software that runs in production — payment rails, real-time analytics and distributed services that move millions in transactions every day.',
    summary: [
      'I am a senior software engineer with a deep focus on system design and architecture. Over the last several years I have led the design of backend platforms that process financial transactions at national scale across Kenya — for airports, ports, regulators and payment service providers.',
      'My work sits where correctness, throughput and reliability matter most: event-driven analytics on Kafka and Cassandra, disbursement and billing microservices on Django and Node, USSD gateways spanning every major telco, and the Angular dashboards that make all of it observable. I care about clean, maintainable systems and the infrastructure — Docker, Kubernetes, Linux — that keeps them running.',
    ],
    socials: [
      { label: 'GitHub', url: 'https://github.com/outhanchazima', icon: 'github' },
      { label: 'LinkedIn', url: 'https://www.linkedin.com/in/outhan-chazima/', icon: 'linkedin' },
      { label: 'Email', url: 'mailto:outhanchazima@gmail.com', icon: 'email' },
    ],
  },

  stats: [
    { value: '4+', label: 'Years in production', detail: 'Engineering systems used at national scale' },
    { value: '100M+', label: 'KES disbursed', detail: 'Through a disbursement platform I architected' },
    { value: '2M+', label: 'KES collected / day', detail: 'Airport revenue collection across Kenya' },
    { value: '100%', label: 'Cashless collection', detail: 'Ferry payments migrated to M-Pesa & eCitizen' },
  ],

  skillGroups: [
    {
      title: 'Architecture & Design',
      icon: 'architecture',
      skills: [
        'System Design',
        'Microservices',
        'Event-Driven Architecture',
        'API Design (REST / GraphQL)',
        'Distributed Systems',
        'Domain Modelling',
      ],
    },
    {
      title: 'Languages',
      icon: 'code',
      skills: ['TypeScript', 'Python', 'Go', 'Java', 'JavaScript', 'SQL'],
    },
    {
      title: 'Backend',
      icon: 'server',
      skills: ['Django', 'NestJS', 'Node.js', 'Flask', 'Express', 'Celery'],
    },
    {
      title: 'Frontend',
      icon: 'layout',
      skills: ['Angular', 'TailwindCSS', 'RxJS / Signals', 'HTML5 & CSS3', 'Vue.js'],
    },
    {
      title: 'Data & Messaging',
      icon: 'database',
      skills: ['PostgreSQL', 'Apache Kafka', 'Apache Cassandra', 'Redis', 'Apache Hadoop', 'MySQL'],
    },
    {
      title: 'Infrastructure & DevOps',
      icon: 'cloud',
      skills: ['Docker', 'Kubernetes', 'Linux', 'Nginx', 'Cloudflare', 'Azure DevOps', 'CI/CD'],
    },
  ],

  experience: [
    {
      company: 'Jambopay · WebTribe Limited',
      role: 'Software Engineer',
      period: 'Mar 2022 — Present',
      location: 'Nairobi, Kenya',
      current: true,
      summary:
        'Lead the design and delivery of payment, revenue-collection and analytics platforms serving government agencies and payment service providers across Kenya.',
      highlights: [
        'Architected a real-time analytics dashboard ingesting transactions from every company system via Kafka, Django, Cassandra and Redis — cutting data processing time by 30% and streaming live revenue/profit insights to TV and mobile dashboards.',
        'Led the architecture of a disbursement platform (Django, Node.js, PostgreSQL, Redis, Angular) that has disbursed 100M+ KES across channels, improving disbursement efficiency by 40%.',
        'Built the Kenya Airports Authority revenue-collection system, leading a team of 4 and driving daily collections past 2M KES through USSD, POS enforcement and eCitizen / M-Pesa STK push.',
        'Delivered the Kenya Ports Authority ferry payment system (NestJS, PostgreSQL), lifting daily collections from under $6k to ~$23k and reaching 100% cashless collection.',
        'Designed a multi-telco USSD proxy (NestJS) bridging Safaricom, Airtel and Telkom, and a universal billing microservice (Django) that improved reporting by 50%.',
      ],
      stack: ['Django', 'NestJS', 'Kafka', 'Cassandra', 'PostgreSQL', 'Redis', 'Angular', 'Node.js'],
    },
    {
      company: 'BeanSoft',
      role: 'Software Engineer',
      period: 'Feb 2021 — Mar 2022',
      location: 'Machakos, Kenya',
      current: false,
      summary:
        'Designed and built a crypto-exchange platform with automated trading strategies for retail users.',
      highlights: [
        'Engineered a crypto-exchange integrated with Dollar-Cost-Averaging and Grid trading bots.',
        'Built Python/Flask services backed by Redis, Celery and PostgreSQL, integrated with the Binance API.',
        'Containerised and deployed services with Docker and Nginx on CentOS.',
      ],
      stack: ['Python', 'Flask', 'Celery', 'Redis', 'PostgreSQL', 'Binance API', 'Docker', 'Vue.js'],
    },
    {
      company: 'Art Touch Enterprise',
      role: 'Software Engineer & Designer',
      period: '2015 — Present',
      location: 'Eldoret, Kenya',
      current: true,
      summary:
        'Blend engineering and design — building the e-commerce and inventory systems behind an educational-products business.',
      highlights: [
        'Built an e-commerce platform (web + app) for puzzles and learning resources, with a high-performance API on Bun and Elysia.',
        'Developed an inventory and business-management system that automated day-to-day operations.',
        'Owned product branding and UI/UX alongside the engineering.',
      ],
      stack: ['Bun', 'Elysia', 'PostgreSQL', 'Redis', 'TypeScript', 'Angular'],
    },
    {
      company: 'United States International University (USIU)',
      role: 'Software Support Intern',
      period: 'May 2019 — Aug 2019',
      location: 'Nairobi, Kenya',
      current: false,
      summary: 'Supported campus IT systems and Active Directory administration.',
      highlights: [
        'Installed and managed Active Directory user accounts and delegated roles.',
        'Maintained systems and software packages and planned upgrades for efficiency.',
      ],
      stack: ['Active Directory', 'Windows Server', 'Linux'],
    },
  ],

  projects: [
    {
      name: 'Real-Time Analytics Dashboard',
      context: 'Jambopay',
      tag: 'Real-time',
      featured: true,
      description:
        'An event-driven analytics platform that ingests transactions from every company system and surfaces live revenue and profit insights to TV, web and mobile dashboards.',
      impact: [
        '30% reduction in data processing time',
        'Real-time streaming to TV & mobile dashboards',
        'Unified view across all transaction sources',
      ],
      stack: ['Kafka', 'Django', 'Cassandra', 'Redis', 'Angular'],
    },
    {
      name: 'Disbursement Platform',
      context: 'Jambopay',
      tag: 'Payments',
      featured: true,
      description:
        'Backend platform for high-volume disbursements across multiple channels, with an Angular operations console. Led the system architecture end-to-end.',
      impact: ['100M+ KES disbursed', '40% improvement in disbursement efficiency', 'Multi-channel payout routing'],
      stack: ['Django', 'Node.js', 'PostgreSQL', 'Redis', 'Angular'],
    },
    {
      name: 'Airports Authority Revenue Collection',
      context: 'Kenya Airports Authority',
      tag: 'GovTech',
      featured: true,
      description:
        'Revenue-collection system used across every airport and airstrip in Kenya, including a USSD app and an Android POS for parking-fee enforcement. Led a team of four.',
      impact: ['2M+ KES collected daily', 'eCitizen & M-Pesa STK push', 'Led a team of 4 engineers'],
      stack: ['NestJS', 'PostgreSQL', 'USSD', 'Android POS', 'M-Pesa'],
    },
    {
      name: 'Ferry Payment System',
      context: 'Kenya Ports Authority',
      tag: 'Payments',
      featured: true,
      description:
        'Cashless gate-control and revenue-collection system for ferry crossings, integrated with M-Pesa and eCitizen for secure transaction processing.',
      impact: ['$6k → $23k daily collections', '100% cashless collection', 'Automated gate control'],
      stack: ['NestJS', 'PostgreSQL', 'M-Pesa', 'eCitizen'],
    },
    {
      name: 'Multi-Telco USSD Proxy',
      context: 'Jambopay',
      tag: 'Platform',
      featured: true,
      description:
        'A configurable USSD gateway bridging Safaricom, Airtel and Telkom, with validation checks that let teams stand up new USSD applications quickly.',
      impact: ['Unified 3 telco integrations', 'Config-driven USSD apps', 'Built-in request validation'],
      stack: ['NestJS', 'Node.js', 'PostgreSQL'],
    },
    {
      name: 'CBK Reporting System',
      context: 'Regulatory · Open work',
      tag: 'FinTech',
      featured: true,
      description:
        'A Django platform that automates collection, validation and submission of regulatory financial reports to the Central Bank of Kenya for payment service providers.',
      impact: ['Automated regulatory reporting', 'Validation & submission pipeline', 'Dockerised deployment'],
      stack: ['Django', 'PostgreSQL', 'Docker', 'Angular'],
    },
    {
      name: 'OAuth2 / OIDC Auth Server',
      context: 'Personal · Platform',
      tag: 'Security',
      featured: false,
      description:
        'A Django + Authlib OAuth2 / OpenID Connect server with PKCE, multiple grant types, 2FA, audit logging and IPRS national-ID verification.',
      impact: ['Full OAuth2 + OIDC flows', '2FA & audit logging', 'Multi-tenant account types'],
      stack: ['Django', 'Authlib', 'JWT', 'PostgreSQL'],
      repo: 'https://github.com/outhanchazima',
    },
    {
      name: 'ArtTouch.ke Commerce API',
      context: 'Art Touch Enterprise',
      tag: 'Open work',
      featured: false,
      description:
        'A high-performance e-commerce REST API built on Bun and Elysia with PostgreSQL, Redis caching, Zod validation and structured Pino logging.',
      impact: ['Bun-native performance', 'Redis-backed caching', 'Type-safe end to end'],
      stack: ['Bun', 'Elysia', 'PostgreSQL', 'Redis', 'Zod'],
      repo: 'https://github.com/outhanchazima',
    },
  ],

  certifications: [
    { title: 'Software Architecture: Patterns for Developers', issuer: 'LinkedIn Learning', year: '2022' },
    { title: 'Google Africa Development Scholarship (Mobile Web)', issuer: 'Google · Pluralsight', year: '2020' },
    { title: 'Big Data Engineer Mastery Award', issuer: 'IBM', year: '2019' },
    { title: 'BSc Mathematics & Computer Science', issuer: 'Machakos University', year: '2020' },
  ],
};
