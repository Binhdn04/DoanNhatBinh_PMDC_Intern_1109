# Target Code Structure

```mermaid
flowchart TB
  Root[InternHub repository]
  Root --> Web[apps/web]
  Root --> API[apps/api]
  Root --> Worker[apps/worker]
  Root --> Packages[packages]
  Root --> Infra[infra]
  Root --> Docs[docs/architecture]
  Web --> WebApp[src/app: routing, providers]
  Web --> Features[src/features: discovery, applications, progress, profile]
  Web --> Shared[src/shared: UI, API client, auth, utilities]
  API --> Modules[src/modules: identity, organization, internships, applications, placements, notifications, ai]
  API --> Bootstrap[src/main and infrastructure wiring]
  Worker --> Consumers[Job consumers and scheduling]
  Packages --> Contracts[contracts: REST DTO types]
  Packages --> Domain[domain: pure match and state-machine logic]
  Infra --> Compose[docker-compose and deployment configuration]
```

The React/Vite prototype now lives in `apps/web/` and is split into `app`, feature, shared UI, and style folders while retaining frontend mock data. The API, worker, package, and infrastructure portions remain planned boundaries.
