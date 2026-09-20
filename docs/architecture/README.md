# InternHub Architecture

This directory records the target architecture and historical design decisions. The running system is a React frontend, NestJS modular monolith with feature services, PostgreSQL migrations, and private object storage. Shared domain rules and contract models are consumed by the applications. Optional AI processing remains deferred.

Use the [root implementation matrix](../../README.md), executable routes, and tests to determine supported behavior. Older diagrams and the refactor blueprint are design references, not implementation claims.

## Reading order

1. [C4 overview](./c4.md) is the canonical C1-C3 structural view and three-tier mapping.
2. [arc42](./arc42.md) explains goals, constraints, quality attributes, risks, and design decisions.
3. Supplementary detailed views: [deployment](./c4/05-deployment-view.md), [runtime sequences](./c4/06-runtime-sequence-view.md), and [target code structure](./c4/10-code-structure.md).
4. [Refactor blueprint](./refactor-blueprint.md) maps the prototype to the target codebase and API surface.
5. [ADRs](./adr/) record the decisions that constrain implementation.
6. [Diagram status](./diagram-status.md) records coverage, target-vs-prototype scope, and maintenance expectations.

Mermaid diagrams should render in GitHub, GitLab, and VS Code Mermaid-enabled previews. Keep diagrams and arc42 synchronized when architecture changes.
