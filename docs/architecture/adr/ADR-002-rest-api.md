# ADR-002: Use versioned REST APIs

**Status:** Accepted  
**Decision:** The SPA calls JSON REST endpoints under `/api/v1`; the API publishes OpenAPI.  
**Consequences:** The API-backed web client can evolve incrementally and contracts are easy to test. Streaming/realtime and GraphQL are not required for v1.
