# ADR-004: PostgreSQL is the system of record

**Status:** Accepted  
**Decision:** Store transactional entities, audit histories, search data, and durable jobs in PostgreSQL.  
**Consequences:** Status/history updates are atomic and reporting can start from one database. Search begins with PostgreSQL full-text/filters; vector search is deferred.

