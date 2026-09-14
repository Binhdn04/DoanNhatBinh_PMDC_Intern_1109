# C4 Level 4 — Internship Progress Code Diagram

This code-level view covers task assignment/status updates, weekly-report submission, and supervisor feedback for an active placement.

```mermaid
classDiagram
  class ProgressController {
    +createTask(placementId, request, actor) TaskDto
    +updateTask(taskId, request, actor) TaskDto
    +submitReport(placementId, request, actor) WeeklyReportDto
    +addFeedback(reportId, request, actor) FeedbackDto
  }
  class PlacementAccessPolicy {
    +canManageTasks(actor, placement) boolean
    +canSubmitReport(actor, placement) boolean
    +canGiveFeedback(actor, placement) boolean
  }
  class ManageTaskUseCase {
    +assign(placementId, request, actor) Task
    +updateStatus(taskId, status, actor) Task
  }
  class SubmitWeeklyReportUseCase {
    +execute(placementId, request, actor) WeeklyReport
  }
  class AddReportFeedbackUseCase {
    +execute(reportId, request, actor) ReportFeedback
  }
  class PlacementRepository {
    <<interface>>
    +findById(id) Placement
  }
  class TaskRepository {
    <<interface>>
    +findById(id) Task
    +save(task) void
  }
  class WeeklyReportRepository {
    <<interface>>
    +existsForWeek(placementId, weekStart) boolean
    +save(report) void
  }
  class ReportFeedbackRepository {
    <<interface>>
    +save(feedback) void
  }
  class OutboxRepository {
    <<interface>>
    +append(event) void
  }
  class Placement {
    +studentId UUID
    +supervisorId UUID
    +status PlacementStatus
  }
  class Task {
    +status TaskStatus
    +transitionTo(status) void
  }
  class WeeklyReport {
    +weekStart Date
    +content Text
  }
  class ReportFeedback {
    +supervisorId UUID
    +comment Text
  }
  ProgressController --> ManageTaskUseCase
  ProgressController --> SubmitWeeklyReportUseCase
  ProgressController --> AddReportFeedbackUseCase
  ManageTaskUseCase --> PlacementAccessPolicy
  ManageTaskUseCase --> PlacementRepository
  ManageTaskUseCase --> TaskRepository
  SubmitWeeklyReportUseCase --> PlacementAccessPolicy
  SubmitWeeklyReportUseCase --> PlacementRepository
  SubmitWeeklyReportUseCase --> WeeklyReportRepository
  SubmitWeeklyReportUseCase --> OutboxRepository
  AddReportFeedbackUseCase --> PlacementAccessPolicy
  AddReportFeedbackUseCase --> ReportFeedbackRepository
  AddReportFeedbackUseCase --> OutboxRepository
  PlacementRepository --> Placement
  TaskRepository --> Task
  WeeklyReportRepository --> WeeklyReport
  ReportFeedbackRepository --> ReportFeedback
```

The API validates placement ownership and weekly-report uniqueness before writing. Report submission and feedback append durable events so summaries and notifications can run asynchronously without delaying the core workflow.

