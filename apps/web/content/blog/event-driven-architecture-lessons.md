---
title: 'Five lessons from running event-driven systems in production'
description: 'Hard-won lessons on Kafka, eventual consistency, idempotent consumers, and observability from building event-driven platforms at scale.'
date: 2026-04-02
tags: [Event-Driven Architecture, Kafka, Distributed Systems]
keywords: 'kafka, event driven architecture, eventual consistency, idempotent consumer, dead letter queue'
author: 'Outhan Chazima'
---

Event-driven architecture is sold as the cure for tight coupling. It is — but
it trades synchronous bugs you can see for asynchronous ones you can't. Here are
five lessons I keep relearning.

## 1. Consumers must be idempotent

At-least-once delivery is the default almost everywhere. Your consumer **will**
see the same message twice. Design every handler so reprocessing is a no-op:

```python
def handle(event):
    if already_processed(event.id):
        return
    with transaction():
        apply(event)
        mark_processed(event.id)
```

## 2. Order is a feature you pay for

Kafka guarantees order within a partition, not across them. If two events must
be processed in order, they must share a partition key. Pick the key carefully —
usually the entity id (account, order, user).

## 3. Schemas are contracts

A producer changing a field breaks every consumer silently. Put a schema
registry in front of the topic and make compatibility checks part of CI.

| Change                | Safe? |
| --------------------- | ----- |
| Add optional field    | ✅    |
| Remove a field        | ❌    |
| Rename a field        | ❌    |
| Widen an enum         | ⚠️    |

## 4. Dead letters are not optional

A poison message will block a partition forever if you let it. Route failures to
a **dead-letter topic** after N retries, alert on it, and keep the original
payload so you can replay once the bug is fixed.

## 5. You can't debug what you can't trace

In a synchronous system a stack trace tells the whole story. In an event-driven
one, a single user action fans out across services. Propagate a **correlation
id** on every event and log it everywhere — it's the thread that stitches the
story back together.

> Eventual consistency is fine. *Eventual* observability is not.

## Closing

Event-driven systems reward teams that treat reliability as a first-class
feature: idempotent consumers, explicit ordering, versioned schemas,
dead-letter handling, and tracing from day one. Skip those and the decoupling
you bought will cost you the debuggability you lost.
