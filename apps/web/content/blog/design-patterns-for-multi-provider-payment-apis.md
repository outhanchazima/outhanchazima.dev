---
title: 'Design patterns for multi-provider APIs: a payments case study'
description: 'How to integrate M-Pesa, Stripe (US & UK) and Paystack behind one clean interface using the Adapter, Registry and Facade patterns — with TypeScript examples, diagrams, the bad code to avoid, and what bad design costs the business in delivery speed and dollars.'
date: 2026-06-07
tags: [System Design, Design Patterns, Payments, TypeScript, APIs]
keywords: 'multi-provider api, adapter pattern, strategy pattern, facade pattern, payment gateway, mpesa stk push, stripe payment intents, paystack, provider abstraction, scalability, clean architecture, technical debt, delivery velocity, engineering cost'
author: 'Outhan Chazima'
---

Every product that takes money eventually integrates a second payment provider.
You start with Stripe, then expand to Kenya and need M-Pesa, then to Nigeria and
need Paystack, then your UK entity needs a separate Stripe account from your US
one. Each provider has its own API shape, its own money format, its own idea of
"success", and its own way of telling you a payment completed.

The difference between a codebase that absorbs this gracefully and one that
collapses under it is **not** how many providers you support — it's whether your
design isolates the things that vary from the things that don't.

This is a walkthrough of the patterns I reach for, the anti-patterns I rip out in
code review, and what bad design actually costs you in production.

## The problem: one checkout, many providers

These four integrations have almost nothing in common at the wire level:

| Provider     | Region focus | Money unit      | Flow                              |
| ------------ | ------------ | --------------- | --------------------------------- |
| Stripe (US)  | USD          | cents           | Create PaymentIntent, confirm     |
| Stripe (UK)  | GBP / EUR    | pence / cents   | Same API, different account/keys  |
| Paystack     | NGN/GHS/ZAR  | kobo / pesewas  | Initialize → redirect → verify    |
| M-Pesa       | KES          | whole shillings | STK push → asynchronous callback  |

Stripe gives you a near-synchronous result. Paystack hands you a redirect URL and
you verify later. M-Pesa pushes a prompt to the customer's phone and tells you the
outcome **minutes later, over a webhook**. Your application code should not have to
know any of that.

## What bad design looks like

Here's the version that ships first and haunts you for two years — a single
function that knows about every provider at once.

```ts
// 🚫 anti-pattern: the god-function gateway
async function charge(provider: string, amount: number, currency: string, opts: any) {
  if (provider === 'stripe_us') {
    const res = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.STRIPE_US_KEY}` },
      body: new URLSearchParams({ amount: String(amount * 100), currency, confirm: 'true' }),
    });
    const data = await res.json();
    return data.status === 'succeeded'; // returns a boolean 🤷
  } else if (provider === 'stripe_uk') {
    // ...the exact same code, different key, copy-pasted
  } else if (provider === 'paystack') {
    const res = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_KEY}` },
      body: JSON.stringify({ amount: amount * 100, email: opts.email, currency }),
    });
    const data = await res.json();
    return data.data.authorization_url; // returns a string now?!
  } else if (provider === 'mpesa') {
    // STK push... but it's async, so what do we even return here?
    throw new Error('not sure how to fit this in');
  }
  throw new Error('unknown provider');
}
```

Look at what's wrong, because each flaw maps to a real cost:

- **Inconsistent return types** (`boolean | string | never`). Every caller needs its
  own `if (provider === ...)` to interpret the result. The coupling leaks _upward_.
- **`amount * 100` everywhere.** It's correct for cents and kobo, wrong for M-Pesa
  (shillings have no minor unit in practice), and a rounding bug waiting to happen
  for `19.99`.
- **Copy-paste between `stripe_us` and `stripe_uk`.** Two providers that are 95%
  identical are duplicated instead of configured.
- **Async providers don't fit.** M-Pesa literally can't return a result here, so
  the abstraction is already broken on provider #4.
- **Untestable.** You can't unit-test routing without hitting four live APIs.

> The tell-tale sign of a failing abstraction: adding the _next_ provider means
> editing the _same_ function again. Open/Closed is violated by construction.

Now let's fix it. Here's the shape we're aiming for — callers depend on one
facade; providers plug in behind a router and never leak upward.

<figure class="diagram">
<svg viewBox="0 0 760 300" role="img" aria-label="Diagram: Checkout calls a PaymentService facade, which uses a Registry plus Strategy to route to one of four provider adapters — Stripe US, Stripe UK, Paystack and M-Pesa.">
<defs><marker id="ah1" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="var(--muted)"/></marker></defs>
<rect x="12" y="124" width="120" height="52" rx="6" fill="var(--ink-2)" stroke="var(--line)"/>
<text x="72" y="154" text-anchor="middle" fill="var(--paper)" font-size="13">Checkout</text>
<rect x="176" y="112" width="150" height="76" rx="6" fill="var(--ink-2)" stroke="var(--signal)"/>
<text x="251" y="146" text-anchor="middle" fill="var(--paper)" font-size="13">PaymentService</text>
<text x="251" y="166" text-anchor="middle" fill="var(--muted)" font-size="11">facade</text>
<rect x="372" y="112" width="150" height="76" rx="6" fill="var(--ink-2)" stroke="var(--signal)"/>
<text x="447" y="146" text-anchor="middle" fill="var(--paper)" font-size="13">Registry +</text>
<text x="447" y="166" text-anchor="middle" fill="var(--paper)" font-size="13">Strategy</text>
<rect x="576" y="40" width="172" height="40" rx="6" fill="var(--ink-2)" stroke="var(--line)"/>
<text x="662" y="64" text-anchor="middle" fill="var(--paper)" font-size="12">Stripe US</text>
<rect x="576" y="94" width="172" height="40" rx="6" fill="var(--ink-2)" stroke="var(--line)"/>
<text x="662" y="118" text-anchor="middle" fill="var(--paper)" font-size="12">Stripe UK</text>
<rect x="576" y="148" width="172" height="40" rx="6" fill="var(--ink-2)" stroke="var(--line)"/>
<text x="662" y="172" text-anchor="middle" fill="var(--paper)" font-size="12">Paystack</text>
<rect x="576" y="202" width="172" height="40" rx="6" fill="var(--ink-2)" stroke="var(--cyan)"/>
<text x="662" y="226" text-anchor="middle" fill="var(--paper)" font-size="12">M-Pesa</text>
<line x1="132" y1="150" x2="174" y2="150" stroke="var(--muted)" stroke-width="1.4" marker-end="url(#ah1)"/>
<line x1="326" y1="150" x2="370" y2="150" stroke="var(--muted)" stroke-width="1.4" marker-end="url(#ah1)"/>
<line x1="522" y1="150" x2="574" y2="60" stroke="var(--muted)" stroke-width="1.4" marker-end="url(#ah1)"/>
<line x1="522" y1="150" x2="574" y2="114" stroke="var(--muted)" stroke-width="1.4" marker-end="url(#ah1)"/>
<line x1="522" y1="150" x2="574" y2="168" stroke="var(--muted)" stroke-width="1.4" marker-end="url(#ah1)"/>
<line x1="522" y1="150" x2="574" y2="222" stroke="var(--muted)" stroke-width="1.4" marker-end="url(#ah1)"/>
</svg>
<figcaption>Figure 1 — The layered shape. The amber boxes are the only code your app talks to; adding a provider adds a box on the right, nothing else.</figcaption>
</figure>

## Pattern 1: Adapter — one interface, many providers

First, define the domain in **your** terms, not the provider's. Money is an amount
in **minor units** plus a currency — never a float.

```ts
export interface Money {
  /** Amount in the currency's smallest unit (cents, kobo). KES uses 1:1. */
  readonly amountMinor: number;
  readonly currency: string; // ISO 4217: 'USD' | 'GBP' | 'NGN' | 'KES'
}

export type ChargeStatus = 'succeeded' | 'pending' | 'requires_action' | 'failed';

export interface ChargeRequest {
  readonly money: Money;
  readonly reference: string; // OUR order id
  readonly idempotencyKey: string;
  readonly customer: { email: string; phone?: string };
  readonly returnUrl?: string;
  readonly metadata?: Record<string, string>;
}

export interface ChargeResult {
  readonly status: ChargeStatus;
  readonly providerId: string;
  readonly providerRef: string; // THEIR id, for reconciliation
  readonly redirectUrl?: string; // for redirect/STK flows
  readonly raw?: unknown; // escape hatch for debugging only
}
```

Now the contract every provider must satisfy. This is the seam the rest of the
system depends on:

```ts
export interface PaymentProvider {
  readonly id: string;
  /** Can this provider settle this money (currency/region)? */
  supports(money: Money): boolean;
  charge(req: ChargeRequest): Promise<ChargeResult>;
  /** Re-fetch the truth from the provider (for redirect/async flows). */
  verify(providerRef: string): Promise<ChargeResult>;
}
```

### A Stripe adapter (US and UK from the same class)

The key move: `stripe_us` and `stripe_uk` are not two adapters — they're **one
adapter with two configs**. Region differences become data.

```ts
interface StripeConfig {
  id: string; // 'stripe-us' | 'stripe-uk'
  secretKey: string;
  currencies: string[];
}

export class StripeProvider implements PaymentProvider {
  constructor(private readonly cfg: StripeConfig) {}
  get id() {
    return this.cfg.id;
  }

  supports(money: Money): boolean {
    return this.cfg.currencies.includes(money.currency);
  }

  async charge(req: ChargeRequest): Promise<ChargeResult> {
    const res = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.cfg.secretKey}`,
        'Idempotency-Key': req.idempotencyKey, // safe retries, for free
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: String(req.money.amountMinor), // already minor units — no maths
        currency: req.money.currency.toLowerCase(),
        confirm: 'true',
        'metadata[order]': req.reference,
      }),
    });
    const data = (await res.json()) as { id: string; status: string };
    return {
      status: mapStripeStatus(data.status),
      providerId: this.id,
      providerRef: data.id,
    };
  }

  async verify(providerRef: string): Promise<ChargeResult> {
    const res = await fetch(`https://api.stripe.com/v1/payment_intents/${providerRef}`, {
      headers: { Authorization: `Bearer ${this.cfg.secretKey}` },
    });
    const data = (await res.json()) as { id: string; status: string };
    return { status: mapStripeStatus(data.status), providerId: this.id, providerRef: data.id };
  }
}

function mapStripeStatus(s: string): ChargeStatus {
  switch (s) {
    case 'succeeded':
      return 'succeeded';
    case 'requires_action':
    case 'requires_confirmation':
      return 'requires_action';
    case 'processing':
      return 'pending';
    default:
      return 'failed';
  }
}
```

Notice that **status mapping lives inside the adapter**. The provider's vocabulary
(`requires_confirmation`, `processing`) never escapes into your domain. That single
discipline is what makes the rest of the codebase provider-agnostic.

### A Paystack adapter (redirect → verify)

```ts
export class PaystackProvider implements PaymentProvider {
  readonly id = 'paystack';
  constructor(private readonly secretKey: string) {}

  supports(money: Money): boolean {
    return ['NGN', 'GHS', 'ZAR', 'USD'].includes(money.currency);
  }

  async charge(req: ChargeRequest): Promise<ChargeResult> {
    const res = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: req.money.amountMinor,
        currency: req.money.currency,
        email: req.customer.email,
        reference: req.reference,
        callback_url: req.returnUrl,
      }),
    });
    const { data } = (await res.json()) as { data: { reference: string; authorization_url: string } };
    return {
      status: 'requires_action', // user must complete the redirect
      providerId: this.id,
      providerRef: data.reference,
      redirectUrl: data.authorization_url,
    };
  }

  async verify(providerRef: string): Promise<ChargeResult> {
    const res = await fetch(`https://api.paystack.co/transaction/verify/${providerRef}`, {
      headers: { Authorization: `Bearer ${this.secretKey}` },
    });
    const { data } = (await res.json()) as { data: { reference: string; status: string } };
    return {
      status: data.status === 'success' ? 'succeeded' : 'failed',
      providerId: this.id,
      providerRef: data.reference,
    };
  }
}
```

### An M-Pesa adapter (STK push → asynchronous callback)

M-Pesa is the one that breaks naive abstractions: `charge()` only _initiates_ the
prompt. The real outcome arrives later over a webhook, so the honest return value
is `pending`.

```ts
export class MpesaProvider implements PaymentProvider {
  readonly id = 'mpesa';
  constructor(
    private readonly cfg: { shortCode: string; passkey: string; callbackUrl: string },
    private readonly auth: () => Promise<string>, // OAuth token provider
  ) {}

  supports(money: Money): boolean {
    return money.currency === 'KES';
  }

  async charge(req: ChargeRequest): Promise<ChargeResult> {
    if (!req.customer.phone) throw new ChargeError('mpesa', 'PHONE_REQUIRED', 'M-Pesa needs a phone');

    const token = await this.auth();
    const res = await fetch('https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        BusinessShortCode: this.cfg.shortCode,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(req.money.amountMinor / 100), // KES has no minor unit on the wire
        PartyA: req.customer.phone,
        PhoneNumber: req.customer.phone,
        CallBackURL: this.cfg.callbackUrl,
        AccountReference: req.reference,
        TransactionDesc: req.reference,
      }),
    });
    const data = (await res.json()) as { CheckoutRequestID: string };
    return {
      status: 'pending', // the truth comes later, via the callback
      providerId: this.id,
      providerRef: data.CheckoutRequestID,
    };
  }

  async verify(providerRef: string): Promise<ChargeResult> {
    // STK Query endpoint — used by a reconciliation job if the callback is missed.
    // ...
    return { status: 'pending', providerId: this.id, providerRef };
  }
}
```

The amount conversion that was a silent bug in the god-function is now a single,
documented, _tested_ line inside the one place that owns M-Pesa's quirks.

These three providers settle money in three fundamentally different shapes — and
the adapter's job is to make all three look identical to the caller:

<figure class="diagram">
<svg viewBox="0 0 760 300" role="img" aria-label="Three provider flows: Stripe is synchronous (App, charge, succeeded); Paystack is a redirect (App, initialize, redirect, verify); M-Pesa is asynchronous (App, STK push, phone prompt, then a callback minutes later).">
<defs><marker id="ah2" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="var(--muted)"/></marker><marker id="ah2c" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="var(--cyan)"/></marker></defs>
<text x="16" y="34" fill="var(--signal)" font-size="12">1 · Stripe — synchronous</text>
<rect x="140" y="44" width="104" height="34" rx="5" fill="var(--ink-2)" stroke="var(--line)"/><text x="192" y="65" text-anchor="middle" fill="var(--paper)" font-size="12">App</text>
<rect x="300" y="44" width="104" height="34" rx="5" fill="var(--ink-2)" stroke="var(--line)"/><text x="352" y="65" text-anchor="middle" fill="var(--paper)" font-size="12">charge()</text>
<rect x="460" y="44" width="124" height="34" rx="5" fill="var(--ink-2)" stroke="var(--line)"/><text x="522" y="65" text-anchor="middle" fill="var(--paper)" font-size="12">succeeded ✓</text>
<line x1="244" y1="61" x2="298" y2="61" stroke="var(--muted)" stroke-width="1.4" marker-end="url(#ah2)"/>
<line x1="404" y1="61" x2="458" y2="61" stroke="var(--muted)" stroke-width="1.4" marker-end="url(#ah2)"/>
<text x="16" y="124" fill="var(--signal)" font-size="12">2 · Paystack — redirect</text>
<rect x="140" y="134" width="96" height="34" rx="5" fill="var(--ink-2)" stroke="var(--line)"/><text x="188" y="155" text-anchor="middle" fill="var(--paper)" font-size="12">App</text>
<rect x="284" y="134" width="104" height="34" rx="5" fill="var(--ink-2)" stroke="var(--line)"/><text x="336" y="155" text-anchor="middle" fill="var(--paper)" font-size="12">initialize</text>
<rect x="436" y="134" width="104" height="34" rx="5" fill="var(--ink-2)" stroke="var(--line)"/><text x="488" y="155" text-anchor="middle" fill="var(--paper)" font-size="12">redirect</text>
<rect x="588" y="134" width="116" height="34" rx="5" fill="var(--ink-2)" stroke="var(--line)"/><text x="646" y="155" text-anchor="middle" fill="var(--paper)" font-size="12">verify ✓</text>
<line x1="236" y1="151" x2="282" y2="151" stroke="var(--muted)" stroke-width="1.4" marker-end="url(#ah2)"/>
<line x1="388" y1="151" x2="434" y2="151" stroke="var(--muted)" stroke-width="1.4" marker-end="url(#ah2)"/>
<line x1="540" y1="151" x2="586" y2="151" stroke="var(--muted)" stroke-width="1.4" marker-end="url(#ah2)"/>
<text x="16" y="214" fill="var(--signal)" font-size="12">3 · M-Pesa — asynchronous</text>
<rect x="140" y="224" width="92" height="34" rx="5" fill="var(--ink-2)" stroke="var(--line)"/><text x="186" y="245" text-anchor="middle" fill="var(--paper)" font-size="12">App</text>
<rect x="280" y="224" width="104" height="34" rx="5" fill="var(--ink-2)" stroke="var(--line)"/><text x="332" y="245" text-anchor="middle" fill="var(--paper)" font-size="12">STK push</text>
<rect x="432" y="224" width="116" height="34" rx="5" fill="var(--ink-2)" stroke="var(--line)"/><text x="490" y="245" text-anchor="middle" fill="var(--paper)" font-size="12">phone prompt</text>
<rect x="612" y="224" width="116" height="34" rx="5" fill="var(--ink-2)" stroke="var(--cyan)"/><text x="670" y="245" text-anchor="middle" fill="var(--paper)" font-size="12">callback ✓</text>
<line x1="232" y1="241" x2="278" y2="241" stroke="var(--muted)" stroke-width="1.4" marker-end="url(#ah2)"/>
<line x1="384" y1="241" x2="430" y2="241" stroke="var(--muted)" stroke-width="1.4" marker-end="url(#ah2)"/>
<line x1="548" y1="241" x2="610" y2="241" stroke="var(--cyan)" stroke-width="1.4" stroke-dasharray="4 4" marker-end="url(#ah2c)"/>
<text x="579" y="277" text-anchor="middle" fill="var(--muted)" font-size="10">minutes later</text>
</svg>
<figcaption>Figure 2 — One contract, three timelines. The adapter hides whether the result is immediate, redirect-driven, or pushed back over a webhook.</figcaption>
</figure>

## Pattern 2: Registry + Strategy — choosing a provider at runtime

We have interchangeable providers; now we need to pick one. Don't hard-code the
choice — make selection a **strategy** over a **registry**.

```ts
export interface RoutingStrategy {
  select(money: Money, candidates: PaymentProvider[]): PaymentProvider | undefined;
}

/** Default: first registered provider that supports the currency. */
export class FirstSupportingStrategy implements RoutingStrategy {
  select(money: Money, candidates: PaymentProvider[]) {
    return candidates.find((p) => p.supports(money));
  }
}

export class ProviderRegistry {
  private readonly providers: PaymentProvider[] = [];
  constructor(private readonly strategy: RoutingStrategy = new FirstSupportingStrategy()) {}

  register(provider: PaymentProvider): this {
    this.providers.push(provider);
    return this;
  }

  resolve(money: Money): PaymentProvider {
    const provider = this.strategy.select(money, this.providers);
    if (!provider) throw new ChargeError('router', 'NO_PROVIDER', `No provider for ${money.currency}`);
    return provider;
  }
}
```

Routing rules now live in **data and strategy objects**, not in `if` branches. Want
to send USD to Stripe-US but fail over to a second processor on outage? Want to
A/B split Nigerian traffic between Paystack and a competitor for fee optimisation?
That's a new `RoutingStrategy` — the providers and the callers don't change.

```ts
const registry = new ProviderRegistry()
  .register(new StripeProvider({ id: 'stripe-us', secretKey: env.STRIPE_US, currencies: ['USD'] }))
  .register(new StripeProvider({ id: 'stripe-uk', secretKey: env.STRIPE_UK, currencies: ['GBP', 'EUR'] }))
  .register(new PaystackProvider(env.PAYSTACK))
  .register(new MpesaProvider(mpesaCfg, getMpesaToken));
```

**Stripe US and Stripe UK are two lines of config**, not two code paths. Adding a
fifth provider is one more `.register(...)` and a new adapter file — nothing
existing is touched. That's the Open/Closed Principle paying rent.

## Pattern 3: Facade — a single PaymentService the app talks to

Your application should depend on _one_ thing, and it should be expressed in your
language, with idempotency and persistence handled once.

```ts
export class PaymentService {
  constructor(
    private readonly registry: ProviderRegistry,
    private readonly store: PaymentStore, // your DB
  ) {}

  async charge(req: ChargeRequest): Promise<ChargeResult> {
    // Idempotency handled once, for every provider.
    const existing = await this.store.findByIdempotencyKey(req.idempotencyKey);
    if (existing) return existing;

    const provider = this.registry.resolve(req.money);
    const result = await provider.charge(req);

    await this.store.save({ ...result, idempotencyKey: req.idempotencyKey, reference: req.reference });
    return result;
  }
}
```

The controller is now blissfully ignorant of who Stripe even is:

```ts
const result = await payments.charge({
  money: { amountMinor: 4999, currency: 'USD' },
  reference: order.id,
  idempotencyKey: order.id, // safe to retry the whole HTTP request
  customer: { email: order.email },
});

if (result.redirectUrl) return redirect(result.redirectUrl); // Paystack
if (result.status === 'pending') return showWaiting(); // M-Pesa
if (result.status === 'succeeded') return showReceipt(); // Stripe
```

One call site. Three flows. Zero provider names.

## Normalise errors and webhooks too

The abstraction is only as good as its leakiest edge. Two edges always leak if you
let them: **errors** and **webhooks**.

Give every provider one error type so callers can branch on _meaning_, not on a
provider's HTTP quirks:

```ts
export class ChargeError extends Error {
  constructor(
    readonly providerId: string,
    readonly code: 'PHONE_REQUIRED' | 'DECLINED' | 'NO_PROVIDER' | 'RATE_LIMITED' | 'UNKNOWN',
    message: string,
  ) {
    super(message);
  }
}
```

And extend the interface so each adapter parses its own webhook into the same
`ChargeResult` your `verify()` returns — Stripe signature headers, Paystack's
`x-paystack-signature`, and M-Pesa's callback body all collapse into one shape:

```ts
interface PaymentProvider {
  // ...charge, verify, supports
  parseWebhook(rawBody: string, headers: Record<string, string>): ChargeResult;
}
```

Now a single webhook controller handles all four providers: look up the provider
by route, call `parseWebhook`, and update the order. No `if (provider === 'mpesa')`
anywhere in your business logic.

## Bad vs good: the test that matters

Ask one question of any integration design: **what do I touch to add provider #5?**

| Task                       | God-function                            | Adapter + Registry            |
| -------------------------- | --------------------------------------- | ----------------------------- |
| Add a provider             | Edit the shared `charge()` (risk all)   | New file + one `register()`   |
| Add Stripe UK alongside US | Copy-paste a branch                     | One config object             |
| Change routing             | Re-shuffle `if/else`                    | New `RoutingStrategy`         |
| Unit-test routing          | Mock four live APIs                     | Inject fake providers         |
| Onboard a new engineer     | Read 400 lines of branches              | Read one 12-line interface    |

## Why bad design actually hurts

This isn't aesthetics. The god-function pattern degrades along measurable axes:

- **Scalability of change.** Every new provider multiplies the branches in one
  function. Change cost grows with provider count instead of staying flat. The
  blast radius of a one-line edit is "all payments".
- **Scalability of load.** Provider-specific concerns (connection pools, rate
  limits, retries, circuit breakers) have nowhere to live except more `if`s, so
  they're usually omitted — and one slow provider takes down the shared path.
- **Maintainability.** Mixed return types force defensive code at every call site;
  the duplication between near-identical providers guarantees they drift out of
  sync and one gets a bug fix the other doesn't.
- **Testability.** You can't isolate routing from I/O, so the suite is slow,
  flaky, and skipped — which means regressions ship.
- **Onboarding.** The knowledge lives in branch order, not in a contract, so it
  lives in one person's head.

The adapter/registry/facade version inverts all of these: change cost is flat,
provider failures are isolated, behaviour is unit-testable with fakes, and the
contract is the documentation.

## What bad design costs the business

Technical debt isn't an engineering-only concern that lives in a backlog nobody
reads. It shows up on the roadmap as missed dates and on the P&L as money. The
clearest way to see it is to plot how much new value the team can ship as the
system grows.

<figure class="diagram">
<svg viewBox="0 0 760 340" role="img" aria-label="Line chart of features shipped per quarter over time. The tangled design line declines steadily as providers are added; the layered design line stays flat and high.">
<defs><marker id="ah3" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="var(--muted)"/></marker></defs>
<line x1="72" y1="48" x2="72" y2="276" stroke="var(--line)" stroke-width="1.2"/>
<line x1="72" y1="276" x2="720" y2="276" stroke="var(--line)" stroke-width="1.2" marker-end="url(#ah3)"/>
<line x1="72" y1="48" x2="716" y2="48" stroke="var(--line-soft)" stroke-width="1" stroke-dasharray="3 4"/>
<line x1="72" y1="124" x2="716" y2="124" stroke="var(--line-soft)" stroke-width="1" stroke-dasharray="3 4"/>
<line x1="72" y1="200" x2="716" y2="200" stroke="var(--line-soft)" stroke-width="1" stroke-dasharray="3 4"/>
<text x="30" y="166" text-anchor="middle" fill="var(--muted)" font-size="11" transform="rotate(-90 30 166)">Features / quarter</text>
<text x="396" y="320" text-anchor="middle" fill="var(--muted)" font-size="11">Time → (each step adds a provider / market)</text>
<polyline points="92,72 230,120 370,170 510,214 660,250" fill="none" stroke="var(--danger)" stroke-width="2.4"/>
<polyline points="92,72 230,80 370,76 510,84 660,78" fill="none" stroke="var(--cyan)" stroke-width="2.4"/>
<circle cx="92" cy="72" r="3.4" fill="var(--danger)"/><circle cx="230" cy="120" r="3.4" fill="var(--danger)"/><circle cx="370" cy="170" r="3.4" fill="var(--danger)"/><circle cx="510" cy="214" r="3.4" fill="var(--danger)"/><circle cx="660" cy="250" r="3.4" fill="var(--danger)"/>
<circle cx="230" cy="80" r="3.4" fill="var(--cyan)"/><circle cx="370" cy="76" r="3.4" fill="var(--cyan)"/><circle cx="510" cy="84" r="3.4" fill="var(--cyan)"/><circle cx="660" cy="78" r="3.4" fill="var(--cyan)"/>
<rect x="470" y="150" width="12" height="12" rx="2" fill="var(--danger)"/><text x="490" y="160" fill="var(--paper)" font-size="12">Tangled design</text>
<rect x="470" y="174" width="12" height="12" rx="2" fill="var(--cyan)"/><text x="490" y="184" fill="var(--paper)" font-size="12">Layered design</text>
<text x="600" y="244" text-anchor="middle" fill="var(--muted)" font-size="10">the "feature tax"</text>
</svg>
<figcaption>Figure 3 — Velocity over time. With a tangled design, every new provider drags the next one down. With a layered design, the cost per integration stays flat.</figcaption>
</figure>

### Delivery: the compounding "feature tax"

In a tangled design, every provider you add multiplies the branches, the
regression surface and the coordination needed for the _next_ change. The first
integration takes two weeks; by the fifth, the "same" work takes two months —
not because the work got harder, but because every change now risks all payments
and has to be re-tested end to end. Estimates stop being trustworthy, lead time
grows, and the change-failure rate climbs. The team isn't slower because it's
worse — it's slower because the design taxes every change.

A layered design keeps that cost flat: the fifth provider is the same shape of
work as the first.

### What the CFO / finance sees

- **Rising cost per feature.** More engineer-weeks buy less shipped value, and a
  growing share of payroll goes to _maintaining_ what exists rather than building
  what's next — opex creeping up while output flattens.
- **Lost and delayed revenue.** "We can't launch in Ghana this quarter" is a
  forecast miss. Slow time-to-market is unrecognised revenue.
- **Incident cost.** A shared payment path means one provider's outage fails
  _all_ checkouts — directly lost transactions, refunds, and support load.
- **Weak vendor leverage.** If switching or adding a processor is a rewrite, you
  can't negotiate fees or route to the cheapest rail — you simply overpay.
- **Audit & compliance drag.** Provider logic tangled through the codebase widens
  PCI / audit scope and makes correctness expensive to prove.

### What the CEO / board sees

- **Strategic agility.** Entering a market shouldn't be a quarter-long
  engineering project. When "add a payment method" gates expansion, architecture
  has become a business constraint.
- **Competitive exposure.** A competitor ships the integration in a sprint; you
  ship it in a quarter. Compounded over a roadmap, that's market share.
- **Trust & reputation.** Payment outages erode customer and partner confidence
  far beyond the dollars lost in the incident itself.
- **Talent risk.** Strong engineers leave brittle codebases; onboarding slows,
  and key knowledge stays trapped in one person's head.

### Symptom → impact → who feels it

| Engineering symptom                       | Business effect                        | Who feels it       |
| ----------------------------------------- | -------------------------------------- | ------------------ |
| The shared `charge()` is edited per provider | Rising cost & lead time per feature | Eng manager · CFO  |
| One provider's outage breaks the shared path | Lost transactions, refunds          | CFO · CEO          |
| Adding a region needs a rewrite           | Delayed market entry, missed forecast  | CEO · Board        |
| Switching processor = rewrite             | Overpaying fees, no vendor leverage    | CFO                |
| Brittle, untested payment code            | More incidents, engineer attrition     | CTO · CEO          |

The point for non-engineering stakeholders is simple: **good design isn't
gold-plating — it's what keeps the cost of change flat as the business grows.**
The patterns above convert payments from a compounding liability into a
predictable, fixed-cost capability.

## Closing

Multi-provider integration is a textbook case for three patterns working together:

- **Adapter** turns each provider's API into your single `PaymentProvider`
  contract — and absorbs its quirks (money units, status words, async flows).
- **Registry + Strategy** moves provider selection out of conditionals and into
  data you can change without redeploying logic.
- **Facade** gives the rest of the app one idempotent entry point in its own
  language.

The goal isn't pattern-collecting — it's that the things which vary (providers)
are quarantined from the things that don't (your checkout). Get that boundary
right and the fifth provider is a quiet afternoon, not a quarter.
