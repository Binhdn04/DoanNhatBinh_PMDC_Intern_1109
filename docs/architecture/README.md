# InternHub Architecture

This directory is the source of truth for the target production architecture. It describes the intended system; the current `InternHub/` React/Vite prototype is not yet organized this way.

## Reading order

1. [arc42](./arc42.md) explains goals, constraints, quality attributes, and design decisions.
2. [C4 diagrams](./c4/) provide context, container, component, deployment, and code-level views for all three v1 core features: [Discovery & Matching](./c4/04a-discovery-matching-code-diagram.md), [Application Management](./c4/04-code-diagram.md), and [Internship Progress](./c4/04b-progress-code-diagram.md).
3. [Refactor blueprint](./refactor-blueprint.md) maps the prototype to the target codebase and API surface.
4. [ADRs](./adr/) record the decisions that constrain implementation.

Mermaid diagrams should render in GitHub, GitLab, and VS Code Mermaid-enabled previews. Keep diagrams and arc42 synchronized when architecture changes.
