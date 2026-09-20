# InternHub Contracts

This package exports generated OpenAPI schema/path types and the shared client models used by the web application. The API validates report responses against the shared report model; concrete Nest DTOs remain the HTTP request-validation boundary.

Run `pnpm contracts:generate` after changing `docs/api/openapi.yaml`. `pnpm contracts:check` verifies generated type freshness and compares each documented HTTP method/path with controller decorators. HTTP and browser integration tests verify behavior beyond that structural check.

`docs/api/target-openapi.yaml` is a deferred design proposal. It includes unsupported endpoints and must not be used for the running client.
