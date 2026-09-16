# ADR-006: Store uploaded documents in object storage

**Status:** Accepted  
**Decision:** Keep CVs and other binary documents in private S3-compatible object storage; PostgreSQL holds metadata and object keys.  
**Consequences:** Database growth and backup remain controlled. Browser transfer URLs are five-minute, session-bound API content URLs. The API rechecks current authorization and streams bytes to/from private storage; it never issues browser-facing storage URLs. Only the reverse proxy is publicly reachable. File signature, digest and size validation are mandatory (PDF/JPEG/PNG/DOCX, maximum 10 MiB). See [behavior rules](../../design/behavior-rules.md).
