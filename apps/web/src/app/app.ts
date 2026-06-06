import { AfterViewInit, ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HudComponent } from './components/hud/hud.component';
import { BootComponent } from './components/boot/boot.component';
import { ViewportService } from './core/services/viewport.service';
import { HeroComponent } from './components/hero/hero.component';
import { TickerComponent } from './components/ticker/ticker.component';
import { StatsComponent } from './components/stats/stats.component';
import { ExpertiseComponent } from './components/expertise/expertise.component';
import { SkillsComponent } from './components/skills/skills.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { ExperienceComponent } from './components/experience/experience.component';
import { PrinciplesComponent } from './components/principles/principles.component';
import { WritingComponent } from './components/writing/writing.component';
import { CertificationsComponent } from './components/certifications/certifications.component';
import { ContactComponent } from './components/contact/contact.component';
import { FooterComponent } from './components/footer/footer.component';
import { SeoService } from './core/services/seo.service';
import { PORTFOLIO } from './core/data/portfolio.data';

const SITE_URL = 'https://outhanchazima.dev/';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BootComponent,
    NavbarComponent,
    HudComponent,
    HeroComponent,
    TickerComponent,
    // StatsComponent,
    ExpertiseComponent,
    SkillsComponent,
    ProjectsComponent,
    ExperienceComponent,
    PrinciplesComponent,
    WritingComponent,
    CertificationsComponent,
    ContactComponent,
    FooterComponent,
  ],
  template: `
    <app-boot />
    <a href="#main" class="skip-link">Skip to content</a>
    <app-navbar />
    <app-hud />
    <main id="main">
      <app-hero />
      <app-ticker />
      <!-- <app-stats /> -->
      <app-expertise />
      <app-skills />
      <app-projects />
      <app-experience />
      <app-principles />
      <app-writing />
      <app-certifications />
      <app-contact />
    </main>
    <app-footer />
  `,
})
export class App implements OnInit, AfterViewInit {
  private readonly seo = inject(SeoService);
  private readonly viewport = inject(ViewportService);

  ngAfterViewInit(): void {
    // All sections are now in the DOM — wire up scroll-spy + progress.
    this.viewport.init();
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
}
