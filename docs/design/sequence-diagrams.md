# Implementation Sequence Design

## Scope

These sequences follow [C4](../architecture/c4.md), [arc42](../architecture/arc42.md), [OpenAPI](../api/openapi.yaml), and [code structure](../architecture/code-structure.md). They show behavior where authorization, ordering, history, or transaction scope affects correctness. The API-backed client consumes these flows; diagrams remain design detail rather than runtime evidence.

## Application submission and acceptance

**Trace:** RQ-07/RQ-08 → `createApplication`, `transitionApplicationStatus` → Applications, Documents, Placements, Notifications → `apps/api/src/modules/applications/`, `documents/`, `placements/`, `notifications/`, `apps/web/src/features/applications/`.

```mermaid
sequenceDiagram
  actor Student
  participant Web as Web applications feature
  participant API as ApplicationsController
  participant Auth as Identity/Authorization
  participant UC as Applications use case
  participant Docs as Documents interface
  participant DB as PostgreSQL transaction
  participant Place as Placements interface
  participant Notify as Notifications interface
  Student->>Web: submit application form
  Web->>API: POST /api/v1/applications
  API->>Auth: authenticate and assert Student ownership
  API->>UC: CreateApplication(command, identity)
  UC->>DB: begin transaction, verify eligible posting
  UC->>Docs: verify owned AVAILABLE CV/documents
  Docs-->>UC: authorized documents
  UC->>DB: reject duplicate student/posting
  UC->>DB: insert snapshot + Submitted history
  UC->>DB: commit
  API-->>Web: 201 Application(SUBMITTED)

  Note over Web,API: Authorized Company Staff/Admin later accepts.
  Web->>API: GET /api/v1/supervisors?applicationId={applicationId}
  API->>Auth: assert company relation or Admin
  API-->>Web: eligible supervisor IDs and names
  Note over Web,API: Collect supervisorUserId, startDate, endDate, optional note.
  Web->>API: POST /api/v1/applications/{applicationId}/status (ACCEPTED, supervisor, dates, note)
  API->>Auth: assert company relation or Admin
  API->>UC: TransitionApplicationStatus(command, identity)
  UC->>DB: begin transaction and lock application
  alt already ACCEPTED
    UC->>DB: compare immutable original acceptance command
    DB-->>UC: identical replay or conflicting input
    UC->>DB: finish transaction without mutations
    UC-->>API: 200 existing result or 409 ACCEPTANCE_CONFLICT, no writes
    API-->>Web: existing placement link or conflicting input error
  else first acceptance from INTERVIEW
  UC->>DB: validate transition and supervisor, append history + command
  UC->>Place: createOnce(application, supervisor, dates)
  Place->>DB: insert unique placement, initial assignment and reporting periods
  UC->>Notify: create status notification
  Notify->>DB: insert notification in same transaction
  UC->>DB: commit
  API-->>Web: 200 Application(ACCEPTED, placementId)
  end
  alt invalid, other terminal transition, or unauthorized
    UC-->>API: 4xx problem, rollback
    API-->>Web: no history, placement, or notification added
  end
```

## Weekly report: submit, review, revise

**Trace:** RQ-11/RQ-15 → `createReportDraft`, `saveReportDraft`, `submitReport`, `reviewReport` → Placements, Documents, Notifications → `apps/api/src/modules/placements/`, `documents/`, `notifications/`, `apps/web/src/features/placements/`.

```mermaid
sequenceDiagram
  actor Student
  actor Reviewer as Assigned Supervisor/Admin
  participant Web as Web placements feature
  participant API as ReportsController
  participant Auth as Identity/Authorization
  participant Reports as Reports use case
  participant Docs as Documents interface
  participant DB as PostgreSQL transaction
  participant Notify as Notifications interface
  Web->>API: GET /api/v1/placements/{placementId}/reporting-periods
  API-->>Web: canonical periods and dueAt, including missing reports
  Student->>Web: select period and save weekly report draft
  Web->>API: POST /api/v1/placements/{placementId}/reports
  API->>Auth: assert own Active placement
  API->>Reports: CreateOrSaveDraft
  Reports->>DB: enforce one placement/week, save private DRAFT text and attachment links
  API-->>Web: WeeklyReport(DRAFT)
  Student->>Web: submit complete draft
  Web->>API: POST /api/v1/reports/{reportId}/submit
  API->>Reports: SubmitReport
  Reports->>DB: begin transaction, verify Active placement
  Reports->>Docs: validate authorized AVAILABLE attachments
  Reports->>DB: append ReportVersion(n), copy attachments, clear draft, state=SUBMITTED
  Reports->>DB: commit
  Reviewer->>Web: request revision with feedback
  Web->>API: POST /api/v1/reports/{reportId}/reviews
  API->>Auth: assert assigned Supervisor or Admin
  API->>Reports: ReviewReport(reportVersionId, outcome, feedback)
  alt revision requested without feedback
    Reports-->>API: 400 validation problem
  else valid input
    Reports->>DB: begin, lock placement/report, compare current reportVersionId
    alt stale version, already reviewed, or ended placement
      Reports-->>API: 409 conflict, rollback without writes
    else current submitted version
    Reports->>DB: append version-linked review, state=outcome
    Reports->>Notify: create feedback/revision notification
    Notify->>DB: insert in same transaction
    Reports->>DB: commit
  end
  end
  Student->>API: PATCH /api/v1/reports/{reportId}, POST /api/v1/reports/{reportId}/submit
  API->>Reports: revise and resubmit
  Reports->>DB: append ReportVersion(n+1), retain prior versions/reviews
  API-->>Web: complete report history
```

## Authorized private document transfer

**Trace:** RQ-02/RQ-07/RQ-11 → `createDocumentUpload`, `completeDocumentUpload`, `getDocumentDownloadUrl`, `deleteDocument` → Documents → `apps/api/src/modules/documents/`, `apps/web/src/features/documents/`.

```mermaid
sequenceDiagram
  actor User
  participant Web as Web documents feature
  participant API as DocumentsController
  participant Auth as Identity/Authorization
  participant Docs as Documents use case
  participant DB as PostgreSQL
  participant Store as Private object storage
  User->>Web: select file and metadata
  Web->>API: POST /api/v1/documents
  API->>Auth: authenticate and authorize owner
  API->>Docs: CreateDocumentUpload
  Docs->>DB: create PENDING metadata/private key
  Docs->>Docs: sign five-minute API content token bound to session/document/PUT
  API-->>Web: document metadata + upload URL
  Web->>API: PUT /api/v1/documents/{documentId}/content?transferToken=... + bearer + bytes
  API->>Auth: recheck owner, session and token
  API->>Docs: validate and stream bytes
  Docs->>Store: put private object
  Web->>API: POST /api/v1/documents/{documentId}/complete
  API->>Docs: verify object and mark AVAILABLE or REJECTED
  Docs->>Store: verify object/metadata/integrity
  Docs->>DB: persist state
  Web->>API: GET /api/v1/documents/{documentId}/download-url
  API->>Auth: resolve linked record and assert access
  API->>Docs: issue temporary download URL
  Docs->>Docs: sign five-minute API content token bound to session/document/GET
  API-->>Web: same-origin API URL and expiresAt
  Web->>API: GET /api/v1/documents/{documentId}/content?transferToken=... + bearer
  API->>Auth: recheck current record access, session and token
  API->>Docs: read content
  Docs->>Store: get private object
  Store-->>Docs: byte stream
  Docs-->>API: byte stream
  API-->>Web: authenticated file download
```

## Non-blocking AI assistance

**Trace:** RQ-05/RQ-11/RQ-16 → `createAiJob`, `getAiJob` → AI Job Orchestration, AI worker → `apps/api/src/modules/ai-jobs/`, `apps/worker/src/`, `apps/web/src/features/ai-assistance/`.

```mermaid
sequenceDiagram
  actor User
  participant Web as Web AI-assistance feature
  participant API as AiJobsController
  participant Auth as Identity/Authorization
  participant Jobs as AI-job use case
  participant Source as Postings/Reports interface
  participant DB as PostgreSQL
  participant Worker as AI worker
  participant LLM as LLM provider
  User->>Web: request explanation or report summary
  Web->>API: POST /api/v1/ai-jobs
  API->>Auth: authenticate
  API->>Jobs: CreateAiJob(request, identity)
  Jobs->>DB: begin repeatable-read transaction
  Jobs->>Source: verify access, explicit reportVersionId or current match input
  Source-->>Jobs: minimized allowed input
  Jobs->>DB: reuse requester-scoped fingerprint or persist PENDING + immutable input_snapshot, commit
  API-->>Web: 202 Accepted (job id)
  Worker->>DB: recover expired claims, atomically claim PENDING with token + 120s lease
  Worker->>LLM: generate from persisted snapshot only, 60s timeout
  alt succeeds
    Worker->>DB: persist SUCCEEDED only if claim token and lease remain valid
  else bounded failure
    Worker->>DB: fenced retry (30s then 120s) or FAILED after three attempts
  end
  loop poll pending/processing
    Web->>API: GET /api/v1/ai-jobs/{aiJobId}
    API->>Auth: assert requester/source access
    API-->>Web: status and advisory result when available
  end
  Note over Worker,DB: Worker cannot change source workflows, scores, tasks, evaluations, or notifications.
```

## Deadline scheduling without AI

```mermaid
sequenceDiagram
  participant Timer as API lifecycle timer
  participant Scheduler as Notifications scheduler
  participant Source as Postings/Placements interfaces
  participant DB as Shared PostgreSQL transaction
  participant Web as Recipient inbox
  Timer->>Scheduler: scan every 60 seconds
  Scheduler->>Source: query currently relevant deadline windows
  Source->>DB: lock source and verify eligibility/submission/Active state
  Source-->>Scheduler: recipient, dueAt, record and reportingPeriodId
  Scheduler->>DB: insert notification ON CONFLICT dedupe_key DO NOTHING
  Scheduler->>DB: commit source check and insertion
  Web->>Scheduler: GET /api/v1/notifications via controller
  Scheduler-->>Web: caller-owned notifications and authorized targets
  Note over Timer,DB: Every replica may scan, restart catches current windows and overdue reports.
```

Role switching and assignment commands follow the lock/authorization protocols in [behavior rules](./behavior-rules.md). [Traceability](./traceability.md) includes their success, revocation, and conflict scenarios. API prefix is always `/api/v1`, OpenAPI is the canonical method/path/error contract.
