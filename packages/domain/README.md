# InternHub Domain

**Owner:** backend team. **Status:** implemented shared rules package.

This package contains framework-independent lifecycle and deterministic matching rules consumed by the API and covered by package tests.

The lifecycle package contains the Applications aggregate. It owns valid status
transitions and canonical acceptance replay decisions. `AcceptanceCommand` is an
immutable value object: it normalizes the optional note, compares by value, and
serializes the canonical command retained in application history. `ACCEPTED` can
be reached only through `Application.accept()` with that command.

The placements package contains the Placement and WeeklyReport aggregates. They
own the Active-only write rule, placement completion or termination, report draft
editing, submitted-version numbering, and current-version review decisions. A
review compares its requested version ID with the aggregate's rehydrated current
version ID; it cannot authorize a caller-selected version.
NestJS, TypeORM transactions, authorization, append-only history records,
placement creation, and notifications remain in the API application services.

The postings package contains the small policy for publishing a complete draft
before its resolved deadline and for valid posting lifecycle transitions. The
assessments package contains shared 1--5 rating and submission-completeness
rules. Discovery queries, storage, access checks, locks, and saves remain in the
API services.

This is selective DDD: only business rules with meaningful state or repeated
validation live here. There are no domain repositories, domain events, CQRS, or
framework dependencies in this package.
