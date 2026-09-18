# InternHub

InternHub is an internship workflow application: React/Vite, a NestJS modular monolith, PostgreSQL, and private MinIO storage. The API and frontend are implemented. Optional AI processing is deferred and its endpoints return 503.

## Run locally

Use Node.js 22, pnpm 10.34.3, and Docker Compose v2.

```sh
pnpm install --frozen-lockfile
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
docker compose up -d
pnpm db:migrate
pnpm db:seed
pnpm dev:api
# In another terminal:
pnpm dev:web
```

Open http://localhost:5173. Vite proxies `/api` to port 3000. The development seed creates `student@internhub.local`, `staff@internhub.local`, `supervisor@internhub.local`, and `admin@internhub.local`, all with password `InternHub123!`. The seed is forbidden in production. API environment variables are read from `apps/api/.env` when launched through the workspace scripts. Never use development credentials outside local development.

Start with Company Staff: create and publish a posting. As Student, add skills, upload a PDF CV, and apply. Company Staff can review, interview, and accept the application with dates and a supervisor. The resulting placement supports tasks, weekly reports, revisions, assessments, and completion. No manually entered record IDs are needed for this journey.

## Implementation and limits

| Capability | Current behavior |
| --- | --- |
| Identity | Password sign-in, expiring server-backed sessions, role switching, revocation, per-process sign-in throttling. No registration, password reset, or refresh endpoint. |
| Discovery | Server-side keyword search, filters, bounded pagination, preference relevance and deterministic skill match. |
| Posting/application lifecycle | Draft publication, close/archive, application submission snapshots, review/interview/rejection/withdrawal, transactional acceptance and replay. |
| Placement | Role-and-record scoped list/detail, tasks, reports and revisions, independent assessments, completion/termination. |
| Documents | Private streamed transfers, five-minute tokens plus session authorization, digest/signature verification, ownership and retention checks. No antivirus scanner. |
| Monitoring/notifications | Program/term scoped aggregates and recipient-scoped inbox/read operations. In-process deadline scheduler; one API instance is the deployment baseline. |
| Optional AI | Disabled. `apps/worker` is a design placeholder, not a running processor. |
| Administration | Seed/database provisioning for accounts, companies, programs, and terms. A full administration UI and account recovery are deferred. |

## Engineering checks

```sh
pnpm typecheck
pnpm lint
pnpm format:check
pnpm contracts:check
pnpm build
pnpm test
pnpm test:integration
pnpm exec playwright install --with-deps chromium
pnpm test:browser
pnpm test:coverage
```

Integration tests start a disposable embedded PostgreSQL database; they never use the development database. Browser tests start their own PostgreSQL, API and Vite processes. These tests need permission to listen on local ports. By default their object-storage adapter is an in-memory test double. Set `MINIO_INTEGRATION=1` plus MinIO connection variables to run the HTTP suite against real private storage; a separate CI job does this. Local real-MinIO verification remains pending in environments without the server image. Coverage combines API unit/HTTP tests and web unit/browser tests, then enforces 80% for statements, branches, functions and lines. The unit-only web coverage command reports only that subset. Coverage thresholds remain 80%; a failing gate is a remaining quality gap, not proof that passing unit tests establish production readiness.

`lint` checks architectural boundaries (DTO bodies and controller/service separation); it is not a complete TypeScript lint configuration. CI runs typechecks, contract checks, builds, tests, coverage and the browser journey.

## Repository map

- `apps/api/src/modules`: thin HTTP controllers, application services, authorization, storage and scheduled maintenance.
- `apps/api/src/infrastructure/database`: entities, immutable historical migrations, forward repairs and development seed.
- `apps/web/src/features`: profile, opportunities, applications, placements, reports, assessments and monitoring pages.
- `packages/domain`: pure shared lifecycle and matching rules used by the API.
- `packages/contracts`: generated OpenAPI types and shared client models used by the frontend.
- `docs/api/openapi.yaml`: supported HTTP surface. `target-openapi.yaml` preserves the broader design proposal and is not an implementation promise.
- `docs`: requirements and architectural design; these may describe future scope. This README and executable routes/tests describe what currently runs.

See [API setup](apps/api/README.md), [web setup](apps/web/README.md), and [deployment and recovery](infra/README.md).
