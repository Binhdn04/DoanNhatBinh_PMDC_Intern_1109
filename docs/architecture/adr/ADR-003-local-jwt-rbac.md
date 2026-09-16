# ADR-003: Use local JWT authentication and RBAC

**Status:** Accepted  
**Decision:** The API manages credentials, issues signed JWTs, and applies `Student`, `CompanyStaff`, `Supervisor`, and `Admin` role checks plus ownership checks.  
**Consequences:** v1 has no external identity-provider dependency. Credential reset, verification, rotation, rate limiting, and secure token storage are required before public production use.

Active-role switching is an authenticated in-scope interaction: `PUT /api/v1/me/active-role` validates current role membership and rotates the current session version and token. JWTs carry `sid`, role, version and expiry, checked against `auth_sessions` on every request. Old session-version tokens become invalid immediately; record relationships are checked separately on every request. See [behavior rules](../../design/behavior-rules.md).
