# InternHub API

NestJS with explicit TypeORM migrations (`synchronize: false`). Run commands from the repository root:

```sh
cp apps/api/.env.example apps/api/.env
docker compose up -d
pnpm db:migrate
pnpm db:seed
pnpm dev:api
```

The API is at `http://localhost:3000/api/v1`. `GET /health` checks PostgreSQL, storage and scheduler health; a dependency failure returns 503. Scheduler readiness may take its first one-minute scan. Sign in with the development accounts listed in the root README. Bearer tokens must have a live matching session and expire after seven days; switching roles replaces the token. There is no refresh endpoint.

Controllers translate HTTP requests into service commands. Concrete DTOs reject extra fields. `AccessService` enforces company membership, student ownership and active supervisor assignment. Services recheck mutable state inside transactions. The API imports pure rules from `packages/domain`; shared wire models and generated route types live in `packages/contracts`.

`pnpm test:api` runs fast tests. `pnpm test:integration` executes real HTTP requests and all migrations against disposable PostgreSQL. Its storage test double covers API transfer behavior but not the MinIO protocol. Never point test fixtures at a real application database.

Historical migrations are unchanged. The pre-cutover migration preserves legacy assignments and archives malformed values before the original canonical cutover. The subsequent integrity migration adds constraints and fails orphaned AI jobs. If the old cutover already ran and destroyed legacy assignments, recover those relationships from a backup; no migration can infer them. Integrity checks marked `NOT VALID` protect new writes while allowing explicit reconciliation of legacy rows. Consult [recovery guidance](../../infra/README.md) before upgrading existing data.
