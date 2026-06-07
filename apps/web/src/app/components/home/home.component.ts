import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnInit,
  effect,
  inject,
} from '@angular/core';
import { ViewportService } from '../../core/services/viewport.service';
import { SeoService } from '../../core/services/seo.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { PORTFOLIO } from '../../core/data/portfolio.data';
import { HeroComponent } from '../hero/hero.component';
import { TickerComponent } from '../ticker/ticker.component';
import { ExpertiseComponent } from '../expertise/expertise.component';
import { SkillsComponent } from '../skills/skills.component';
import { ProjectsComponent } from '../projects/projects.component';
import { ExperienceComponent } from '../experience/experience.component';
import { PrinciplesComponent } from '../principles/principles.component';
import { WritingComponent } from '../writing/writing.component';
import { GithubComponent } from '../github/github.component';
import { CertificationsComponent } from '../certifications/certifications.component';
import { ContactComponent } from '../contact/contact.component';

const SITE_URL = 'https://outhanchazima.dev/';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HeroComponent,
    TickerComponent,
    ExpertiseComponent,
    SkillsComponent,
    ProjectsComponent,
    ExperienceComponent,
    PrinciplesComponent,
    WritingComponent,
    GithubComponent,
    CertificationsComponent,
    ContactComponent,
  ],
  template: `
    <app-hero />
    <app-ticker />
    <app-expertise />
    <app-skills />
    <app-projects />
    <app-experience />
    <app-principles />
    <app-writing />
    <app-github />
    <app-certifications />
    <app-contact />
  `,
})
export class HomeComponent implements OnInit, AfterViewInit {
  private readonly seo = inject(SeoService);
  private readonly viewport = inject(ViewportService);
  private readonly analytics = inject(AnalyticsService);

  constructor() {
    // Track which section a visitor is reading (deduped per session).
    const seenSections = new Set<string>();
    effect(() => {
      const id = this.viewport.activeId();
      if (id && !seenSections.has(id)) {
        seenSections.add(id);
        this.analytics.capture('section_viewed', { section: id });
      }
    });
  }

  ngOnInit(): void {
    const { profile } = PORTFOLIO;
    const description =
      'Outhan Chazima — software engineer specialising in system design, distributed ' +
      'architecture and LLM-powered products. Builds RAG pipelines, AI agents and semantic search ' +
      'alongside payment rails and event-driven platforms. Nairobi, Kenya.';

    this.seo.apply({
      title: 'Outhan Chazima — Applied AI & Software Engineer',
      description,
      url: SITE_URL,
      image: `${SITE_URL}og-image.png`,
    });

    this.seo.setJsonLd({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: profile.name,
      jobTitle: 'Software Engineer — System Design & Architecture',
      description,
      url: SITE_URL,
      address: { '@type': 'PostalAddress', addressLocality: 'Nairobi', addressCountry: 'KE' },
      knowsAbout: [
        'Applied AI',
        'Large Language Models (LLMs)',
        'Retrieval-Augmented Generation (RAG)',
        'AI Agents',
        'Prompt Engineering',
        'Vector Databases',
        'Semantic Search',
        'Machine Learning',
        'LangChain',
        'System Design',
        'Software Architecture',
        'Distributed Systems',
        'Microservices',
        'Event-Driven Architecture',
        'Payments & Fintech',
        'Kafka',
        'PostgreSQL',
        'Docker',
        'Kubernetes',
      ],
      sameAs: profile.socials.map((s) => s.url),
    });
  }

  ngAfterViewInit(): void {
    // Sections are in the DOM — (re)bind the scroll-spy for the nav + HUD.
    this.viewport.observeSections();
  }
}
