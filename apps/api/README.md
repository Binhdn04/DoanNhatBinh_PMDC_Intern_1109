# InternHub API

NestJS/TypeORM implementation of the `/api/v1` service. PostgreSQL is required; the repository supplies a local PostgreSQL and MinIO stack.

```bash
docker compose up -d
cp .env.example .env
pnpm db:migrate
pnpm db:seed
pnpm dev:api
```

The development seed password is `InternHub123!`; accounts are `student@internhub.local`, `staff@internhub.local`, `supervisor@internhub.local`, and `admin@internhub.local`.

Authentication starts at `POST /api/v1/auth/sign-in`. All other routes require a bearer token, except the refresh endpoint. The API deliberately keeps `synchronize: false`; use migrations for every schema change.
