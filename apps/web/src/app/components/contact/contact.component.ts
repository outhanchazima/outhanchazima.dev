import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PORTFOLIO } from '../../core/data/portfolio.data';
import { RevealDirective } from '../../shared/reveal.directive';
import { AnalyticsService } from '../../core/services/analytics.service';
import { CONTACT, CONTACT_FORM_ENABLED } from '../../core/config/contact.config';

type Status = 'idle' | 'sending' | 'sent' | 'error';

@Component({
  selector: 'app-contact',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, ReactiveFormsModule],
  template: `
    <section id="contact" class="section">
      <div class="wrap">
        <div class="contact-box" appReveal>
          <span class="tag" style="justify-content:center">{{ contact.tag }}</span>
          <h2 [innerHTML]="headline"></h2>
          <p>{{ contact.blurb }}</p>

          <form class="contact-form" [formGroup]="form" (ngSubmit)="submit()" novalidate>
            <div class="cf-row">
              <div class="cf-field">
                <label for="cf-name">Name</label>
                <input
                  id="cf-name"
                  type="text"
                  formControlName="name"
                  autocomplete="name"
                  [attr.aria-invalid]="invalid('name') || null"
                />
              </div>
              <div class="cf-field">
                <label for="cf-email">Email</label>
                <input
                  id="cf-email"
                  type="email"
                  formControlName="email"
                  autocomplete="email"
                  [attr.aria-invalid]="invalid('email') || null"
                />
              </div>
            </div>
            <div class="cf-field">
              <label for="cf-message">Message</label>
              <textarea
                id="cf-message"
                rows="4"
                formControlName="message"
                [attr.aria-invalid]="invalid('message') || null"
              ></textarea>
            </div>

            <!-- honeypot: hidden from humans, bots that tick it are dropped -->
            <input
              class="cf-hp"
              type="checkbox"
              formControlName="botcheck"
              tabindex="-1"
              autocomplete="off"
              aria-hidden="true"
            />

            <div class="cf-actions">
              <button type="submit" class="btn primary" [disabled]="!canSubmit()">
                {{ status() === 'sending' ? 'Sending…' : 'Send message' }}
              </button>
              @if (bookingUrl) {
                <a
                  class="btn ghost"
                  [href]="bookingUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  (click)="trackBooking()"
                  >Book a call ↗</a
                >
              }
            </div>

            <p class="cf-status" role="status" aria-live="polite">
              @if (status() === 'sent') {
                Thanks — your message is on its way. I'll get back to you soon.
              } @else if (status() === 'error') {
                Something went wrong sending that. Please reach me via the links below.
              } @else if (!formEnabled) {
                Direct messaging is being set up — for now, reach me via the links below.
              }
            </p>
          </form>

          <div class="links contact-links">
            @for (link of contact.links; track link.url) {
              <a [href]="link.url" target="_blank" rel="noopener noreferrer">{{ link.label }}</a>
            }
          </div>
        </div>
      </div>
    </section>
  `,
})
export class ContactComponent {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly fb = inject(FormBuilder);
  private readonly analytics = inject(AnalyticsService);

  protected readonly contact = PORTFOLIO.contact;
  protected readonly headline: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    PORTFOLIO.contact.headlineHtml,
  );
  protected readonly formEnabled = CONTACT_FORM_ENABLED;
  protected readonly bookingUrl = CONTACT.bookingUrl;
  protected readonly status = signal<Status>('idle');

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    message: ['', [Validators.required, Validators.minLength(10)]],
    botcheck: [false],
  });

  protected invalid(control: 'name' | 'email' | 'message'): boolean {
    const c = this.form.controls[control];
    return c.invalid && (c.touched || c.dirty);
  }

  protected canSubmit(): boolean {
    return this.formEnabled && this.status() !== 'sending';
  }

  protected trackBooking(): void {
    this.analytics.capture('booking_clicked');
  }

  protected async submit(): Promise<void> {
    if (this.form.invalid || this.form.controls.botcheck.value) {
      this.form.markAllAsTouched();
      return;
    }
    this.status.set('sending');
    const { name, email, message } = this.form.getRawValue();
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: CONTACT.web3formsAccessKey,
          subject: 'Portfolio contact — ' + name,
          from_name: name,
          name,
          email,
          message,
        }),
      });
      if (!res.ok) throw new Error('request failed');
      this.status.set('sent');
      this.analytics.capture('contact_submitted');
      this.form.reset();
    } catch {
      this.status.set('error');
    }
  }
}
