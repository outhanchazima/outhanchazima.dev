import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AnalyticsService } from '../../core/services/analytics.service';

/**
 * Minimal, accessible cookie/analytics consent banner. Shows only until the
 * visitor makes a choice; PostHog is started solely on "Allow".
 */
@Component({
  selector: 'app-consent',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (analytics.consent() === null) {
      <aside class="consent" role="dialog" aria-label="Analytics consent">
        <p class="consent-text">
          This site uses privacy-friendly analytics (PostHog) to learn what visitors find
          useful — inputs are masked and nothing is sold. Enable analytics?
        </p>
        <div class="consent-actions">
          <button type="button" class="consent-btn" (click)="analytics.deny()">Decline</button>
          <button type="button" class="consent-btn primary" (click)="analytics.grant()">Allow</button>
        </div>
      </aside>
    }
  `,
})
export class ConsentComponent {
  protected readonly analytics = inject(AnalyticsService);
}
