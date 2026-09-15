# Layered Architecture View

```mermaid
flowchart TB
  subgraph Presentation[Presentation layer]
    SPA[React SPA: features and shared UI]
    HTTP[NestJS controllers, guards, DTO validation]
  end
  subgraph Application[Application layer]
    UseCases[Use cases: search, apply, transition status, manage progress]
    Ports[Ports: repositories, job publisher, AI and notification adapters]
  end
  subgraph Domain[Domain layer]
    Models[Entities and value objects]
    Rules[MatchScoreCalculator, state machines, authorization policies]
    Events[Domain events]
  end
  subgraph Infrastructure[Infrastructure layer]
    Postgres[PostgreSQL repositories and outbox]
    ObjectStore[S3-compatible object storage]
    Providers[LLM and notification provider adapters]
    Worker[Worker / retry / DLQ]
  end

  SPA --> HTTP --> UseCases
  UseCases --> Models
  UseCases --> Rules
  UseCases --> Ports
  Models --> Events
  Ports --> Postgres
  Ports --> ObjectStore
  Ports --> Providers
  Events --> Postgres
  Postgres --> Worker
  Worker --> Providers
```

Dependencies point inward: the domain is independent of NestJS, PostgreSQL, React, and external providers. Infrastructure implements interfaces owned by the application/domain boundary.
