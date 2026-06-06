/**
 * Contact form + booking configuration.
 *
 * The contact form posts to Web3Forms (https://web3forms.com) — a free, no-auth
 * form backend. Create an access key (it's tied to the email you want messages
 * delivered to) and paste it below. The access key is safe to ship client-side.
 *
 * Until a real key is set, the form renders but the submit button is disabled
 * and a short note points visitors to the social links instead.
 */
export const CONTACT = {
  web3formsAccessKey: 'e6650528-c000-4800-ae24-0734111b14a7',
  /** Optional booking link (Cal.com / Calendly). Empty string hides the button. */
  bookingUrl: 'https://cal.com/ochazima',
} as const;

/** True once a real Web3Forms key has been filled in. */
export const CONTACT_FORM_ENABLED = !CONTACT.web3formsAccessKey.includes('REPLACE');
