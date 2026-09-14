# C4 Level 2 — Container View

```mermaid
flowchart TB
  User[Authenticated user]

  subgraph InternHub[InternHub]
    direction TB
    Web[Web SPA<br/>React / Vite]
    API[API<br/>NestJS modular monolith]
    Worker[Worker<br/>AI and notification jobs]
    Database[(PostgreSQL<br/>system of record + jobs)]
    Storage[(Object storage<br/>private documents)]

    Web -->|REST JSON| API
    API -->|Durable job| Worker
    API -->|SQL| Database
    API -->|Scoped URL| Storage
    Worker -->|Claims / completes job| Database
  end

  LLM[LLM provider]
  Provider[Email / notification provider]

  User -->|HTTPS| Web
  Worker -->|Optional AI request| LLM
  Worker -->|Delivery request| Provider

  classDef client fill:#E8F1FF,stroke:#2563EB,color:#0F172A
  classDef app fill:#DBEAFE,stroke:#2563EB,color:#0F172A
  classDef data fill:#FEF3C7,stroke:#D97706,color:#0F172A
  classDef external fill:#F8FAFC,stroke:#64748B,color:#0F172A
  class User client
  class Web,API,Worker app
  class Database,Storage data
  class LLM,Provider external
```

The SPA is the only browser-facing application. The API owns synchronous business operations; the Worker handles jobs after commits so external latency does not block the user flow.
