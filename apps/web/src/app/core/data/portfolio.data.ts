import { Portfolio } from '../models/portfolio.model';

/** Single source of truth for all portfolio content. */
export const PORTFOLIO: Portfolio = {
  profile: {
    name: 'Outhan Chazima',
    role: 'Systems Architect & Software Engineer',
    location: 'Nairobi, KE',
    headlineHtml: 'I design systems<br>that <em>scale</em> and<br>architectures that <em>last</em>.',
    taglineHtml:
      'Outhan Chazima — specializing in <b>system design &amp; architecture</b> and ' +
      '<b>applied AI</b>. I turn ambiguous product problems into resilient, distributed ' +
      'systems — and increasingly into <b>LLM-powered features</b>: RAG pipelines, AI agents, ' +
      'and semantic search. Currently engineering travel-tech infrastructure at <b>Triply.co</b>.',
    meta: [
      { value: '6+', label: 'years engineering' },
      { value: 'BSc', label: 'Math & Computer Science' },
      { value: '145+', label: 'public repositories' },
      { value: 'IBM', label: 'Big Data Engineer awards' },
    ],
    socials: [
      { label: 'LinkedIn', url: 'https://www.linkedin.com/in/outhan-chazima/' },
      { label: 'GitHub', url: 'https://github.com/outhanchazima' },
      { label: 'Medium', url: 'https://medium.com/@outhan254' },
    ],
  },

  ticker: [
    'Distributed Systems',
    'Microservices',
    'Event-Driven Architecture',
    'Applied AI',
    'LLMs & RAG',
    'AI Agents',
    'Vector Search',
    'Node.js / TypeScript',
    'Python / Django',
    'PostgreSQL',
    'Apache Kafka',
    'Redis',
    'Message Queues',
    'Docker & Kubernetes',
    'Cloud Infrastructure',
    'Payments & Fintech',
    'API Design',
    'Observability',
  ],

  stats: [
    { value: '6+', label: 'Years in production', detail: 'Systems used at national scale' },
    { value: '100M+', label: 'KES disbursed', detail: 'Via a disbursement platform I architected' },
    { value: '2M+', label: 'KES collected / day', detail: 'Airport revenue collection across Kenya' },
    { value: '100%', label: 'Cashless collection', detail: 'Ferry payments on M-Pesa & eCitizen' },
  ],

  expertise: [
    {
      id: 'NODE.01',
      title: 'System Design',
      description:
        'Capacity planning, data modeling, API contracts, and trade-off analysis. I design for the failure modes first — then for the happy path.',
    },
    {
      id: 'NODE.02',
      title: 'Distributed Architecture',
      description:
        "Event-driven microservices, message queues, idempotency, and eventual consistency — systems that stay correct when networks don't.",
    },
    {
      id: 'NODE.03',
      title: 'Scalability Engineering',
      description:
        'Caching strategies, database sharding, horizontal scaling, and load testing to take systems from thousands to millions of requests.',
    },
    {
      id: 'NODE.04',
      title: 'Payments & Fintech Infrastructure',
      description:
        'Battle-tested experience building payment rails and transaction systems where double-charges and lost ledger entries are not an option.',
    },
    {
      id: 'NODE.05',
      title: 'API & Platform Design',
      description:
        'Clean, versioned, well-documented interfaces — REST and event APIs that other teams can build on without reading the source.',
    },
    {
      id: 'NODE.06',
      title: 'Technical Leadership',
      description:
        'Architecture reviews, design docs, mentoring engineers, and aligning system decisions with product and business goals.',
    },
  ],

  skillGroups: [
    {
      id: 'STK.01',
      title: 'Architecture & Design',
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
      id: 'STK.02',
      title: 'Languages',
      skills: ['TypeScript', 'Python', 'Go', 'Java', 'JavaScript', 'SQL'],
    },
    {
      id: 'STK.03',
      title: 'Backend',
      skills: ['Django', 'NestJS', 'Node.js', 'Flask', 'Express', 'Celery'],
    },
    {
      id: 'STK.04',
      title: 'Frontend',
      skills: ['Angular', 'TailwindCSS', 'RxJS / Signals', 'HTML5 & CSS3', 'Vue.js'],
    },
    {
      id: 'STK.05',
      title: 'Data & Messaging',
      skills: ['PostgreSQL', 'Apache Kafka', 'Apache Cassandra', 'Redis', 'Apache Hadoop', 'MySQL'],
    },
    {
      id: 'STK.06',
      title: 'Infrastructure & DevOps',
      skills: ['Docker', 'Kubernetes', 'Linux', 'Nginx', 'Cloudflare', 'Azure DevOps', 'CI/CD'],
    },
    {
      id: 'STK.07',
      title: 'Applied AI & ML',
      skills: [
        'LLM Integration',
        'RAG Pipelines',
        'AI Agents',
        'LangChain',
        'Vector Databases',
        'Embeddings',
        'Semantic Search',
        'Prompt Engineering',
        'OpenAI / Anthropic APIs',
        'PyTorch',
        'Hugging Face',
        'Model Evaluation',
      ],
    },
  ],

  projects: [
    {
      name: 'Real-Time Analytics Dashboard',
      context: 'JamboPay',
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
      details: 'Proprietary — architecture walkthrough available on request',
    },
    {
      name: 'Disbursement Platform',
      context: 'JamboPay',
      tag: 'Payments',
      featured: true,
      description:
        'Backend platform for high-volume disbursements across multiple channels, with an Angular operations console. Led the system architecture end-to-end.',
      impact: [
        '100M+ KES disbursed',
        '40% improvement in disbursement efficiency',
        'Multi-channel payout routing',
      ],
      stack: ['Django', 'Node.js', 'PostgreSQL', 'Redis', 'Angular'],
      details: 'Proprietary — architecture walkthrough available on request',
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
      details: 'Government deployment — details available on request',
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
      details: 'Government deployment — details available on request',
    },
    {
      name: 'Multi-Telco USSD Proxy',
      context: 'JamboPay',
      tag: 'Platform',
      featured: true,
      description:
        'A configurable USSD gateway bridging Safaricom, Airtel and Telkom, with validation checks that let teams stand up new USSD applications quickly.',
      impact: ['Unified 3 telco integrations', 'Config-driven USSD apps', 'Built-in request validation'],
      stack: ['NestJS', 'Node.js', 'PostgreSQL'],
      details: 'Proprietary — architecture walkthrough available on request',
    },
    {
      name: 'CBK Reporting System',
      context: 'Central Bank of Kenya · Regulatory',
      tag: 'FinTech',
      featured: true,
      description:
        'A Django platform that automates collection, validation and submission of regulatory financial reports to the Central Bank of Kenya for payment service providers.',
      impact: ['Automated regulatory reporting', 'Validation & submission pipeline', 'Dockerised deployment'],
      stack: ['Django', 'PostgreSQL', 'Docker', 'Angular'],
      details: 'Proprietary regulatory system — details available on request',
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
      tag: 'Open source',
      featured: false,
      description:
        'A high-performance e-commerce REST API built on Bun and Elysia with PostgreSQL, Redis caching, Zod validation and structured Pino logging.',
      impact: ['Bun-native performance', 'Redis-backed caching', 'Type-safe end to end'],
      stack: ['Bun', 'Elysia', 'PostgreSQL', 'Redis', 'Zod'],
      repo: 'https://github.com/outhanchazima',
    },
  ],

  experience: [
    {
      role: 'Senior Software Engineer',
      company: 'Triply.co — Travel-tech, Nairobi',
      when: 'Current',
      current: true,
      summary:
        'Designing and scaling the core platform behind a travel-tech product — booking flows, payment integrations, and the services that hold them together.',
      highlights: [
        'Own architecture decisions across booking, payments, and notification services.',
        'Design event-driven workflows for reliability under unpredictable third-party APIs.',
        'Build LLM-powered features — RAG over travel content and AI agents that assist booking flows — with evaluation, cost and latency budgets baked in.',
        'Lead design reviews and mentor engineers on system-design thinking.',
      ],
      chips: ['Node.js', 'TypeScript', 'PostgreSQL', 'Redis', 'Event-driven', 'LLMs / RAG', 'Cloud'],
    },
    {
      role: 'Software Engineer',
      company: 'JamboPay (WebTribe) — Payments & Fintech',
      when: 'Previous',
      current: false,
      summary:
        "Designed and led payment, revenue-collection and analytics platforms at one of Kenya's established fintech players — high-volume transaction processing where correctness is everything.",
      highlights: [
        'Led the architecture of a disbursement platform (Django, Node.js, PostgreSQL, Redis) that disbursed 100M+ KES, improving disbursement efficiency by 40%.',
        'Built the Kenya Airports Authority revenue system — leading a team of 4 — driving daily collections past 2M KES via USSD, POS enforcement and eCitizen / M-Pesa.',
        'Delivered the Kenya Ports Authority ferry payment system (NestJS, PostgreSQL): lifted daily collections from ~$6k to ~$23k and reached 100% cashless collection.',
        'Architected a real-time analytics platform on Kafka, Cassandra and Redis that cut data-processing time by 30% and streamed live revenue to TV & mobile dashboards.',
        'Designed a multi-telco USSD proxy (NestJS) bridging Safaricom, Airtel and Telkom, plus a billing microservice that improved reporting by 50%.',
      ],
      chips: ['Django', 'NestJS', 'Kafka', 'Cassandra', 'PostgreSQL', 'Redis', 'Payments'],
    },
    {
      role: 'Software Developer',
      company: 'BeanSoft Technologies',
      when: 'Earlier',
      current: false,
      summary:
        'Full-stack product development — shipping features end to end and building the engineering fundamentals that later grew into an architecture focus.',
      highlights: [
        'Built a crypto-exchange platform with Dollar-Cost-Averaging and Grid trading bots.',
        'Python/Flask services on Redis, Celery and PostgreSQL, integrated with the Binance API.',
      ],
      chips: ['Python', 'Flask', 'Celery', 'Redis', 'Vue.js', 'Docker'],
    },
    {
      role: 'BSc Mathematics & Computer Science',
      company: 'Machakos University',
      when: '2016 — 2020',
      current: false,
      summary:
        'Mathematical foundations behind the engineering — plus IBM Big Data Engineer Explorer & Mastery awards (2019) and a Google Africa Development Scholarship.',
      highlights: [],
      chips: ['Applied Mathematics', 'Algorithms', 'Big Data'],
    },
  ],

  principles: [
    {
      num: '01',
      title: 'Design for failure, not demos',
      description:
        'Every dependency will eventually time out, duplicate, or lie. Good architecture assumes it from day one.',
    },
    {
      num: '02',
      title: 'Boring technology, exciting outcomes',
      description:
        'Proven tools, well-understood patterns. Novelty belongs in the product, not in the production database.',
    },
    {
      num: '03',
      title: 'Diagrams before deployments',
      description:
        "If a system can't be explained on one whiteboard, it can't be debugged at 3 a.m. either.",
    },
    {
      num: '04',
      title: 'Scale is a measurement, not a guess',
      description:
        'Capacity decisions come from numbers — load tests, p99 latencies, and growth curves — not vibes.',
    },
  ],

  certifications: [
    { title: 'Software Architecture: Patterns for Developers', issuer: 'LinkedIn Learning', year: '2022' },
    { title: 'Google Africa Development Scholarship — Mobile Web', issuer: 'Google · Pluralsight', year: '2020' },
    { title: 'Big Data Engineer Mastery Award', issuer: 'IBM', year: '2019' },
    { title: 'BSc Mathematics & Computer Science', issuer: 'Machakos University', year: '2020' },
  ],

  contact: {
    tag: 'Open to architecture challenges',
    headlineHtml: "Let's design something<br>that doesn't fall over.",
    blurb:
      "Consulting on system design, architecture reviews, or senior engineering roles — I'm one message away.",
    links: [
      { label: 'LinkedIn', url: 'https://www.linkedin.com/in/outhan-chazima/' },
      { label: 'GitHub', url: 'https://github.com/outhanchazima' },
      { label: 'Medium', url: 'https://medium.com/@outhan254' },
    ],
  },
};
