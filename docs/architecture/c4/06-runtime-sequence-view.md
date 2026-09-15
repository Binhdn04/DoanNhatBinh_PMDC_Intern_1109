# Runtime Sequences

These are **target-production** interactions. The current React/Vite application is a mock-data prototype and does not yet make these calls.

## 1. Happy path — internship discovery and deterministic match

```mermaid
sequenceDiagram
  autonumber
  actor Student
  participant SPA as React SPA
  participant API as Internships API
  participant DB as PostgreSQL
  participant Score as MatchScoreCalculator
  participant Outbox as Jobs / outbox

  Student->>SPA: Search and filter internships
  SPA->>API: GET /api/v1/internships?query&filters
  API->>DB: Query eligible open internships and student skills
  DB-->>API: Postings and skills
  API->>Score: calculate(studentSkills, requirements)
  Score-->>API: score, matchedSkills, missingSkills
  API->>Outbox: Optionally append explanation job
  API-->>SPA: 200 ranked results and score breakdown
  SPA-->>Student: Render results immediately
```

The Match Score never waits for an LLM; an explanation is optional enrichment.

## 2. Failure path — AI explanation fails without failing search

```mermaid
sequenceDiagram
  autonumber
  participant Worker
  participant Jobs as PostgreSQL jobs/outbox
  participant AI as AI adapter
  participant LLM as LLM provider
  participant Match as Match-score record

  Worker->>Jobs: Claim explanation job (lease)
  Worker->>AI: Generate minimized explanation input
  AI->>LLM: Request explanation
  LLM--x AI: Timeout or provider error
  AI-->>Worker: Retryable failure
  Worker->>Jobs: Record attempt; schedule exponential retry
  Worker->>Match: Keep explanation null and score available
  Note over Jobs,Match: Student can still use deterministic results.
```

## 3. Worker crash during a durable job

```mermaid
sequenceDiagram
  autonumber
  participant API
  participant DB as PostgreSQL
  participant W1 as Worker A
  participant W2 as Worker B
  participant Provider as Email / LLM provider

  API->>DB: Commit domain change and pending job atomically
  W1->>DB: Claim job with lease and idempotency key
  W1->>Provider: Send request
  Note over W1: Process crashes before completion is recorded
  W2->>DB: Find expired lease
  W2->>DB: Reclaim job
  W2->>Provider: Retry using idempotency key
  Provider-->>W2: Accepted / duplicate-safe result
  W2->>DB: Mark completed
```

An integration must support an idempotency key, or the worker must persist a provider-delivery identifier before retrying, to prevent duplicate messages.

## 4. Retry, compensation, and dead-lettering

```mermaid
sequenceDiagram
  autonumber
  participant Worker
  participant Jobs as Jobs / outbox
  participant Provider as External provider
  participant Ops as Operations

  Worker->>Jobs: Claim pending job
  Worker->>Provider: Execute side effect
  alt Transient failure and attempts remain
    Provider--x Worker: 5xx / timeout
    Worker->>Jobs: Store error and next_attempt_at
  else Permanent failure or attempts exhausted
    Provider--x Worker: Invalid request / final failure
    Worker->>Jobs: Move to dead-letter state
    Worker->>Ops: Emit alert and correlation ID
  else Success
    Provider-->>Worker: Success
    Worker->>Jobs: Mark completed
  end
```

Compensation applies only to external side effects that can be safely reversed (for example, canceling a queued notification). A committed application status, audit entry, task, or report is not rolled back merely because enrichment or delivery failed.
