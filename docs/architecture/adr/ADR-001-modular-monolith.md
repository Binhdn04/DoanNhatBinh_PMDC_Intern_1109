# ADR-001: Start with a modular monolith

**Status:** Accepted
**Decision:** Deploy one NestJS API while enforcing module boundaries and application-service interfaces.
**Consequences:** Simple deployment and transactions for v1; modules such as AI or notifications can later be extracted behind their existing contracts. Independent service deployment is deliberately deferred.
