# Use-Case View

This Mermaid flowchart uses a system boundary to represent a UML-style use-case diagram. Solid use cases are v1 core capabilities; dashed use cases are supporting or planned extensions.

```mermaid
flowchart LR
  Student[Student]
  Staff[Company Staff]
  Supervisor[Supervisor]
  Admin[Admin]

  subgraph InternHub[InternHub system boundary]
    direction TB

    subgraph Discovery[Discovery & Matching — core v1]
      Search([Search and filter internships])
      Detail([View internship details])
      Match([View deterministic Match Score])
      Explain([Request AI match explanation])
    end

    subgraph Applications[Application Management — core v1]
      Apply([Submit application])
      Documents([Upload application documents])
      Track([View application status and history])
      Transition([Transition application status])
      Withdraw([Withdraw application])
    end

    subgraph Progress[Placement & Progress — core v1]
      ViewPlacement([View placement])
      AssignTask([Assign task])
      UpdateTask([Update task status])
      SubmitReport([Submit weekly report])
      ReviewReport([Review report and add feedback])
      Summary([Request AI report summary])
    end

    subgraph Support[Supporting and extension capabilities]
      Profile([Manage profile, skills and preferences])
      Post([Create and publish internship])
      Notify([Receive notification])
      Evaluate([Submit assessment / evaluate placement])
      Dashboard([View monitoring dashboard and reports])
      Administer([Administer users and organizations])
    end
  end

  Student --> Search
  Student --> Detail
  Student --> Match
  Student --> Apply
  Student --> Documents
  Student --> Track
  Student --> Withdraw
  Student --> ViewPlacement
  Student --> UpdateTask
  Student --> SubmitReport
  Student --> Profile
  Student --> Notify
  Student --> Evaluate

  Staff --> Post
  Staff --> Transition
  Staff --> Track
  Staff --> ViewPlacement
  Staff --> Notify

  Supervisor --> ViewPlacement
  Supervisor --> AssignTask
  Supervisor --> ReviewReport
  Supervisor --> Notify
  Supervisor --> Evaluate

  Admin --> Administer
  Admin --> Dashboard
  Admin --> Post
  Admin --> Transition
  Admin --> AssignTask
  Admin --> ReviewReport
  Admin --> Evaluate

  Match -. optionally triggers .-> Explain
  SubmitReport -. optionally triggers .-> Summary
  Apply --> Documents
  Transition --> Track
  AssignTask --> Notify
  ReviewReport --> Notify

  classDef actor fill:#E8F1FF,stroke:#2563EB,color:#0F172A
  classDef core fill:#DBEAFE,stroke:#2563EB,color:#0F172A
  classDef planned fill:#F8FAFC,stroke:#64748B,color:#0F172A,stroke-dasharray: 5 5
  class Student,Staff,Supervisor,Admin actor
  class Search,Detail,Match,Explain,Apply,Documents,Track,Transition,Withdraw,ViewPlacement,AssignTask,UpdateTask,SubmitReport,ReviewReport,Summary core
  class Profile,Post,Notify,Evaluate,Dashboard,Administer planned
```

## Key authorization rules

| Use case | Primary actor and rule |
| --- | --- |
| Submit/withdraw application | Student owns the application. |
| Transition application status | Company Staff owns the posting's company, or Admin. |
| Assign task / review report | Assigned Supervisor, or Admin. |
| Update task / submit report | Student owns the active placement. |
| Create/publish internship | Company Staff belongs to the company, or Admin. |

AI explanation and report summary are optional asynchronous enrichments. They never decide a match, workflow status, evaluation, or authorization outcome.
