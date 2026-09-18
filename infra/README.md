# Deployment and recovery

## Development

The root Compose file starts PostgreSQL 16 and MinIO with persistent named volumes and loopback-only ports. It intentionally uses public development credentials. `docker compose down` preserves data; `down -v` destroys it. Copy the tracked environment examples, run migrations and the development seed, then start API/web as described in the root README.

## Deployment baseline

Use one API instance (including its deadline scheduler), PostgreSQL and a private MinIO bucket. Build the API and web images from the repository root:

```sh
docker build -f infra/Dockerfile.api -t internhub-api .
docker build -f infra/Dockerfile.web -t internhub-web .
```

The example nginx configuration proxies `/api` to `api:3000`; place both containers on the same private network with the API named `api`. Terminate HTTPS at your ingress. Do not expose PostgreSQL or the MinIO console publicly. nginx allows 11 MB requests for the API's 10 MB file limit and avoids logging transfer-token query strings.

Set `NODE_ENV=production`, independent random `JWT_SECRET` and `UPLOAD_TOKEN_SECRET` values of at least 32 characters, `DATABASE_URL`, `WEB_ORIGIN`, and non-default MinIO credentials. Configure MinIO TLS and port explicitly. Production startup rejects missing required configuration and default storage credentials. The storage account needs bucket/object operations for the configured private bucket; keep the bucket non-public. Rotate keys by invalidating sessions and issuing new tokens. Do not run the demo seed.

Run migrations as an explicit release step before starting the new API, using the same code and environment as the release. The runtime image contains source and migration tooling for `pnpm db:migrate`. Probe `/api/v1/health`: non-200 means the database, bucket or deadline scanner is unavailable/stale. Investigate structured API errors and scheduler logs. Do not enable AI endpoints: no worker is supplied.

## Backup and restore rehearsal

1. Pause application writes and scheduled jobs for a consistent database/object snapshot.
2. Take a PostgreSQL custom-format backup with `pg_dump --format=custom --file=internhub.dump "$DATABASE_URL"`. Use a protected credential mechanism, not a password committed to scripts.
3. Snapshot or mirror the private bucket with your storage administration tool. Store the DB backup, object snapshot, deployed revision and migration list together in encrypted restricted storage.
4. Restore into a separate empty database (`pg_restore --no-owner --dbname="$RESTORE_DATABASE_URL" internhub.dump`) and a separate private bucket. Point an isolated API at them. Check application counts, active supervisor assignments, report versions, attachment downloads and health before declaring the backup usable.
5. Upgrade that restored copy first. Execute all migrations, inspect `migration_archive`, reconcile quarantined legacy values, and check constraints. Only then schedule the production upgrade with a fresh backup and maintenance window.

The pre-cutover migration preserves valid legacy supervision and quarantines malformed JSON. Existing installations that already ran the destructive original cutover need assignments recovered from an older backup. New `NOT VALID` constraints intentionally require legacy cleanup before `VALIDATE CONSTRAINT`; inspect violating rows and correct them with an auditable reconciliation script. Never silently discard them.

Prefer a forward repair migration after deployment. Historical `down` migrations are not a complete recovery mechanism. Restoring a backup loses later writes, so reconcile those explicitly before switching traffic. Backup/restore commands here are a runbook and must be rehearsed on your hosting environment; they are not evidence of a completed production restore.

## Troubleshooting

- UI cannot reach API: start port 3000, verify Vite's `/api` proxy, or configure `VITE_API_BASE_URL` and `WEB_ORIGIN` consistently.
- Storage unavailable: check MinIO credentials, TLS/port, bucket access and service connectivity. Health returns 503 instead of claiming readiness.
- Rejected creation body: remove IDs, timestamps and other server-managed fields; use the supported OpenAPI request schema.
- Browser runner fails on Linux libraries: `pnpm exec playwright install --with-deps chromium` installs the required browser dependencies.
- Tests cannot bind ports: allow local test listeners; integration and browser databases use ports 55439 and 55440 and are disposable.
