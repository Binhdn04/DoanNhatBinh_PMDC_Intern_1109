# InternHub Architecture

This directory is the source of truth for the target production architecture. The current React/Vite prototype lives in `apps/web/`, is organized by frontend feature, and continues to use mock data while API, worker, shared packages, and infrastructure remain planned.

## Reading order

1. [arc42](./arc42.md) explains goals, constraints, quality attributes, and design decisions.
2. [C4 diagrams](./c4/) provide context, container, component, deployment, runtime, network, layer, and code-level views. Core feature code views are [Discovery & Matching](./c4/04a-discovery-matching-code-diagram.md), [Application Management](./c4/04c-application-status-transition-code-diagram.md), and [Internship Progress](./c4/04b-progress-code-diagram.md).
3. [Refactor blueprint](./refactor-blueprint.md) maps the prototype to the target codebase and API surface.
4. [ADRs](./adr/) record the decisions that constrain implementation.
5. [Static platform and runtime assets](./c4/11-static-architecture-assets.md) provide editable SVG overview diagrams.
6. [Use-case view](./c4/12-use-case-view.md) maps actors to core and extension capabilities.
7. [Diagram status](./diagram-status.md) records coverage, target-vs-prototype scope, and maintenance expectations.

Mermaid diagrams should render in GitHub, GitLab, and VS Code Mermaid-enabled previews. Keep diagrams and arc42 synchronized when architecture changes.
