---
title: 'Designing idempotent payment APIs that never double-charge'
description: 'A practical guide to exactly-once payment semantics — idempotency keys, request fingerprints, and the database patterns that make retries safe.'
date: 2026-05-18
updated: 2026-05-22
tags: [Payments, Distributed Systems, APIs]
keywords: 'idempotency key, payment api, exactly once, double charge, distributed systems'
author: 'Outhan Chazima'
---

Networks fail in the middle of requests. A client fires a `POST /payments`,
the connection drops before the response comes back, and now nobody knows
whether money moved. The client's only safe option is to retry — and if your
API isn't built for that, you've just charged someone twice.

This post is the playbook I use to make payment endpoints **safe to retry**.

## Why "just retry" is dangerous

A payment request is not idempotent by default. Each call creates a new charge,
so a naive retry produces duplicate ledger entries. The classic failure modes:

- The response is lost but the charge succeeded → client retries → double charge.
- A load balancer times out and replays the request to a second instance.
- A user double-clicks "Pay".

> The goal: the **same logical request** can be sent any number of times and
> the system behaves as if it were sent exactly once.

## Idempotency keys

The standard fix is a client-supplied **idempotency key** — a unique token per
logical operation, sent as a header:

```http
POST /payments HTTP/1.1
Idempotency-Key: 8f14e45f-ea1a-4f2b-9c1d-2b3c4d5e6f70
Content-Type: application/json

{ "amount": 2500, "currency": "KES", "account": "acc_123" }
```

The server stores the key the first time it sees it, along with the response it
produced. On a retry, it returns the stored response instead of charging again.

### A safe server-side flow

1. Look up the idempotency key.
2. If found and **completed**, return the saved response.
3. If found and **in progress**, return `409 Conflict` (a retry is racing the original).
4. If not found, claim the key, process the payment, then persist the result.

The claim must be atomic. In PostgreSQL, a unique constraint does the work for you:

```sql
CREATE TABLE idempotency_keys (
  key            TEXT PRIMARY KEY,
  request_hash   TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'in_progress',
  response_body  JSONB,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Inserting the key and processing the charge happen in **one transaction**, so a
crash can never leave a charge without its key (or vice versa).

## Fingerprint the request

An idempotency key alone trusts the client too much. Hash the meaningful parts
of the body and store it as `request_hash`. If the same key arrives with a
*different* payload, reject it with `422` — that's a client bug, not a retry.

```ts
const fingerprint = sha256(`${amount}:${currency}:${account}`);
```

## Expire keys, but not too soon

Keep keys long enough to outlive realistic retry windows (24–72h is common).
Expiring them too early reopens the double-charge window; keeping them forever
bloats the table. A nightly job that deletes rows older than the window is enough.

## Takeaways

- Treat every write endpoint as if it **will** be retried.
- Idempotency keys + a unique constraint + a single transaction = safe retries.
- Fingerprint the body so a reused key with new data is caught.
- Pair this with an append-only ledger and you can prove, after the fact, that
  every cent is accounted for.

Build for the failure modes first — the happy path takes care of itself.
