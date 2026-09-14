# C4 Deployment View — Docker Compose Baseline

```mermaid
flowchart TB
  Internet((Internet)) --> Proxy[Reverse proxy\nTLS termination]
  subgraph compose[Private Docker Compose network]
    Proxy --> Web[web\nReact static assets]
    Proxy --> Api[api\nNestJS]
    Api --> Pg[(postgres\npersistent volume)]
    Api --> Store[object-storage\npersistent volume]
    Worker[worker\nNestJS jobs] --> Pg
    Worker --> Store
  end
  Worker --> LLM[External LLM provider]
  Worker --> Email[External email/notification provider]
```

Only the reverse proxy exposes ports. Database credentials, JWT signing key, AI credentials, and storage credentials are injected as secrets/environment configuration and are never committed.

