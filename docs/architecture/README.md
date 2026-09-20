# InternHub Architecture

This directory records the implemented architecture and historical design decisions. The running system is a React frontend, NestJS modular monolith with feature services, PostgreSQL migrations, and private object storage. Shared domain rules and contract models are consumed by the applications. Optional AI processing remains deferred.

Use the [root implementation matrix](../../README.md), executable routes, migrations, and tests to determine supported behavior. Deferred AI views are design references, not implementation claims.

## Reading order

1. [C4 overview](./c4.md) is the canonical C1-C3 structural view and three-tier mapping.
2. [arc42](./arc42.md) explains goals, constraints, quality attributes, risks, and design decisions.
3. Supplementary detailed views: [deployment](./c4/05-deployment-view.md), [runtime sequences](./c4/06-runtime-sequence-view.md), and [target code structure](./c4/10-code-structure.md).
4. [ADRs](./adr/) record the decisions that constrain implementation.
5. [Diagram status](./diagram-status.md) records coverage and the deferred-AI boundary.

Mermaid diagrams should render in GitHub, GitLab, and VS Code Mermaid-enabled previews. Keep diagrams and arc42 synchronized when architecture changes.
