import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PORTFOLIO } from '../../core/data/portfolio.data';
import { RevealDirective } from '../../shared/reveal.directive';

@Component({
  selector: 'app-contact',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective],
  template: `
    <section id="contact" class="section">
      <div class="wrap">
        <div class="contact-box" appReveal>
          <span class="tag" style="justify-content:center">{{ contact.tag }}</span>
          <h2 [innerHTML]="headline"></h2>
          <p>{{ contact.blurb }}</p>
          <div class="links">
            @for (link of contact.links; track link.url; let first = $first) {
              <a
                class="btn"
                [class.primary]="first"
                [class.ghost]="!first"
                [href]="link.url"
                target="_blank"
                rel="noopener noreferrer"
                >{{ link.label }}</a
              >
            }
          </div>
        </div>
      </div>
    </section>
  `,
})
export class ContactComponent {
  private readonly sanitizer = inject(DomSanitizer);
  protected readonly contact = PORTFOLIO.contact;
  protected readonly headline: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    PORTFOLIO.contact.headlineHtml,
  );
}
