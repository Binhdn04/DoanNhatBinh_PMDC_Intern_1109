# InternHub Functional Specification

**Status:** Functional source of truth  
**Scope:** Current InternHub product scope  
**Last updated:** 2026-09-16

## 1. Purpose and scope

InternHub helps students find internships, apply to them, complete an internship placement, and receive transparent supervision. It also gives company staff, supervisors, and administrators the information they need to manage the relevant parts of that lifecycle.

This document defines **what users can do and the rules the product must enforce**. It is authoritative when it conflicts with UI mock data, diagrams, database design, or target architecture documents.

The current product scope contains profiles and organizations; discovery and skill matching; applications; accepted placements, tasks, and weekly reports; evaluation; and administrative monitoring with in-app notifications.

## 2. Actors and access rules

| Actor | Primary responsibilities | Access boundary |
| --- | --- | --- |
| Student | Maintains their profile, finds and applies for internships, manages their active placement, submits reports and self-assessment. | Own profile, saved opportunities, applications, placements, tasks, reports, notifications, and self-assessment only. |
| Company Staff | Maintains its company's profile and postings, and processes applications to those postings. | Only the company to which the staff member belongs, its postings, and applications or placements created from those postings. |
| Supervisor | Oversees assigned placements, assigns tasks, reviews reports, and evaluates students. | Only placements explicitly assigned to that supervisor. |
| Admin | Oversees the platform, organizations, and program-level monitoring. | All records needed for administration; may perform an action otherwise reserved for the responsible role when acting as administrator. |

The system must verify both a user's role and their relationship to the specific record. A role alone must not grant access to unrelated students, companies, applications, or placements.

## 3. Functional requirements

### 3.1 Profiles, organizations, and postings

- Students can view and edit their identity and education details, skills, career preferences, and reusable application documents.
- A student skill may include a proficiency level. Students can add, change, or remove their own skills and preferences.
- Students can store preferred industries, locations, work arrangements, and internship duration; preferences influence discovery relevance but do not prevent viewing otherwise eligible postings.
- Company Staff can view and maintain their own company's public information and create, edit, publish, close, or archive that company's internship postings. Admins can do the same.
- A posting must identify its company, title, description, location, work arrangement, duration, deadline, number of openings, and explicitly declared required and optional skill groups before it is published. Either or both skill groups may be empty.
- Only open postings whose deadline has not passed are available for new applications. Closed, archived, draft, or expired postings are not available for new applications, but authorized users may still view the records relevant to them.
- Students can save and remove open internship opportunities from a personal saved-opportunity list.

### 3.2 Discovery and matching

- Students can search available internships by keyword across internship title, company, and skills.
- Students can filter available internships by category, location, duration, and work arrangement, and sort results by relevance, newest posting, or Match Score.
- Students can view internship details, including the role, company, requirements, optional skills, responsibilities where provided, benefits where provided, application deadline, and available places.
- For an authenticated student, the system displays a Match Score from 0 to 100 and identifies matched and missing skills for each eligible posting.
- The Match Score is calculated deterministically from the student's recorded skills and the posting's required and optional skills. Identical inputs must produce the same score and skill breakdown.
- The score is advisory. It must not prevent a student from viewing or applying to an otherwise eligible posting, and it must not make a hiring decision.

### 3.3 Applications

- A student can apply only to an open, non-expired posting and only once per posting. A withdrawn or rejected application does not create a second application for the same student and posting.
- An application must contain the student's current contact and education information, availability, cover note, and a CV. The product may allow additional supporting documents.
- The system records the application submission time and creates an initial `Submitted` status-history entry.
- Students can view their own applications, current status, status history, and documents. Authorized Company Staff, the assigned Supervisor after placement creation, and Admins can view the information needed for their responsibilities.
- Application statuses are `Submitted`, `Under Review`, `Interview`, `Accepted`, `Rejected`, and `Withdrawn`.
- The allowed staff/admin progression is `Submitted → Under Review → Interview → Accepted` or `Rejected`. A rejection may occur after `Submitted`, `Under Review`, or `Interview`.
- Students may withdraw only their own non-terminal application. `Accepted`, `Rejected`, and `Withdrawn` are terminal and cannot transition further.
- Every status change must retain the previous status, new status, time, acting user, and any supplied note. History is not edited or deleted.
- Only Company Staff responsible for the posting's company or an Admin may move an application through the staff/admin progression.
- Accepting an application creates one placement for that application. A placement cannot be created from a non-accepted application, and an accepted application cannot create more than one placement.

### 3.4 Placements, tasks, and weekly reports

- A placement links the accepted student, internship, responsible company, and assigned supervisor. It records its start date, end date, and whether it is active, completed, or terminated.
- The student, assigned Supervisor, authorized Company Staff, and Admin can view a placement. The student can act only on their own active placement.
- An assigned Supervisor or Admin can create tasks for a placement with a title, description, priority, and optional due date.
- Students can update the status of tasks assigned to their active placement as `To Do`, `In Progress`, or `Done`. Task status is a student-reported progress record; the product does not infer it automatically.
- A task with a due date before the current date and a status other than `Done` is shown as overdue.
- Students can save a draft weekly report for an active placement and reporting week. A draft is visible only to the student until submitted.
- A weekly report contains accomplishments, challenges, and next-week plan. Supporting attachments are optional.
- A student may submit one report for a placement and reporting week at a time. Submission records the submitted content and time and makes it available to the assigned Supervisor and Admin.
- An assigned Supervisor or Admin can add feedback and either approve a submitted report or request revision. A revision request must include feedback.
- When revision is requested, the student can revise and resubmit the report for the same reporting week. The product retains each submitted version and each review decision or feedback entry so that the reporting history remains transparent.
- Company Staff may read authorized placement progress but cannot assign tasks, change student task status, or review reports unless also acting as the assigned Supervisor or Admin.

### 3.5 Evaluation

- Students can create, save, and submit a self-assessment for their own placement. It includes self-ratings, reflection, and recorded learning outcomes.
- The assigned Supervisor or Admin can create, save, and submit a separate performance evaluation for the placement. It includes performance ratings and a completion decision of `Passed`, `Failed`, `Pending`, or `Incomplete`.
- Students can view their submitted self-assessment and the final supervisor/admin evaluation. Supervisors can view the student self-assessment for placements they supervise.
- The product displays student and supervisor assessments separately. It does not calculate or claim an official academic grade unless a grading policy is defined separately.
- AI must not determine ratings, the completion decision, or any academic outcome.

### 3.6 Monitoring and notifications

- Admins can view aggregated, read-only monitoring information for the relevant program or term, including student placement status, task/report progress, application totals and outcomes, upcoming deadlines, and recent activity.
- Monitoring views provide visibility and do not change source records directly.
- The system creates in-app notifications for application status changes, task assignment, weekly-report feedback or revision requests, and relevant application or reporting deadlines.
- A notification identifies its recipient, event, related record where applicable, time, and read/unread state. A user can view and mark only their own notifications as read.
- Email or other external delivery channels are outside this functional scope.

### 3.7 Optional AI assistance

- The product may provide a natural-language explanation of a Match Score using the already calculated score and skill breakdown.
- The product may summarize a submitted weekly report for the assigned Supervisor.
- Both features are advisory and clearly distinguish generated text from the student's report or the deterministic Match Score.
- If AI assistance is unavailable, slow, or fails, search and matching, application submission, report submission, report reading, and all human decisions remain available. The score breakdown and original report content remain the source information.

## 4. Key lifecycle rules

| Item | States or rule | Owner of change |
| --- | --- | --- |
| Internship posting | Draft, Open, Closed, Archived; only Open and non-expired postings accept applications. | Owning Company Staff or Admin |
| Application | Submitted → Under Review → Interview → Accepted or Rejected; student withdrawal is allowed before a terminal outcome. | Owning Company Staff/Admin; withdrawal by Student |
| Placement | Active, Completed, Terminated; exists only after acceptance. | Responsible Supervisor/Admin |
| Task | To Do, In Progress, Done; overdue is derived from due date and unfinished status. | Supervisor/Admin creates; placement Student updates status |
| Weekly report | Draft, Submitted, Revision Requested, Approved; revision produces a new submitted version for the same week. | Student drafts/submits; Supervisor/Admin reviews |
| Evaluation | Student self-assessment and supervisor/admin evaluation are independent submissions. | Student or assigned Supervisor/Admin respectively |

## 5. Requirement coverage matrix

| Module | Actors | Primary flow | Essential rules |
| --- | --- | --- | --- |
| Profile and organization | Student, Company Staff, Admin | Maintain profile, skills, preferences, company, and postings | Resource ownership; complete posting before publish |
| Discovery and matching | Student | Search, filter, inspect, save, and compare opportunities | Search only available postings; score is deterministic and advisory |
| Applications | Student, Company Staff, Admin | Submit, track, process, withdraw | One application per student/posting; audited allowed transitions |
| Placements and progress | Student, Supervisor, Company Staff, Admin | Accept application, manage tasks, submit/review reports | Placement follows acceptance; one active report per week; revision history retained |
| Evaluation | Student, Supervisor, Admin | Self-assess and submit supervisor evaluation | Separate role-owned submissions; no implied grading formula |
| Monitoring and notifications | Admin, all recipients | Monitor activity and receive events | Monitoring is read-only; recipients see only their notifications |

## 6. Implementation status and deferred scope

The current React application, use-case diagrams, UI mockups, and DBML are evidence that informed this specification. They are not the functional authority. The application currently demonstrates UI flows with mock data; persistent services, integrations, and enforcement of the rules in this document are planned rather than implemented.

The following are intentionally outside the current functional scope:

- AI interviews, AI screening scores, or any AI-based hiring, task, evaluation, or completion decision.
- Semantic or embedding-based internship search.
- Email, SMS, push, or other external notification delivery.
- Architectural choices such as API routes, databases, queues, storage providers, deployment, or internal processing mechanisms.

The previous role label `company_admin` is superseded in product language by **Company Staff**: a company member authorized to manage that company's records. The UI's combined evaluation controls are superseded by the separate role-owned evaluation requirements in this document.

## 7. Audit-driven product clarifications

- Users select only a role they currently hold; the server establishes that selection before role-specific navigation and data change.
- Responsible Company Staff/Admin chooses an eligible Supervisor and start/end dates when accepting an application. Eligible Supervisors hold the Supervisor role and profile; there is no company/program restriction in v1. Admin alone may subsequently replace or revoke an Active placement's assignment with retained actor/time/reason history. A temporarily unassigned placement is handled by Admin. Revocation removes future Supervisor access immediately.
- Identical acceptance retries return the existing result without a new transition. Different acceptance details conflict with the retained original command, even after reassignment.
- Skill matching uses presence only: required skills have weight 2, optional skills weight 1; the matched-weight percentage is rounded to an integer with halves upward. Empty posting skills yield 0 and a no-skills explanation. Proficiency and preferences do not alter the score. Relevance counts matching preference dimensions and uses score, recency and ID as stable tie-breakers; it never excludes otherwise eligible opportunities.
- Dates use a recorded IANA timezone, resolved from the term override, its program, or Asia/Ho_Chi_Minh fallback. Reporting periods are Monday–Sunday weeks overlapping placement dates, including partial first/last weeks; each is due at the following Monday midnight. Reports cannot be started before their week starts. Late submissions are permitted on Active placements. Initial submission time determines lateness. Ending a placement stops report writes and reminders, retaining history.
- Application deadline reminders go to Students who saved a still-eligible posting and have not applied, during its last 24 hours. Report reminders go to the placement Student during the last 24 hours before its deadline and once after it becomes overdue, only while Active and without any submitted version. Revision requests do not create a new deadline. Notifications remain in-app and are deduplicated.
- Draft text and draft attachments remain private to the Student throughout revisions, including from Admin. Submitted versions and version-linked reviews remain available to authorized participants. Review decisions apply only to the exact version viewed; stale decisions are rejected.

The [behavior rules](../design/behavior-rules.md) define the corresponding calculation, calendar boundaries, and technical protocols; [traceability](../design/traceability.md) records observable acceptance scenarios.
