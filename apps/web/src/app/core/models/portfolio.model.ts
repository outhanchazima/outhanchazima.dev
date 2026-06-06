/**
 * Domain models for the portfolio content. Keeping content strongly typed and
 * separate from presentation makes the site data-driven and easy to maintain.
 */

export interface SocialLink {
  readonly label: string;
  readonly url: string;
  /** Key used to pick the icon in the icon component. */
  readonly icon: 'github' | 'linkedin' | 'email' | 'phone' | 'resume' | 'location';
}

export interface Profile {
  readonly name: string;
  readonly role: string;
  readonly specialism: string;
  readonly location: string;
  readonly email: string;
  readonly phone: string;
  readonly tagline: string;
  readonly summary: readonly string[];
  readonly socials: readonly SocialLink[];
}

export interface Stat {
  readonly value: string;
  readonly label: string;
  readonly detail: string;
}

export interface SkillGroup {
  readonly title: string;
  readonly icon: string;
  readonly skills: readonly string[];
}

export interface Experience {
  readonly company: string;
  readonly role: string;
  readonly period: string;
  readonly location: string;
  readonly current: boolean;
  readonly summary: string;
  readonly highlights: readonly string[];
  readonly stack: readonly string[];
}

export interface Project {
  readonly name: string;
  readonly context: string;
  readonly description: string;
  readonly impact: readonly string[];
  readonly stack: readonly string[];
  /** Visual accent / category tag, e.g. "Payments", "Real-time", "Platform". */
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
  readonly stats: readonly Stat[];
  readonly skillGroups: readonly SkillGroup[];
  readonly experience: readonly Experience[];
  readonly projects: readonly Project[];
  readonly certifications: readonly Certification[];
}
