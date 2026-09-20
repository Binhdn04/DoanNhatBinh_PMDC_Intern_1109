# Target Code Structure

This supplementary repository view describes the implemented boundaries. The web application, API, shared packages, and infrastructure are in use; only the optional-AI worker remains deferred.

```mermaid
flowchart TB
  Root[InternHub repository]
  Root --> Web[apps/web]
  Root --> API[apps/api]
  Root --> Worker[apps/worker]
  Root --> Packages[packages]
  Root --> Infra[infra]
  Root --> Docs[docs]

  Web --> WebApp[src/app: shell and future routing]
  Web --> Features[src/features: discovery, applications, progress, evaluation, profile, admin]
  Web --> Shared[src/shared: UI, API client, auth, utilities]

  API --> Modules[src/modules: identity, organizations, postings, applications, placements, evaluations, monitoring, notifications, documents, ai]
  API --> Bootstrap[src/main and infrastructure wiring]
  Worker --> Consumers[AI job consumers and scheduling]

  Packages --> Contracts[contracts: versioned REST DTO types]
  Packages --> Domain[domain: pure matching and lifecycle rules]
  Infra --> Compose[docker-compose and deployment configuration]
```

The Presentation tier is `apps/web`. The Application tier is `apps/api` plus the AI-only `apps/worker`; `packages/domain` keeps framework-independent rules. PostgreSQL/object-storage adapters belong to the API's infrastructure wiring and remain private to the application tier.
