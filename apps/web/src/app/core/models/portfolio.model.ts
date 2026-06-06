/**
 * Domain models for the portfolio content. Content is kept strongly typed and
 * separate from presentation so the "blueprint" site stays data-driven and easy
 * to maintain — edit data, not templates.
 */

export interface SocialLink {
  readonly label: string;
  readonly url: string;
}

export interface HeroMeta {
  /** Emphasised value, e.g. "6+", "BSc", "145+". */
  readonly value: string;
  /** Supporting label, e.g. "years engineering". */
  readonly label: string;
}

export interface Profile {
  readonly name: string;
  readonly role: string;
  readonly location: string;
  /** Hero headline as trusted HTML (may contain <br> and <em> for accenting). */
  readonly headlineHtml: string;
  /** Hero sub-paragraph as trusted HTML (may contain <b>). */
  readonly taglineHtml: string;
  readonly meta: readonly HeroMeta[];
  readonly socials: readonly SocialLink[];
}

export interface ExpertiseNode {
  /** Schematic id, e.g. "NODE.01". */
  readonly id: string;
  readonly title: string;
  readonly description: string;
}

export interface Job {
  readonly role: string;
  readonly company: string;
  /** Period label, e.g. "Current", "2016 — 2020". */
  readonly when: string;
  readonly current: boolean;
  readonly summary: string;
  readonly highlights: readonly string[];
  readonly chips: readonly string[];
}

export interface Principle {
  readonly num: string;
  readonly title: string;
  readonly description: string;
}

export interface Post {
  /** Log reference, e.g. "LOG.001". */
  readonly ref: string;
  readonly title: string;
  readonly blurb: string;
  readonly url: string;
}

export interface Contact {
  readonly tag: string;
  /** Contact headline as trusted HTML (may contain <br>). */
  readonly headlineHtml: string;
  readonly blurb: string;
  readonly links: readonly SocialLink[];
}

export interface Stat {
  readonly value: string;
  readonly label: string;
  readonly detail: string;
}

export interface SkillGroup {
  /** Schematic id, e.g. "STK.01". */
  readonly id: string;
  readonly title: string;
  readonly skills: readonly string[];
}

export interface Project {
  readonly name: string;
  readonly context: string;
  readonly description: string;
  readonly impact: readonly string[];
  readonly stack: readonly string[];
  /** Category tag, e.g. "Payments", "Real-time", "Platform". */
  readonly tag: string;
  readonly featured: boolean;
  readonly url?: string;
  readonly repo?: string;
}

export interface Certification {
  readonly title: string;
  readonly issuer: string;
  readonly year: string;
}

export interface Portfolio {
  readonly profile: Profile;
  readonly ticker: readonly string[];
  readonly stats: readonly Stat[];
  readonly expertise: readonly ExpertiseNode[];
  readonly skillGroups: readonly SkillGroup[];
  readonly projects: readonly Project[];
  readonly experience: readonly Job[];
  readonly principles: readonly Principle[];
  readonly writing: readonly Post[];
  readonly certifications: readonly Certification[];
  readonly contact: Contact;
}
