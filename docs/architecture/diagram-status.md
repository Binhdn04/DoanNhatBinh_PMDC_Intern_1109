# Architecture Diagram Status

**Updated:** 2026-09-15  
**Scope:** Implemented InternHub architecture plus the deferred optional-AI extension. The current `apps/web/` source is an API-backed React/Vite application.

| Diagram | Status | Location | Purpose |
| --- | --- | --- | --- |
| C4 context, containers, and components | Canonical | [c4 overview](./c4.md) | C1-C3 structure, three-tier mapping, dependencies, boundaries, and requirement/UI-flow mapping. |
| Deployment | Supplementary | [deployment view](./c4/05-deployment-view.md) | Small private-network deployment baseline; worker egress applies only if optional AI is enabled. |
| Runtime sequences | Supplementary | [runtime sequences](./c4/06-runtime-sequence-view.md) | Core synchronous flows, transactional in-app notifications, and optional AI fallback. |
| Code structure | Supplementary | [code structure](./c4/10-code-structure.md) | Implemented monorepo boundaries and the deferred worker extension. |

## Architecture decisions reflected

- Match Score is deterministic; AI only provides optional explanations and summaries.
- The API creates in-app notifications in the same transaction as the triggering domain event.
- The worker handles durable AI jobs only; it does not provide external notification delivery or change source records/workflow decisions.
- The browser reaches only the API boundary; PostgreSQL and object storage remain private data-tier services.

## Maintenance rule

Update the canonical C4 overview and arc42 whenever a structural decision changes. Update a supplementary view only when it continues to add detail beyond those documents; otherwise remove it rather than duplicating or contradicting the architecture.
