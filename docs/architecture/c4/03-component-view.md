# C4 Level 3 — API Component View

This diagram zooms into the **NestJS API** container from the container view. The SPA has feature boundaries documented in the [refactor blueprint](../refactor-blueprint.md); it is not mixed into this container-level view.

```mermaid
flowchart TB
  Client[Web SPA]

  subgraph API[NestJS API container]
    direction TB
    Access[Identity & Access]

    subgraph Core[Core v1 modules]
      direction LR
      Organization[Organization]
      Matching[Internships & Matching]
      Applications[Applications]
      Progress[Placements & Progress]
    end

    subgraph Supporting[ ]
      direction LR
      Notifications[Notifications]
      AI[AI Integration]
    end

    Persistence[Persistence adapters]

    Access --> Core
    Organization --> Matching
    Applications -->|Accepted application| Progress
    Applications --> Notifications
    Progress --> Notifications
    Matching --> AI
    Progress --> AI
    Core --> Persistence
    Supporting --> Persistence
  end

  Database[(PostgreSQL)]
  Worker[Background worker]

  Client -->|REST /api/v1| Access
  Persistence -->|SQL| Database
  AI --> Worker
  Notifications --> Worker

  classDef entry fill:#E8F1FF,stroke:#2563EB,color:#0F172A
  classDef core fill:#DBEAFE,stroke:#2563EB,color:#0F172A
  classDef support fill:#F3E8FF,stroke:#9333EA,color:#0F172A
  classDef data fill:#FEF3C7,stroke:#D97706,color:#0F172A
  class Client,Access entry
  class Organization,Matching,Applications,Progress core
  class Notifications,AI support
  class Persistence,Database data
```

Dependencies cross modules only through application-service interfaces or domain events. `Applications` emits an accepted-application event consumed by `Placements & Progress`; it does not create task/report records itself. AI and notification work is queued as durable jobs for the Worker.
