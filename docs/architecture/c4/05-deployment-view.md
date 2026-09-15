# Deployment View

This supplementary view expands the deployment baseline in the [canonical C4 overview](../c4.md). It supports the three-tier architecture without adding external notification delivery.

```mermaid
flowchart TB
  Internet((Internet)) --> Proxy[Reverse proxy\nTLS termination]

  subgraph Public[Public edge]
    Proxy --> Web[Web SPA\nReact static assets]
    Proxy --> API[API\nNestJS modular monolith]
  end

  subgraph Private[Private application and data network]
    API --> DB[(PostgreSQL\npersistent volume)]
    API --> Store[(Object storage\npersistent volume)]
    Worker[AI worker] --> DB
  end

  Worker -->|Optional advisory requests only| LLM[External LLM provider]
```

Only the reverse proxy exposes a public port. PostgreSQL, object storage, the worker, and provider credentials remain private. The API is the sole browser-facing application boundary; the worker processes durable AI jobs and never sends email, SMS, push, or other external notifications.
