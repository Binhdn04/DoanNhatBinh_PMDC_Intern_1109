# Network and Trust-Boundary View

```mermaid
flowchart TB
  Browser[Browser]
  Internet((Public Internet))
  subgraph Public[Public boundary]
    Proxy[Reverse proxy / TLS]
  end
  subgraph Private[Private Docker Compose network]
    Web[Web static assets]
    API[NestJS API]
    Worker[Job worker]
    DB[(PostgreSQL)]
    Store[(Private object storage)]
  end
  subgraph ThirdParty[External trust boundary]
    LLM[LLM provider]
    Mail[Email / notification provider]
  end

  Browser -->|HTTPS 443| Internet --> Proxy
  Proxy -->|HTTP internal| Web
  Proxy -->|HTTP internal /api| API
  API -->|private SQL| DB
  API -->|private S3 API| Store
  Worker -->|private SQL| DB
  Worker -->|private S3 API| Store
  Worker -->|outbound HTTPS| LLM
  Worker -->|outbound HTTPS| Mail

  classDef public fill:#DBEAFE,stroke:#2563EB,color:#0F172A
  classDef private fill:#DCFCE7,stroke:#16A34A,color:#0F172A
  classDef external fill:#F8FAFC,stroke:#64748B,color:#0F172A
  class Proxy public
  class Web,API,Worker,DB,Store private
  class LLM,Mail external
```

Only the reverse proxy exposes a public port. Database, storage, worker, and provider credentials are secrets; they are neither bundled into the SPA nor committed to the repository.
