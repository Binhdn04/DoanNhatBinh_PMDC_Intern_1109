# C4 Level 4 — Application Status Transition Code Diagram

This UML class diagram zooms into the **Application Status Transition** component within the API's Applications module. It is a target implementation design, not a claim that these classes exist in the current frontend prototype.

```mermaid
classDiagram
  class ApplicationStatusController {
    +transition(applicationId, request, actor) ApplicationDto
  }
  class TransitionApplicationStatusUseCase {
    +execute(applicationId, targetStatus, note, actor) Application
  }
  class ApplicationAuthorizationPolicy {
    +canTransition(actor, application) boolean
  }
  class ApplicationStateMachine {
    +assertAllowed(from, to, actorRole) void
  }
  class ApplicationRepository {
    <<interface>>
    +findByIdForUpdate(id) Application
    +save(application) void
  }
  class StatusHistoryRepository {
    <<interface>>
    +append(history) void
  }
  class OutboxRepository {
    <<interface>>
    +append(event) void
  }
  class Application {
    +id UUID
    +studentId UUID
    +internshipId UUID
    +status ApplicationStatus
    +transitionTo(target) void
  }
  class ApplicationStatusHistory {
    +applicationId UUID
    +fromStatus ApplicationStatus
    +toStatus ApplicationStatus
    +changedBy UUID
    +changedAt DateTime
  }
  class ApplicationStatus {
    <<enumeration>>
    submitted
    under_review
    interview
    accepted
    rejected
    withdrawn
  }
  ApplicationStatusController --> TransitionApplicationStatusUseCase
  TransitionApplicationStatusUseCase --> ApplicationAuthorizationPolicy
  TransitionApplicationStatusUseCase --> ApplicationStateMachine
  TransitionApplicationStatusUseCase --> ApplicationRepository
  TransitionApplicationStatusUseCase --> StatusHistoryRepository
  TransitionApplicationStatusUseCase --> OutboxRepository
  TransitionApplicationStatusUseCase --> Application
  Application --> ApplicationStatus
  StatusHistoryRepository --> ApplicationStatusHistory
  ApplicationStatusHistory --> ApplicationStatus
```

The use case performs authorization, validates the transition, updates the application, appends history, and appends an outbox notification event in one database transaction. Repository interfaces keep the domain/application logic independent of PostgreSQL and NestJS infrastructure.

