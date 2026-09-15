# InternHub Architecture

This directory is the source of truth for the target production architecture. The current React/Vite prototype lives in `apps/web/`, is organized by frontend feature, and continues to use mock data while API, worker, shared packages, and infrastructure remain planned.

## Reading order

1. [C4 overview](./c4.md) is the canonical C1-C3 structural view and three-tier mapping.
2. [arc42](./arc42.md) explains goals, constraints, quality attributes, risks, and design decisions.
3. Supplementary detailed views: [deployment](./c4/05-deployment-view.md), [runtime sequences](./c4/06-runtime-sequence-view.md), and [target code structure](./c4/10-code-structure.md).
4. [Refactor blueprint](./refactor-blueprint.md) maps the prototype to the target codebase and API surface.
5. [ADRs](./adr/) record the decisions that constrain implementation.
6. [Diagram status](./diagram-status.md) records coverage, target-vs-prototype scope, and maintenance expectations.

Mermaid diagrams should render in GitHub, GitLab, and VS Code Mermaid-enabled previews. Keep diagrams and arc42 synchronized when architecture changes.
