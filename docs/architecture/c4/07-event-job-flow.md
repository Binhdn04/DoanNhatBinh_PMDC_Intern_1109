# Domain Event to Durable Job Flow

This is InternHub's equivalent of a trigger-to-flow binding diagram. Domain triggers bind to durable job types rather than compile to a runtime manifest.

```mermaid
flowchart LR
  subgraph Transaction[API database transaction]
    Action[Authorized domain action]
    Change[Domain record and audit/history]
    Event[Outbox event]
    Action --> Change --> Event
  end

  Event -->|after commit| Job[(jobs table)]
  Job -->|claim with lease| Worker[Worker]
  Worker --> AI[AI adapter]
  Worker --> Notify[Notification provider]
  AI --> Result[Persist explanation or summary]
  Notify --> Result2[Mark delivery outcome]
  Worker -->|retry policy| Job
  Job -->|attempts exhausted| DLQ[Dead-letter state]
  DLQ --> Ops[Alert and operator review]

  classDef transaction fill:#DBEAFE,stroke:#2563EB,color:#0F172A
  classDef durable fill:#FEF3C7,stroke:#D97706,color:#0F172A
  classDef external fill:#F8FAFC,stroke:#64748B,color:#0F172A
  class Action,Change,Event transaction
  class Job,DLQ durable
  class AI,Notify,Ops external
```

| Domain trigger | Durable job | Consumer outcome |
| --- | --- | --- |
| Match score returned | `generate_match_explanation` | Save optional explanation; deterministic score remains usable. |
| Application status changed | `deliver_status_notification` | Create/deliver notification; preserve audit history on failure. |
| Weekly report submitted | `summarize_weekly_report` | Save optional AI summary; raw report remains usable. |
| Feedback or task assigned | `deliver_progress_notification` | Notify the placement student. |

The transaction commits the business data and outbox event together. Jobs are materialized and consumed only after commit, preventing an external side effect for a transaction that later rolls back.
