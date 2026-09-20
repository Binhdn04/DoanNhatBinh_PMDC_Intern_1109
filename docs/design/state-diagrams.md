# Lifecycle State Design

## Scope

These lifecycle rules come from the [requirements](../requirements/requirements.md), [OpenAPI](../api/openapi.yaml), and [database design](../database/database-design.md). API writes are authorized by the owning module below `apps/api/src/modules/`; the API-backed frontend reflects, but does not define, these transitions.

## Posting lifecycle and derived eligibility

**Trace:** RQ-03–RQ-06 → `publishPosting`, `transitionPostingLifecycle`, `createApplication`, `savePosting` → Postings → `apps/api/src/modules/postings/`.

```mermaid
stateDiagram-v2
  [*] --> DRAFT: createPosting
  DRAFT --> OPEN: publish after required fields validate
  OPEN --> CLOSED: close
  CLOSED --> ARCHIVED: archive
  ARCHIVED --> [*]
  state "Eligible for discovery/new apply/save" as Eligible
  state "Unavailable for new apply/save" as Unavailable
  OPEN --> Eligible: deadline >= current product date
  OPEN --> Unavailable: deadline < current product date
  DRAFT --> Unavailable
  CLOSED --> Unavailable
  ARCHIVED --> Unavailable
```

Eligibility is derived from `OPEN` plus deadline, never stored independently. Closing/archiving preserves prior applications, saves, and placements.

## Application status and accepted-placement effect

**Trace:** RQ-07/RQ-08/RQ-15 → `createApplication`, `transitionApplicationStatus`, `withdrawApplication` → Applications, Placements, Notifications → `apps/api/src/modules/applications/`, `placements/`, `notifications/`.

```mermaid
stateDiagram-v2
  [*] --> SUBMITTED: submission + immutable initial history
  SUBMITTED --> UNDER_REVIEW: staff/Admin
  UNDER_REVIEW --> INTERVIEW: staff/Admin
  INTERVIEW --> ACCEPTED: staff/Admin
  SUBMITTED --> REJECTED: staff/Admin
  UNDER_REVIEW --> REJECTED: staff/Admin
  INTERVIEW --> REJECTED: staff/Admin
  SUBMITTED --> WITHDRAWN: owning Student
  UNDER_REVIEW --> WITHDRAWN: owning Student
  INTERVIEW --> WITHDRAWN: owning Student
  ACCEPTED --> [*]
  REJECTED --> [*]
  WITHDRAWN --> [*]
  note right of ACCEPTED
    Transaction: append history, create exactly
    one ACTIVE placement, notify Student.
    Identical original command replay returns existing result.
    Different acceptance command returns 409; no writes.
  end note
  note right of REJECTED
    Terminal states reject changes. Every successful
    transition appends immutable history.
  end note
```

## Placement, tasks, and assessments

**Trace:** RQ-09/RQ-10/RQ-12/RQ-13 → `transitionPlacementLifecycle`, `updateTaskStatus`, assessment upserts → Placements; Evaluations → `apps/api/src/modules/placements/`, `evaluations/`.

```mermaid
stateDiagram-v2
  [*] --> ACTIVE: accepted application creates placement
  ACTIVE --> COMPLETED: assigned Supervisor/Admin
  ACTIVE --> TERMINATED: assigned Supervisor/Admin
  COMPLETED --> [*]
  TERMINATED --> [*]
  note right of ACTIVE
    Active-only writes: tasks, student task updates,
    report drafts/submissions, and placement activity.
  end note
  note right of COMPLETED
    Authorized actors retain read access to history.
  end note
```

```mermaid
stateDiagram-v2
  [*] --> TODO: Supervisor/Admin creates task
  TODO --> IN_PROGRESS: placement Student
  IN_PROGRESS --> TODO: placement Student
  IN_PROGRESS --> DONE: placement Student
  TODO --> DONE: placement Student
  DONE --> IN_PROGRESS: placement Student
  DONE --> TODO: placement Student
  note right of TODO
    overdue = due date before today AND not DONE;
    derived only, never inferred progress.
  end note
```

```mermaid
stateDiagram-v2
  [*] --> DRAFT: authorized owner upserts
  DRAFT --> SUBMITTED: complete required input
  SUBMITTED --> [*]
  note right of DRAFT
    Applied independently to student self-assessment
    and supervisor/Admin performance evaluation.
    No combined grade is calculated.
  end note
```

Performance evaluation records one human-entered decision: `PASSED`, `FAILED`, `PENDING`, or `INCOMPLETE`.

## Weekly-report lifecycle and versions

**Trace:** RQ-11/RQ-15 → `createReportDraft`, `saveReportDraft`, `submitReport`, `reviewReport` → Placements, Documents, Notifications → `apps/api/src/modules/placements/`, `documents/`, `notifications/`.

```mermaid
stateDiagram-v2
  [*] --> DRAFT: create for placement + reporting week
  DRAFT --> DRAFT: save draft
  DRAFT --> SUBMITTED: submit complete report; append version n
  SUBMITTED --> APPROVED: expected version matches; append review
  SUBMITTED --> REVISION_REQUESTED: expected version matches and nonblank feedback; review + notify
  REVISION_REQUESTED --> REVISION_REQUESTED: save private revision and attachment links
  REVISION_REQUESTED --> SUBMITTED: resubmit; append version n+1 and clear draft
  APPROVED --> [*]
  note right of DRAFT
    One aggregate per canonical reporting period.
    Draft text/attachments always belong only to Student.
  end note
  note right of SUBMITTED
    Versions and reviews are append-only. Reviews carry reportVersionId; stale reviews return 409.
    An ended placement rejects drafts, submissions and reviews.
  end note
```

## Document upload lifecycle

**Trace:** RQ-02/RQ-07/RQ-11 → `createDocumentUpload`, `completeDocumentUpload`, `deleteDocument` → Documents → `apps/api/src/modules/documents/`.

```mermaid
stateDiagram-v2
  [*] --> PENDING: API creates metadata and five-minute API upload URL
  PENDING --> AVAILABLE: API verifies private object
  PENDING --> REJECTED: missing, invalid, or failed verification
  AVAILABLE --> DELETED: authorized deletion
  REJECTED --> DELETED: authorized deletion
  DELETED --> [*]
  note right of AVAILABLE
    API authorization is required before a temporary
    API download URL is issued and again when bytes transfer.
  end note
```

## Advisory AI-job lifecycle

**Trace:** RQ-16 → `createAiJob`, `getAiJob` → AI Job Orchestration, AI worker → `apps/api/src/modules/ai-jobs/`, `apps/worker/src/`.

```mermaid
stateDiagram-v2
  [*] --> PENDING: API authorizes and snapshots immutable input
  PENDING --> PROCESSING: worker claims with token and 120-second lease
  PROCESSING --> SUCCEEDED: current unexpired claim token writes advisory result
  PROCESSING --> PENDING: transient failure or expired lease; retry below three attempts
  PROCESSING --> FAILED: non-retryable or retry limit
  SUCCEEDED --> [*]
  FAILED --> [*]
  note right of PENDING
    Only MATCH_EXPLANATION or REPORT_SUMMARY.
    Failure/delay never blocks core workflows.
  end note
  note right of SUCCEEDED
    Generated content is advisory and separate from
    source records and human decisions.
  end note
```

## Session, assignment and calendar invariants

Role switching rotates the current session version only after validating membership. Assignment replacement atomically revokes the old row and creates the new row; revocation without replacement leaves the Active placement temporarily unassigned under Admin responsibility. Neither changes the immutable acceptance command. Reporting periods are generated at acceptance and do not depend on report state; deadline reminders cannot change report lifecycle. See [behavior rules](./behavior-rules.md) and [traceability](./traceability.md).
