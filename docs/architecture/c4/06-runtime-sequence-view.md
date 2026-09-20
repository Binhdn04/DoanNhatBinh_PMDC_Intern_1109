# Runtime Sequences

These runtime interactions expand the [canonical C4 overview](../c4.md). The React/Vite application calls the implemented API for core workflows; the optional-AI sequence remains deferred because no worker is deployed.

## 1. Synchronous discovery and deterministic Match Score

```mermaid
sequenceDiagram
  autonumber
  actor Student
  participant SPA as React SPA
  participant API as InternHub API
  participant DB as PostgreSQL
  participant Score as Match Score calculator

  Student->>SPA: Search and filter eligible postings
  SPA->>API: GET postings with search/filter/sort values
  API->>DB: Read eligible postings and student skills
  DB-->>API: Posting and skill data
  API->>Score: Calculate deterministic breakdown
  Score-->>API: Score, matched skills, missing skills
  API-->>SPA: Results and source score breakdown
  SPA-->>Student: Render results immediately
```

Search and deterministic scoring never wait for AI. The score remains advisory and cannot change opportunity visibility, application eligibility, or a hiring decision.

## 2. Requested AI enrichment and fallback

```mermaid
sequenceDiagram
  autonumber
  actor User as Authorized student or supervisor
  participant SPA as React SPA
  participant API as InternHub API
  participant DB as PostgreSQL AI jobs
  participant Worker as AI worker
  participant LLM as LLM provider

  User->>SPA: Request explanation or summary
  SPA->>API: POST authorized AI request
  API->>DB: Persist pending job after source authorization
  API-->>SPA: Accepted with pending status
  Worker->>DB: Claim job with lease
  Worker->>LLM: Send minimized authorized input
  alt Provider succeeds
    LLM-->>Worker: Generated advisory output
    Worker->>DB: Persist result and succeeded status
  else Provider is slow or fails
    LLM--x Worker: Timeout or error
    Worker->>DB: Persist retryable or failed status
  end
  SPA->>API: Refresh generated-result status
  API-->>SPA: Advisory output or unavailable state
```

The original report and deterministic score breakdown remain available in both outcomes. A failed job never rolls back a source record or blocks a core workflow.

## 3. Transactional application change and in-app notification

```mermaid
sequenceDiagram
  autonumber
  actor Staff as Authorized Company Staff or Admin
  participant SPA as React SPA
  participant API as InternHub API
  participant DB as PostgreSQL

  Staff->>SPA: Confirm allowed application transition
  SPA->>API: PATCH application status and note
  API->>API: Authorize and validate state transition
  API->>DB: Begin transaction
  API->>DB: Update current status and append immutable history
  opt Accepted
    API->>DB: Create exactly one placement
  end
  API->>DB: Create recipient-scoped in-app notification
  API->>DB: Commit transaction
  API-->>SPA: Updated application/history
```

The notification record is committed with the event that caused it; no worker or external delivery provider is involved.
