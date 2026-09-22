# InternHub Domain

**Owner:** backend team. **Status:** implemented shared rules package.

This package contains framework-independent lifecycle and deterministic matching rules consumed by the API and covered by package tests.

The lifecycle package currently contains the Applications aggregate. It owns valid
status transitions and canonical acceptance replay decisions. `AcceptanceCommand`
is an immutable value object: it normalizes the optional note, compares by value,
and serializes the canonical command retained in application history. NestJS,
TypeORM transactions, authorization, placement creation, and notifications remain
in the API application service.
