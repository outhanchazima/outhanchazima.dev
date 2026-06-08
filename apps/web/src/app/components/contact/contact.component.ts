import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PORTFOLIO } from '../../core/data/portfolio.data';
import { RevealDirective } from '../../shared/reveal.directive';
import { AnalyticsService } from '../../core/services/analytics.service';
import { CONTACT, CONTACT_FORM_ENABLED } from '../../core/config/contact.config';
import { CalEmbedComponent } from './cal-embed.component';
import { MagneticDirective } from '../../shared/magnetic.directive';

type Status = 'idle' | 'sending' | 'sent' | 'error';
type Tab = 'message' | 'meeting';
type Field = 'name' | 'email' | 'message';

const TOPICS = ['Full-time role', 'Freelance project', 'Just saying hi', 'Bug report', 'Other'];

@Component({
  selector: 'app-contact',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, ReactiveFormsModule, CalEmbedComponent, MagneticDirective],
  template: `
    <section id="contact" class="section">
      <div class="wrap">
        <div class="contact-box" appReveal>
          <span class="tag" style="justify-content:center">{{ contact.tag }}</span>
          <h2 [innerHTML]="headline"></h2>
          <p>{{ contact.blurb }}</p>

          <div class="contact-tabs" role="tablist" aria-label="Contact options">
            <button
              type="button"
              role="tab"
              class="contact-tab"
              [class.active]="tab() === 'message'"
              [attr.aria-selected]="tab() === 'message'"
              (click)="tab.set('message')"
            >
              Send message
            </button>
            @if (bookingUrl) {
              <button
                type="button"
                role="tab"
                class="contact-tab"
                [class.active]="tab() === 'meeting'"
                [attr.aria-selected]="tab() === 'meeting'"
                (click)="openMeeting()"
              >
                Book a meeting
              </button>
            }
          </div>

          @if (tab() === 'message') {
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
                  @if (invalid('name')) {
                    <span class="cf-error">Please enter your name</span>
                  }
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
                  @if (invalid('email')) {
                    <span class="cf-error">Please enter a valid email address</span>
                  }
                </div>
              </div>

              <div class="cf-field">
                <span class="cf-label" id="cf-topic-label">Topic</span>
                <div class="cf-topics" role="group" aria-labelledby="cf-topic-label">
                  @for (t of topics; track t) {
                    <button
                      type="button"
                      class="topic-pill"
                      [class.active]="form.controls.topic.value === t"
                      [attr.aria-pressed]="form.controls.topic.value === t"
                      (click)="selectTopic(t)"
                    >
                      {{ t }}
                    </button>
                  }
                </div>
              </div>

              <div class="cf-field">
                <label for="cf-message">Message</label>
                <textarea
                  id="cf-message"
                  rows="5"
                  formControlName="message"
                  [attr.aria-invalid]="invalid('message') || null"
                ></textarea>
                @if (invalid('message')) {
                  <span class="cf-error">Message is too short</span>
                }
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

              <label class="cf-consent">
                <input type="checkbox" formControlName="consent" />
                <span>I agree that my submitted data is collected and stored to respond to my inquiry.</span>
              </label>

              <button type="submit" class="btn primary cf-submit" appMagnetic [disabled]="!canSubmit()">
                {{ status() === 'sending' ? 'Sending…' : 'Send Message' }}
                <span aria-hidden="true">→</span>
              </button>

              <p class="cf-status" role="status" aria-live="polite">
                @if (status() === 'sent') {
                  Thanks — your message is on its way. I'll get back to you soon.
                } @else if (status() === 'error') {
                  Something went wrong sending that. Please reach me via the links below.
                } @else if (!formEnabled) {
                  Direct messaging is being set up — for now, reach me via the links below.
                }
              </p>

              <div class="links contact-links">
                @for (link of contact.links; track link.url) {
                  <a [href]="link.url" target="_blank" rel="noopener noreferrer">{{ link.label }}</a>
                }
              </div>
            </form>
          }

          @if (meetingLoaded()) {
            <div class="cal-embed-wrap" [hidden]="tab() !== 'meeting'">
              <app-cal-embed />
            </div>
          }
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
  protected readonly topics = TOPICS;
  protected readonly formEnabled = CONTACT_FORM_ENABLED;
  protected readonly bookingUrl = CONTACT.bookingUrl;
  protected readonly status = signal<Status>('idle');
  protected readonly tab = signal<Tab>('message');
  protected readonly meetingLoaded = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    topic: ['', [Validators.required]],
    message: ['', [Validators.required, Validators.minLength(10)]],
    consent: [false, [Validators.requiredTrue]],
    botcheck: [false],
  });

  protected invalid(control: Field): boolean {
    const c = this.form.controls[control];
    return c.invalid && (c.touched || c.dirty);
  }

  protected canSubmit(): boolean {
    return this.formEnabled && this.status() !== 'sending' && this.form.valid;
  }

  protected selectTopic(topic: string): void {
    this.form.controls.topic.setValue(topic);
    this.form.controls.topic.markAsDirty();
  }

  protected openMeeting(): void {
    this.tab.set('meeting');
    this.meetingLoaded.set(true);
    this.analytics.capture('booking_tab_opened');
  }

  protected async submit(): Promise<void> {
    if (this.form.invalid || this.form.controls.botcheck.value) {
      this.form.markAllAsTouched();
      return;
    }
    this.status.set('sending');
    const { name, email, topic, message } = this.form.getRawValue();
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: CONTACT.web3formsAccessKey,
          subject: `Portfolio contact — ${topic} — ${name}`,
          from_name: name,
          name,
          email,
          topic,
          message,
        }),
      });
      if (!res.ok) throw new Error('request failed');
      this.status.set('sent');
      this.analytics.capture('contact_submitted', { topic });
      this.form.reset();
    } catch {
      this.status.set('error');
    }
  }
}
