# ADR-005: Process enrichment and notifications asynchronously

**Status:** Accepted  
**Decision:** Persist an outbox/job after domain writes and have a worker process AI and delivery jobs.  
**Consequences:** User-facing writes do not wait on third parties. Job idempotency, retry policy, dead-letter visibility, and monitoring are implementation requirements.

