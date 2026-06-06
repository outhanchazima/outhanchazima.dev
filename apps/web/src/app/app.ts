import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HeroComponent } from './components/hero/hero.component';
import { StatsComponent } from './components/stats/stats.component';
import { AboutComponent } from './components/about/about.component';
import { SkillsComponent } from './components/skills/skills.component';
import { ExperienceComponent } from './components/experience/experience.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { ContactComponent } from './components/contact/contact.component';
import { FooterComponent } from './components/footer/footer.component';
import { SeoService } from './core/services/seo.service';
import { PORTFOLIO } from './core/data/portfolio.data';

const SITE_URL = 'https://outhanchazima.dev/';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NavbarComponent,
    HeroComponent,
    StatsComponent,
    AboutComponent,
    SkillsComponent,
    ExperienceComponent,
    ProjectsComponent,
    ContactComponent,
    FooterComponent,
  ],
  template: `
    <a
      href="#main"
      class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >Skip to content</a
    >
    <app-navbar />
    <main id="main">
      <app-hero />
      <app-stats />
      <app-about />
      <app-skills />
      <app-experience />
      <app-projects />
      <app-contact />
    </main>
    <app-footer />
  `,
})
export class App implements OnInit {
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    const { profile } = PORTFOLIO;
    const description =
      'Outhan Chazima — senior software engineer specialising in system design, architecture and scalable production systems. Builder of payment, USSD and real-time analytics platforms.';

    this.seo.apply({
      title: `${profile.name} — ${profile.role}`,
      description,
      url: SITE_URL,
      image: `${SITE_URL}og-image.png`,
    });

    this.seo.setJsonLd({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: profile.name,
      jobTitle: profile.role,
      description,
      url: SITE_URL,
      email: `mailto:${profile.email}`,
      telephone: profile.phone,
      address: { '@type': 'PostalAddress', addressLocality: 'Nairobi', addressCountry: 'KE' },
      knowsAbout: [
        'System Design',
        'Software Architecture',
        'Distributed Systems',
        'Microservices',
        'Kafka',
        'Django',
        'NestJS',
        'Angular',
        'Docker',
        'Kubernetes',
      ],
      sameAs: profile.socials.filter((s) => s.icon !== 'email').map((s) => s.url),
    });
  }
}
