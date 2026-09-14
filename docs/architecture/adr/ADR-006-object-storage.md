# ADR-006: Store uploaded documents in object storage

**Status:** Accepted  
**Decision:** Keep CVs and other binary documents in private S3-compatible object storage; PostgreSQL holds metadata and object keys.  
**Consequences:** Database growth and backup remain controlled. Access uses scoped URLs and authorization checks; file type/size validation is mandatory.

