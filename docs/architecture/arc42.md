# InternHub — arc42 Architecture Documentation

## 1. Introduction and Goals

InternHub helps students discover internships, apply transparently, and manage internship work with company staff and supervisors. Release v1 delivers three end-to-end capabilities: discovery and deterministic skill matching, application management with an immutable status audit, and placement progress with tasks, weekly reports, and feedback.

Primary quality goals are: correct authorization and ownership checks; explainable matching; auditable application changes; responsive student workflows; and a modular codebase that can evolve without a microservice migration.

## 2. Constraints

| Constraint | Decision |
| --- | --- |
| Existing client | Retain React 19, TypeScript, Vite, and Tailwind as the SPA baseline. |
| Server | TypeScript/NestJS modular monolith exposing JSON REST APIs. |
| Persistence | PostgreSQL is authoritative; PostgreSQL-compatible local development is required. |
| Auth | The API owns email/password authentication and signs short-lived JWT access tokens. |
| Deployment | Docker Compose baseline; no cloud provider is assumed. |
| Documentation | English Markdown and Mermaid diagrams stored in Git. |
| AI | AI is optional enrichment, never a source of truth for scores or workflow decisions. |

## 3. Context and Scope

The system boundary contains a web application and its backend. Students search and apply; Company Staff publish openings and process applications; Supervisors manage accepted placements; Admins administer organizations and reporting. InternHub calls an LLM provider only through an adapter and calls an email/notification provider for delivery. See [C4 context](./c4/01-system-context.md).

## 4. Solution Strategy

- Start as a modular monolith: one API deployable, explicit NestJS modules, independently testable domain services, and no cross-module repository access.
- Use REST over HTTPS between SPA and API. Contracts are versioned under `/api/v1` and documented with OpenAPI.
- Keep writes transactional in PostgreSQL. Application status changes atomically update the current state and append an audit-history row.
- Store binary documents outside PostgreSQL in S3-compatible object storage. Database rows contain metadata and object keys only.
- Dispatch non-critical work (AI generation, email, reminders) through durable jobs handled by a separate worker process. The write path must complete without waiting for AI.
- Compute Match Score deterministically from student skills and required/preferred internship skills. AI receives already-authorized, minimized structured data solely to generate explanations or report summaries.

## 5. Building Block View

### Level 1 — Modules

| Module | Owns | v1 |
| --- | --- | --- |
| Identity & Access | accounts, credentials, JWT, roles, authorization policy | Yes |
| Organization | student profiles, companies, Company Staff, supervisors, skills | Yes |
| Internships & Matching | postings, search/filtering, score calculation, explanation requests | Yes |
| Applications | submissions, documents, status state machine, audit history | Yes |
| Placements & Progress | accepted placement, tasks, weekly reports, feedback | Yes |
| Notifications | in-app notifications and delivery jobs | Supporting |
| AI Integration | provider adapter, prompts, redaction, retry/fallback | Supporting |
| Evaluation | assessments and completion decision | Extension |
| Monitoring & Reporting | dashboards and aggregate reporting | Extension |

Each module exposes application services and DTOs; it may not query another module's tables directly. Cross-module writes use service interfaces or domain events inside the monolith.

### Level 2 — Client features

The SPA is organized by `features/discovery`, `features/applications`, `features/progress`, and `features/profile`. Shared routing, API client, authentication/session state, query cache, design-system components, and domain types are separate from feature UI. The [C4 component view](./c4/03-component-view.md) zooms into the API container. Code-level diagrams cover [Discovery & Matching](./c4/04a-discovery-matching-code-diagram.md), [Application Management](./c4/04-code-diagram.md), and [Internship Progress](./c4/04b-progress-code-diagram.md).

## 6. Runtime View

### Search and match

1. The authenticated student calls `GET /api/v1/internships` with search/filter values.
2. Internships & Matching performs keyword/filter search and loads the student's skills.
3. The domain service calculates and returns score, matched skills, and missing skills. It may enqueue an explanation job; search is successful regardless of that job.

### Application transition

1. A student submits an application and document metadata; the API verifies eligibility and ownership.
2. Applications creates the record and the initial `submitted` history entry in one transaction.
3. Company Staff moves it only along allowed transitions. The API updates `applications.status`, appends `application_status_history`, and emits a notification event in one transaction/outbox.

### Weekly reporting and AI fallback

1. A placement student submits a weekly report; the API enforces placement ownership and week uniqueness.
2. The API persists raw content, returns success, and enqueues a summary job.
3. The worker calls the AI adapter. On timeout, validation failure, or provider error it records a failed job and leaves `ai_summary` null; raw content stays available.
4. A supervisor adds feedback only for a placement they supervise; the Notifications module informs the student.

## 7. Deployment View

Docker Compose runs `reverse-proxy`, `web`, `api`, `worker`, `postgres`, and S3-compatible `object-storage`. The proxy terminates TLS in production and routes `/` to the SPA and `/api` to the API. Only the proxy is publicly reachable. PostgreSQL and object storage use persistent volumes and are private to the Compose network. See [C4 deployment view](./c4/05-deployment-view.md).

## 8. Cross-cutting Concepts

| Concern | Rule |
| --- | --- |
| Identity | Password hashes use Argon2id or bcrypt; tokens are signed, short-lived, and never stored in browser local storage when an HttpOnly cookie deployment is available. |
| Authorization | Roles: `Student`, `CompanyStaff`, `Supervisor`, `Admin`. Role checks are followed by resource ownership/organization checks. |
| Validation | Validate all request DTOs server-side; reject unknown status values and untrusted file metadata. |
| Audit | Application status history is append-only; actor, timestamp, old/new status, and note are retained. |
| Files | Issue scoped upload/download URLs; validate MIME type and size; malware scanning is a production hardening extension. |
| Errors | Return RFC 9457-style problem responses; never expose stack traces or provider credentials. |
| Observability | Structured logs include correlation ID, actor ID where allowed, module, and event; capture request latency, job failures, and authorization denials. |
| Privacy | Send only the minimum necessary skills/title/report text to the AI provider; do not send credentials, private documents, or unrelated profile data. |

## 9. Architecture Decisions

The governing decisions are recorded in [ADR-001](./adr/ADR-001-modular-monolith.md) through [ADR-007](./adr/ADR-007-ai-adapter.md).

## 10. Quality Requirements

| Scenario | Acceptance measure |
| --- | --- |
| Authorized application update | Only owning Company Staff or Admin can transition an application; every successful transition has one matching audit row. |
| Deterministic matching | Given identical student skills and posting requirements, the score and skill breakdown are identical. |
| AI outage | Search, apply, submit report, and read raw report content remain usable when the LLM is unavailable. |
| File isolation | A user cannot obtain a document URL for an application they cannot read. |
| Extensibility | Adding Evaluation must not require modifying the Discovery or Applications domain tables/services. |
| Performance target | Normal list/search APIs target p95 below 500 ms without waiting for AI; asynchronous work is monitored separately. |

## 11. Risks and Technical Debt

- The current prototype centralizes UI/state/mock data in `src/App.tsx`; migrate incrementally behind feature boundaries.
- Existing DBML has `company_admins` but no `company_staff` user role. Replace the ambiguity with `CompanyStaff` and a company membership relation before backend implementation.
- Full-text search starts with PostgreSQL keyword search. Semantic/vector search is deferred until relevance measurements justify it.
- Local JWT authentication is appropriate for v1 but requires rotation, reset-password, email verification, and brute-force protection before public launch.
- Docker Compose is a portable baseline, not high availability. Managed database, secret management, backups, and container orchestration are a later operational decision.

## 12. Glossary

| Term | Meaning |
| --- | --- |
| Company Staff | A company user authorized to manage its postings and applications. |
| Supervisor | A person assigned to oversee a placement and provide task/report feedback. |
| Placement | The active internship relationship created from an accepted application. |
| Match Score | Deterministic weighted skill-overlap value from 0 to 100. |
| Outbox/job | A durable record that causes asynchronous notification or AI work after a transaction commits. |
