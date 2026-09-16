# InternHub - arc42 Architecture Documentation

## 1. Introduction and goals

InternHub supports the authenticated, role-aware internship workflows documented in [`docs/requirements/requirements.md`](../requirements/requirements.md) and [`docs/ui/`](../ui/): student discovery and applications; company posting and application management; supervised placement work; reports; independent assessments; read-only monitoring; and in-app notifications.

The primary architectural goals are:

- enforce role plus record-relationship authorization on every protected operation;
- preserve deterministic matching, lifecycle rules, documents, and audit history correctly;
- keep the core UI flows responsive even when optional AI is unavailable;
- preserve a simple deployable shape while retaining clear module boundaries; and
- make source data and human decisions distinct from generated assistance.

The [C4 overview](./c4.md) is the structural companion to this document.

## 2. Constraints

| Constraint | Architectural response |
| --- | --- |
| Current web client | Retain the React 19, TypeScript, Vite, and Tailwind prototype as the presentation baseline. It currently uses mock data and local screen state. |
| Backend status | NestJS API, AI worker, shared contracts/domain packages, and deployment configuration are planned only; this documentation does not implement them. |
| Product authority | The requirements/specification override mock UI, DBML, older diagrams, and prior architecture assumptions when they conflict. |
| Persistence | PostgreSQL-compatible relational persistence is the target system of record. Private S3-compatible storage holds file bytes. |
| Documentation | Architecture documentation is English Markdown with Mermaid diagrams in Git. |
| Product scope | Notifications are in-app only. AI is optional, advisory explanation/summarization only. AI interviews, screening, automated decisions, semantic search, and external notification delivery are excluded. |

## 3. Context and scope

InternHub begins after authentication. Students use their own profile, applications, placements, reports, and self-assessments. Company Staff manage only their company records. Supervisors work only with explicitly assigned placements. Admins administer records and can view program monitoring, which remains read-only at the dashboard level.

InternHub interacts with an LLM provider only through the AI worker for an authorized student-requested Match Score explanation or supervisor-requested submitted-report summary. There are no external notification providers in the target scope.

## 4. Solution strategy

InternHub is a three-tier modular monolith.

- **Presentation tier:** a React SPA provides the documented application shell, role-specific navigation, accessible forms, lists, details, timelines, and AI advisory panels. It calls the API over HTTPS and contains no trusted authorization logic.
- **Application tier:** a NestJS API provides REST endpoints, authentication/authorization, validations, use cases, transactions, and module boundaries. A separate worker performs only durable, optional AI jobs.
- **Data tier:** PostgreSQL is the authoritative store for business records, histories, notifications, generated-result status, and AI jobs. Private object storage contains document bytes and is accessed only through API-authorized operations.

The API completes core reads and writes synchronously. It creates event notifications in the transaction that changes the source record; its internal Notifications scheduler inserts deduplicated deadline reminders every 60 seconds using the same reporting calendar. It queues AI only after authorization; core score calculation, application submission, report submission, and all human workflow decisions complete without waiting for a provider.

## 5. Building block view

| Module | Owns | Important rules |
| --- | --- | --- |
| Identity and Access | Authenticated users, roles, access policies | Valid role and record relationship are both required. |
| Organizations and Student Profiles | Profiles, skills, preferences, companies, memberships, supervisor assignments | Company Staff scope is company membership; supervisor scope is placement assignment. |
| Postings and Deterministic Matching | Posting lifecycle, search, saved opportunities, score breakdown | Only eligible postings discover/apply; score is deterministic and advisory. |
| Applications | Submission snapshots, transitions, immutable status history | One application per student/posting; accepting creates one placement. |
| Placements and Progress | Placements, tasks, reports, review/version history | Active-state and actor ownership rules control writes. |
| Evaluations | Separate self-assessments and performance evaluations | Never derive a combined academic grade. |
| Monitoring | Program/term aggregates and deadlines | Read-only source-record visibility with drill-through. |
| In-app Notifications | Recipient-scoped notification/read state | Created for required events; no external delivery. |
| Documents | File metadata, validation, private transfers | API authorizes every operation. |
| AI Job Orchestration | Job state and generated advisory output | No generated output can drive eligibility, workflow, task, rating, or completion decisions. |

Modules expose application-service interfaces or domain events. A module does not reach into another module's repository/table. Application write transactions persist both the source change and required audit/notification records atomically.

## 6. Runtime view

### Core REST path

1. The SPA calls a versioned REST endpoint with the user session.
2. API guards validate identity, active role, and ownership/assignment before exposing a record or action.
3. The use case validates lifecycle and form rules, then writes through repositories in one transaction.
4. The API returns source data, updated lifecycle state, and retained history for the UI to render.

For application transitions, the transaction updates the current status, appends immutable history, creates a placement once only when accepting, and stores any required in-app notification. For report feedback/revision and task assignment, notifications are created in the same committed change.

### Optional AI path

1. An authorized user requests a Match Score explanation or submitted-report summary.
2. The API confirms the underlying score breakdown/report access and persists a durable pending AI job with an immutable minimized input snapshot and explicit source/version identity.
3. The worker claims the snapshotted job with a fenced 120-second lease, invokes the provider with a 60-second timeout, and records succeeded, failed, or retryable status. Three attempts are allowed; expired processing claims are recovered without reloading mutable source data.
4. The SPA shows source information at all times and may refresh the advisory result. On failure or delay it shows a non-blocking unavailable state.

## 7. Deployment view

The initial deployment remains intentionally small: a reverse proxy serves the SPA and routes `/api` to the API; API, worker, PostgreSQL, and object storage run on a private network. Only the proxy is publicly reachable. File content PUT/GET routes also pass through that proxy to the API, which streams private storage bytes. Configure a request body limit allowing 10 MiB; redact transfer tokens and disable caching for content. No browser-facing storage endpoint or storage CORS policy is required. Database, storage, JWT, and AI-provider credentials are deployment secrets rather than repository content.

This baseline supports local Docker Compose use but does not claim high availability. Backups, secret management, managed services, and orchestration are operational extensions to make when scale or production policy requires them.

## 8. Cross-cutting concepts

| Concern | Rule |
| --- | --- |
| Authorization | Enforce role plus organization/student/placement relationship server-side; hide disallowed UI actions but treat direct URLs as untrusted. |
| Validation | Validate request DTOs and lifecycle transitions server-side; preserve form values client-side after recoverable errors. |
| Audit and history | Application transitions are append-only. Report submission/review versions are retained. Historical records remain readable to authorized actors after lifecycle closure. |
| Data integrity | Database constraints and transactional use cases enforce application uniqueness, placement creation after acceptance, report-week uniqueness, and recipient-scoped notifications. |
| Files | Store metadata/object keys in PostgreSQL and bytes privately in object storage. Issue access only after an API authorization check. |
| AI safety and privacy | Send only minimized authorized score/report input. Label output generated/advisory. Do not transmit credentials, unrelated profiles, or private documents. |
| Errors | Return consistent problem responses without stack traces or secrets. AI failure is a recoverable advisory state, not a workflow error. |
| Observability | Use structured correlation-aware logs and record authorization denials, request latency, AI-job retries/failures, and persistence errors. |
| Accessibility | The presentation tier follows the UI design system for semantic controls, keyboard navigation, linked validation errors, contrast, responsive reflow, and text equivalents. |

## 9. Architecture decisions and rationale

| Decision | Rationale and trade-off |
| --- | --- |
| Modular monolith API | Keeps v1 simple to deploy and lets relational lifecycle changes commit atomically. It requires disciplined module interfaces to avoid a coupled monolith. |
| REST between SPA and API | Fits the current SPA and role-aware screens with a familiar, inspectable boundary. It does not provide offline-first behavior or real-time push by itself. |
| Server-side role-plus-record policies | UI state cannot protect data. Central policy checks protect direct links, API calls, files, and notification targets. |
| PostgreSQL as system of record | Supports relationships, uniqueness, audits, and monitoring queries. Search begins with keyword/filter indexes; semantic search is deferred. |
| Private object storage | Prevents binary file data from bloating relational rows while keeping authorization at the API. It adds metadata and transfer-lifecycle coordination. |
| In-app notifications in write transactions | Guarantees required notification records accompany committed domain events without introducing an external delivery dependency. Notifications appear when the app is opened/refreshed rather than being pushed externally. |
| AI worker for enrichment only | Isolates provider latency, retries, and privacy controls from core workflows. It adds job-operation complexity but never controls a decision. |
| Separate evaluation aggregates | Preserves ownership and avoids falsely representing an academic grade. The UI and APIs must retain two distinct views. |

## 10. Quality requirements

| Scenario | Acceptance measure |
| --- | --- |
| Unauthorized record access | An unrelated Student, Company Staff member, or unassigned Supervisor receives no record data or permitted action. |
| Application acceptance retry | A successful or retried acceptance yields one placement and one immutable transition history entry per completed transition. |
| Report revision | A revision request requires feedback; resubmission retains prior submitted versions and review entries. |
| AI outage | Discovery, deterministic scoring, applications, reports, report reading, and human decisions remain usable; source data is visible without generated output. |
| Document isolation | A user cannot retrieve a document transfer authorization for a record they cannot view. |
| Responsive UI | Desktop sidebar/table layouts reflow to documented compact navigation and single-column usable controls without loss of core action access. |
| Monitoring safety | Monitoring returns scoped aggregates/deadlines and drill-through links but offers no direct source-record modification. |

## 11. Risks and technical debt

- The prototype has mixed-role navigation, local mock state, and legacy interview screens; it must be replaced incrementally with role-aware, API-backed flows when implementation begins.
- The current DBML lacks `company_staff` and uses `company_admins`; it needs a company-membership model. It also contains legacy AI-interview and combined-score concepts that conflict with the current requirements.
- The specified durable AI input snapshots, fenced leases, three-attempt retry limit, and worker interruption recovery still require implementation and fault-injection verification.
- AI requests introduce privacy, provider availability, cost, and generated-content clarity risks. Provider output must remain visibly advisory and separate from records/decisions.
- A modular monolith has a practical scaling ceiling. Module boundaries and REST/contracts permit later extraction only when operations demonstrate a need.
- Docker Compose is a development baseline, not a complete production-resilience strategy.

## 12. Glossary

| Term | Meaning |
| --- | --- |
| Company Staff | Company member authorized for that company's records. |
| Placement | Internship relationship created exactly once from an accepted application. |
| Match Score | Deterministic 0-100 skill-alignment value; advisory only. |
| In-app notification | Recipient-owned persisted event with read/unread state; not an external message. |
| AI job | Durable optional request for generated explanation or summary, processed by the worker. |

## 13. Refined runtime protocols

The normative [behavior rules](../design/behavior-rules.md) complete the runtime decisions identified in the audit: session-versioned active-role switching; supervisor selection and Admin-only reassignment; exact acceptance-command replay; canonical weeks/timezones and scheduler deduplication; owner-only report drafts with version-conditional reviews; API-mediated five-minute file authorizations; weighted skill-v1 matching; and immutable AI inputs with lease recovery.

Identity validates JWT `sid`, activeRole, session version and expiry against auth_sessions and current user_roles on every request. Role switching locks the session, increments its version and returns a fresh token; the client clears prior role data. Relationship policies always query current memberships/assignments, including on transfers and AI polling.

The Notifications scheduler is an API lifecycle service, not an AI-worker responsibility. Every replica can scan each minute; source locks and a unique dedupe key make concurrent inserts safe. Catch-up covers still-relevant windows and overdue reports. Report periods exist before drafts and are the common source for UI, monitoring, and reminders. Health checks surface scheduler scan age above five minutes. Event and reminder creation use separate triggers but the same recipient-scoped inbox.

Quality verification must include the complete [acceptance matrix](../design/traceability.md), particularly role/assignment revocation, private revision attachments, stale reviews, concurrent acceptance/replay, missed scheduler ticks and expired AI claims. This is a corrected target design; runtime sign-off requires implementation evidence.
