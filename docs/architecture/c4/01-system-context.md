# C4 Level 1 — System Context

```mermaid
flowchart TB
  subgraph Users[People]
    direction LR
    Student[Student]
    Staff[Company Staff]
    Supervisor[Supervisor]
    Admin[Admin]
  end

  InternHub([InternHub<br/>Internship platform])

  subgraph External[External systems]
    direction LR
    LLM[LLM provider]
    Notify[Email / notification provider]
  end

  Student --> InternHub
  Staff --> InternHub
  Supervisor --> InternHub
  Admin --> InternHub
  InternHub -->|Optional explaination and summarization| LLM
  InternHub -->|Outbound messages| Notify

  classDef person fill:#E8F1FF,stroke:#2563EB,color:#0F172A
  classDef system fill:#2563EB,stroke:#1D4ED8,color:#FFFFFF
  classDef external fill:#F8FAFC,stroke:#64748B,color:#0F172A
  class Student,Staff,Supervisor,Admin person
  class InternHub system
  class LLM,Notify external
```

All user interactions use HTTPS. Students discover, apply, and submit reports. Company Staff manage their company's openings and applications. Supervisors manage placements; Admins administer the platform.
