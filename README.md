# InternHub — Smart Internship Management System

**Author:** Doan Nhat Binh  
**Assignment:** Software analysis using a top-down approach, followed by UI/UX and database design for the most important features.

InternHub is a centralized platform for students to discover internships, track applications, and communicate transparently with companies and academic supervisors. The implemented application is a React/Vite UI prototype with frontend mock data; backend services and external integrations are planned but not initialized.

## Workspace

This repository is a pnpm workspace.

```text
apps/
  web/                 # React/Vite prototype
  api/                 # planned NestJS API
  worker/              # planned asynchronous job worker
packages/
  contracts/           # planned shared API DTOs
  domain/              # planned framework-independent business rules
infra/                 # planned deployment and platform configuration
docs/
  architecture/
  analysis/
  requirements/
  data/
  ux/
```

## Quick start

Install Node.js 22+ and enable the pinned pnpm version through Corepack:

```bash
corepack enable
corepack install
pnpm install
pnpm dev:web
```

The Vite server prints the local URL. Use the workspace scripts for checks and a production build:

```bash
pnpm typecheck:web
pnpm build:web
```

See [the web application README](./apps/web/README.md) for its feature-oriented source layout.

## Documentation

- [Architecture documentation](./docs/architecture/README.md)
- [Top-down analysis](./docs/analysis/Topdown_approach.png)
- [Feature specification](./docs/requirements/spec.md)
- [Core features use-case diagram](./docs/requirements/use_case.png)
- [Full features use-case diagram](./docs/requirements/use_case_full.png)
- [Database schema (DBML)](./docs/data/internship_platform.dbml)
- [Database design](./docs/data/database_design.png)
- [UI/UX main page](./docs/ux/main_page.png)

## Current prototype scope

- **Discovery & Matching:** search, filter, and view internship opportunities with a frontend Match Score.
- **Application Management:** view details, apply, complete the simulated interview, and track application status.
- **Internship Progress:** manage tasks, weekly reports, and supervisor feedback.
- **Evaluation, profile, and monitoring:** interactive prototype screens for the supporting modules.

The planned architecture uses deterministic scoring, optional AI explanations, a NestJS modular monolith, PostgreSQL, and asynchronous jobs. These are design targets documented in `docs/architecture`, not services included in the current prototype.
