# Architecture Diagram Status

**Updated:** 2026-09-15  
**Scope:** Target production architecture for InternHub. The current `apps/web/` source is a React/Vite UI prototype with mock data.

| Diagram | Status | Location | Purpose |
| --- | --- | --- | --- |
| Business context (C4 L1) | Complete | [01-system-context](./c4/01-system-context.md) | People, InternHub, LLM, notification provider. |
| Containers (C4 L2) | Complete | [02-container-view](./c4/02-container-view.md) | SPA, API, worker, PostgreSQL, storage, external services. |
| Components (C4 L3) | Complete | [03-component-view](./c4/03-component-view.md) | API modules and dependency direction. |
| Code diagrams (C4 L4) | Complete | [04a](./c4/04a-discovery-matching-code-diagram.md), [04b](./c4/04b-progress-code-diagram.md), [04c](./c4/04c-application-status-transition-code-diagram.md) | Core use cases and domain objects. |
| Runtime sequences | Complete | [06-runtime-sequence-view](./c4/06-runtime-sequence-view.md) | Happy path, enrichment failure, worker crash, retry/DLQ. |
| Domain event to job binding | Complete | [07-event-job-flow](./c4/07-event-job-flow.md) | Outbox, worker, retry, dead-letter behavior. |
| Deployment | Complete | [05-deployment-view](./c4/05-deployment-view.md) | Docker Compose baseline. |
| Network / trust boundaries | Complete | [08-network-view](./c4/08-network-view.md) | Public ingress, private services, outbound calls. |
| Layered architecture | Complete | [09-layered-architecture](./c4/09-layered-architecture.md) | Presentation, application, domain, infrastructure boundaries. |
| Code structure | Complete | [10-code-structure](./c4/10-code-structure.md) | Target monorepo and migration boundary. |
| Platform map / runtime static images | Complete | [11-static-architecture-assets](./c4/11-static-architecture-assets.md) | Editable SVG platform and six-layer runtime diagrams, purpose-built for InternHub. |
| Use-case view | Complete | [12-use-case-view](./c4/12-use-case-view.md) | Actors, core v1 use cases, extensions, and authorization ownership. |

## Architecture decisions reflected

- Match Score is deterministic; AI only enriches explanations and summaries.
- API writes and outbox events commit atomically; the worker processes side effects after commit.
- Retry/DLQ covers external AI and notification work, not rollback of committed business records.
- Public exposure ends at the reverse proxy; data services remain on the private network.

## Maintenance rule

Update the diagram affected by every architectural decision, and then update this status document in the same pull request. Mark a diagram **proposed** rather than **complete** when its described implementation becomes materially different from the target design.
