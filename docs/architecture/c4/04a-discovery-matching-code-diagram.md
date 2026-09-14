# C4 Level 4 — Discovery & Matching Code Diagram

This code-level view zooms into the deterministic matching component. Search and Match Score do not depend on the LLM; the explanation request is an optional asynchronous side effect.

```mermaid
classDiagram
  class InternshipSearchController {
    +list(filters, actor) InternshipMatchDto[]
  }
  class SearchInternshipsUseCase {
    +execute(filters, studentId) InternshipMatch[]
  }
  class InternshipSearchRepository {
    <<interface>>
    +search(filters) Internship[]
  }
  class StudentSkillRepository {
    <<interface>>
    +findForStudent(studentId) StudentSkill[]
  }
  class MatchScoreCalculator {
    +calculate(studentSkills, requirements) MatchScore
  }
  class MatchScore {
    +value Decimal
    +matchedSkills Skill[]
    +missingSkills Skill[]
  }
  class Internship {
    +id UUID
    +title String
    +requirements SkillRequirement[]
  }
  class SkillRequirement {
    +skillId UUID
    +required Boolean
    +weight Decimal
  }
  class ExplanationJobPublisher {
    <<interface>>
    +publish(internshipId, studentId, score) void
  }
  InternshipSearchController --> SearchInternshipsUseCase
  SearchInternshipsUseCase --> InternshipSearchRepository
  SearchInternshipsUseCase --> StudentSkillRepository
  SearchInternshipsUseCase --> MatchScoreCalculator
  SearchInternshipsUseCase --> ExplanationJobPublisher
  InternshipSearchRepository --> Internship
  Internship --> SkillRequirement
  MatchScoreCalculator --> MatchScore
  MatchScoreCalculator --> SkillRequirement
```

`MatchScoreCalculator` is a pure domain service: identical skill inputs and requirement weights always produce the same score and breakdown. `ExplanationJobPublisher` runs only after a valid score has been returned.

