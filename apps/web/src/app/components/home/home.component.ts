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
      title: 'Outhan Chazima — Systems Architect & Software Engineer',
      description,
      url: SITE_URL,
      image: `${SITE_URL}og-image.png`,
    });

    const personId = `${SITE_URL}#person`;
    const websiteId = `${SITE_URL}#website`;

    this.seo.setJsonLd({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Person',
          '@id': personId,
          name: profile.name,
          jobTitle: 'Systems Architect & Software Engineer',
          description,
          url: SITE_URL,
          image: `${SITE_URL}profile.jpg`,
          address: { '@type': 'PostalAddress', addressLocality: 'Nairobi', addressCountry: 'KE' },
          worksFor: { '@type': 'Organization', name: 'Triply', url: 'https://triply.co' },
          alumniOf: { '@type': 'CollegeOrUniversity', name: 'Machakos University' },
          knowsAbout: [
            'System Design',
            'Software Architecture',
            'Distributed Systems',
            'Microservices',
            'Event-Driven Architecture',
            'Scalability Engineering',
            'Payments & Fintech',
            'Applied AI',
            'Large Language Models (LLMs)',
            'Retrieval-Augmented Generation (RAG)',
            'AI Agents',
            'Prompt Engineering',
            'Vector Databases',
            'Semantic Search',
            'LangChain',
            'Apache Kafka',
            'PostgreSQL',
            'Docker',
            'Kubernetes',
          ],
          sameAs: profile.socials.map((s) => s.url),
        },
        {
          '@type': 'WebSite',
          '@id': websiteId,
          url: SITE_URL,
          name: profile.name,
          description,
          inLanguage: 'en',
          publisher: { '@id': personId },
        },
        {
          '@type': 'ProfilePage',
          '@id': `${SITE_URL}#profilepage`,
          url: SITE_URL,
          name: 'Outhan Chazima — Systems Architect & Software Engineer',
          isPartOf: { '@id': websiteId },
          about: { '@id': personId },
          mainEntity: { '@id': personId },
        },
      ],
    });
  }

  ngAfterViewInit(): void {
    // Sections are in the DOM — (re)bind the scroll-spy for the nav + HUD.
    this.viewport.observeSections();
  }
}
