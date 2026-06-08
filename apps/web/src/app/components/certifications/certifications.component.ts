import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PORTFOLIO } from '../../core/data/portfolio.data';
import { RevealDirective } from '../../shared/reveal.directive';
import { EchoTitleDirective } from '../../shared/echo-title.directive';

@Component({
  selector: 'app-certifications',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, EchoTitleDirective],
  template: `
    <section id="credentials" class="section">
      <div class="wrap">
        <div class="sec-head" appReveal>
          <div><span class="tag">Recognition</span><h2 echo>Certifications &amp; awards</h2></div>
          <span class="sec-num">SEC.07 / CREDENTIALS</span>
        </div>
        <div class="creds">
          @for (cert of certifications; track cert.title) {
            <div class="cred" appReveal>
              <span class="yr">{{ cert.year }}</span>
              <div>
                <h3>{{ cert.title }}</h3>
                <small>{{ cert.issuer }}</small>
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `,
})
export class CertificationsComponent {
  protected readonly certifications = PORTFOLIO.certifications;
}
