# C4 Level 1 — System Context

```mermaid
C4Context
  title InternHub system context
  Person(student, "Student", "Finds internships, applies, reports progress")
  Person(staff, "Company Staff", "Publishes internships and processes applications")
  Person(supervisor, "Supervisor", "Manages placements, tasks, and report feedback")
  Person(admin, "Admin", "Administers organizations and monitoring")
  System(internhub, "InternHub", "Internship discovery, application, and progress platform")
  System_Ext(llm, "LLM provider", "Generates optional explanations and summaries")
  System_Ext(notify, "Email/notification provider", "Delivers outbound notifications")
  Rel(student, internhub, "Uses", "HTTPS")
  Rel(staff, internhub, "Uses", "HTTPS")
  Rel(supervisor, internhub, "Uses", "HTTPS")
  Rel(admin, internhub, "Uses", "HTTPS")
  Rel(internhub, llm, "Requests optional generated text", "HTTPS")
  Rel(internhub, notify, "Sends notifications", "HTTPS")
```

