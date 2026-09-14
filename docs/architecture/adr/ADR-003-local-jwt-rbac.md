# ADR-003: Use local JWT authentication and RBAC

**Status:** Accepted  
**Decision:** The API manages credentials, issues signed JWTs, and applies `Student`, `CompanyStaff`, `Supervisor`, and `Admin` role checks plus ownership checks.  
**Consequences:** v1 has no external identity-provider dependency. Credential reset, verification, rotation, rate limiting, and secure token storage are required before public production use.

