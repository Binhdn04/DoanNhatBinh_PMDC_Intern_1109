# InternHub Product Requirements

**Status:** Derived implementation-agnostic requirements  
**Source of truth:** [Functional specification](./spec.md)  
**Last updated:** 2026-09-15

## How to use this document

Each requirement is a small, testable product slice written to support the INVEST qualities: it has a clear value, is bounded, can be discussed without prescribing a technical solution, and has observable acceptance criteria. `SPEC.md`/`spec.md` remains authoritative if a conflict is found.

### Shared terms and rules

- **Eligible posting** means an Open posting whose deadline has not passed.
- A user may access a record only when both their role and their relationship to that record permit it. Company Staff are related only to their own company; Supervisors are related only to explicitly assigned placements; Students are related only to their own records. Admins have the access needed to administer all records.
- Dates use the product's current date. A deadline ending on the current date remains valid through that date unless the product presents a more precise deadline time.
- The requirements describe in-app behavior. They do not prescribe APIs, persistence, database design, hosting, or integrations.

## Requirements

### RQ-01 — Enforce role and record ownership

- **Actor:** Student, Company Staff, Supervisor, Admin
- **User story:** As an authorized user, I want to access only the records for which I am responsible, so that internship information remains appropriately scoped.
- **Preconditions:** The actor is authenticated and the target record exists.
- **Business rules:** Role and record relationship are both required. A company relationship does not grant access to another company's records. A Supervisor's access is limited to assigned placements. Admins may carry out an action reserved for the responsible role when administering the record.
- **Acceptance criteria:**
  - **Given** a Student and another student's application, **when** the Student tries to view or change it, **then** access is denied.
  - **Given** Company Staff and a posting owned by their company, **when** they manage it, **then** the action is allowed within their posting permissions.
  - **Given** a Supervisor not assigned to a placement, **when** they request its reports or tasks, **then** access is denied.
- **Edge cases:** Removing a supervisor assignment removes that Supervisor's future access; it does not remove the placement's existing history. A user with multiple roles is authorized only through a valid role-relationship combination.
- **Dependencies:** Authenticated identity and the ownership/assignment relationships established by RQ-03, RQ-08, and RQ-09.

### RQ-02 — Maintain student profile and preferences

- **Actor:** Student
- **User story:** As a Student, I want to maintain my application-ready profile and preferences, so that I can discover relevant opportunities and apply with accurate information.
- **Preconditions:** The Student is authenticated.
- **Business rules:** A Student may view and change only their own identity and education details, skills (including optional proficiency), career preferences, and reusable application documents. Preferences include industries, locations, work arrangements, and duration; they influence relevance only and never hide otherwise eligible opportunities.
- **Acceptance criteria:**
  - **Given** a Student edits a skill or preference, **when** they save it, **then** their subsequent matching and application profile use the saved value.
  - **Given** a Student removes a skill, **when** matching is shown again, **then** the removed skill is no longer counted as matched.
  - **Given** a posting outside the Student's preferences, **when** it is eligible, **then** the Student can still discover and view it.
- **Edge cases:** A Student with no recorded skills receives a valid score breakdown with no matched skills. Updating a profile does not rewrite information retained in a previously submitted application.
- **Dependencies:** RQ-01; RQ-04 and RQ-05 consume preferences and skills; RQ-07 consumes the current profile for a new application.

### RQ-03 — Manage company profiles and internship postings

- **Actor:** Company Staff, Admin
- **User story:** As Company Staff, I want to maintain my company and its internship postings, so that Students can apply to accurate opportunities.
- **Preconditions:** The actor is authorized for the company; a company exists before its posting is created.
- **Business rules:** Company Staff may manage only their company's public profile and postings; Admins may do so for any company. A posting moves among Draft, Open, Closed, and Archived. Publishing requires company, title, description, location, work arrangement, duration, deadline, number of openings, required skills, and optional skills. Only eligible postings accept new applications.
- **Acceptance criteria:**
  - **Given** a Draft posting with all required information, **when** authorized staff publish it, **then** it becomes Open and is discoverable.
  - **Given** a posting missing a required publishing field, **when** staff attempt to publish it, **then** it remains unpublished and identifies the missing information.
  - **Given** a Closed, Archived, Draft, or expired posting, **when** a Student attempts to apply, **then** the application is not accepted.
- **Edge cases:** Closing or expiring a posting preserves existing applications and placements. Authorized users can still view records that reference a closed or archived posting.
- **Dependencies:** RQ-01; RQ-04 exposes eligible postings; RQ-07 checks posting eligibility.

### RQ-04 — Discover and inspect opportunities

- **Actor:** Student
- **User story:** As a Student, I want to search, filter, sort, and inspect eligible internships, so that I can decide which opportunities to pursue.
- **Preconditions:** Eligible postings exist; the Student is authenticated when personal Match Scores are shown.
- **Business rules:** Keyword search covers posting title, company, and skills. Filters cover category, location, duration, and work arrangement. Sort choices are relevance, newest posting, and Match Score. Details show the role, company, requirements, optional skills, responsibilities and benefits when supplied, deadline, and available places.
- **Acceptance criteria:**
  - **Given** eligible postings, **when** a Student searches by a title, company, or skill keyword, **then** matching postings are returned.
  - **Given** the Student applies one or more filters, **when** results are displayed, **then** every result satisfies the selected filters.
  - **Given** no eligible posting matches the search, **when** results are displayed, **then** an empty result is shown without exposing ineligible postings.
- **Edge cases:** A posting with no supplied benefits or responsibilities remains viewable and presents those fields as unavailable. Ineligible postings are not included in normal discovery results.
- **Dependencies:** RQ-02, RQ-03, and RQ-05.

### RQ-05 — Show deterministic skill-based Match Scores

- **Actor:** Student
- **User story:** As a Student, I want to see an understandable Match Score for an eligible posting, so that I can assess skill alignment without being screened out.
- **Preconditions:** The Student is authenticated, has a profile, and is viewing an eligible posting.
- **Business rules:** The score is an integer from 0 through 100 calculated deterministically from the Student's recorded skills and the posting's required and optional skills. The product identifies matched and missing skills. Identical inputs produce the same score and breakdown. The score is advisory and cannot determine visibility, application eligibility, or a hiring decision.
- **Acceptance criteria:**
  - **Given** unchanged Student skills and posting skills, **when** the score is requested repeatedly, **then** the same score and breakdown are displayed.
  - **Given** a Student lacks a required posting skill, **when** the score is displayed, **then** that skill is identified as missing and the Student can still apply if otherwise eligible.
  - **Given** an eligible posting, **when** the Student sorts by Match Score, **then** results are ordered by the displayed deterministic score.
- **Edge cases:** A posting with no required or optional skills has a valid, clearly explained score outcome. Changes to either skill set affect future scores only; they do not alter historical applications.
- **Dependencies:** RQ-02, RQ-03, and RQ-04.

### RQ-06 — Save opportunities

- **Actor:** Student
- **User story:** As a Student, I want to save and remove eligible opportunities, so that I can revisit them later.
- **Preconditions:** The Student is authenticated and can view the posting.
- **Business rules:** Saved opportunities are personal to the Student. Saving the same posting more than once does not create duplicates. Only open opportunities may be newly saved.
- **Acceptance criteria:**
  - **Given** an eligible posting, **when** a Student saves it, **then** it appears once in that Student's saved-opportunity list.
  - **Given** a saved posting, **when** the Student removes it, **then** it no longer appears in their list.
- **Edge cases:** A saved posting that later closes, archives, or expires remains visible to its saving Student as unavailable and cannot be newly applied to.
- **Dependencies:** RQ-01 and RQ-03.

### RQ-07 — Submit and view an application

- **Actor:** Student
- **User story:** As a Student, I want to submit one complete application to an eligible posting and track it, so that I can pursue an internship transparently.
- **Preconditions:** The Student is authenticated; the posting is eligible; the Student has not previously applied to that posting.
- **Business rules:** An application includes current contact and education information, availability, cover note, and CV; additional documents are optional. One Student may have only one application per posting, including after withdrawal or rejection. Submission records its time and initial `Submitted` history entry. The Student may view only their own applications, documents, status, and status history.
- **Acceptance criteria:**
  - **Given** all required application information, **when** the Student submits to an eligible posting, **then** one application is created with status `Submitted` and a submission-time history entry.
  - **Given** a missing CV or other required information, **when** the Student attempts submission, **then** no application is created and the missing information is identified.
  - **Given** a prior application for the same Student and posting, **when** the Student attempts another submission, **then** no second application is created.
- **Edge cases:** A posting becoming ineligible before submission prevents submission. A subsequent profile edit does not change retained application information. A Student can view a submitted application even if the posting later closes.
- **Dependencies:** RQ-01, RQ-02, and RQ-03.

### RQ-08 — Process applications and create placements

- **Actor:** Company Staff, Admin; Student for withdrawal
- **User story:** As authorized Company Staff, I want to move an application's status through the review process, so that application outcomes are auditable and accepted Students receive a placement.
- **Preconditions:** An application exists; Company Staff are authorized for the posting's company, or the actor is an Admin.
- **Business rules:** Staff/Admin progression is `Submitted` to `Under Review` to `Interview` to `Accepted`; rejection is allowed from `Submitted`, `Under Review`, or `Interview`. A Student may withdraw only their own non-terminal application. `Accepted`, `Rejected`, and `Withdrawn` are terminal. Each status change retains old and new status, time, acting user, and supplied note; history cannot be edited or deleted. Accepting creates exactly one placement; no other status can create one.
- **Acceptance criteria:**
  - **Given** an application in `Submitted`, **when** authorized staff set it to `Under Review`, **then** the status change and its audit details are visible in history.
  - **Given** an application in an allowed non-terminal state, **when** authorized staff accept it, **then** it becomes `Accepted` and exactly one placement is created.
  - **Given** an accepted, rejected, or withdrawn application, **when** any actor attempts another transition, **then** the transition is refused.
  - **Given** a Student's non-terminal application, **when** the Student withdraws it, **then** it becomes `Withdrawn` and no placement is created.
- **Edge cases:** A retry of acceptance must not create a duplicate placement. Staff from a different company cannot change the application. A rejection does not allow a replacement application to the same posting.
- **Dependencies:** RQ-01, RQ-03, RQ-07, and RQ-09.

### RQ-09 — View and manage the placement lifecycle

- **Actor:** Student, Supervisor, Company Staff, Admin
- **User story:** As a placement participant, I want to view the placement that follows an accepted application, so that I understand its internship and supervision context.
- **Preconditions:** An application has been accepted and its one placement exists.
- **Business rules:** A placement links the accepted Student, internship, responsible company, and assigned Supervisor, and records start date, end date, and one of `Active`, `Completed`, or `Terminated`. Student actions apply only to their own Active placement. The Student, assigned Supervisor, authorized Company Staff, and Admin can view it. Supervisor/Admin manage the placement lifecycle.
- **Acceptance criteria:**
  - **Given** an accepted application, **when** the outcome is recorded, **then** participants can view its single placement and its core context.
  - **Given** an Active placement, **when** its authorized supervisor or Admin marks it completed or terminated, **then** the new lifecycle state is displayed.
  - **Given** a Student's completed or terminated placement, **when** the Student attempts an active-placement action, **then** the action is refused.
- **Edge cases:** An application cannot have a placement before acceptance. An unassigned Supervisor cannot view a placement. Ending a placement preserves its tasks, reports, and evaluations for authorized viewing.
- **Dependencies:** RQ-01 and RQ-08.

### RQ-10 — Assign and update placement tasks

- **Actor:** Supervisor, Admin, Student
- **User story:** As a Supervisor, I want to assign tasks, and as a Student I want to report their progress, so that placement work is visible.
- **Preconditions:** An Active placement exists; the Supervisor is assigned to it or the actor is an Admin.
- **Business rules:** Supervisor/Admin task creation requires a title, description, and priority; due date is optional. Only the placement Student updates task status as `To Do`, `In Progress`, or `Done`. A task with a due date before the current date and status other than `Done` is overdue. Progress is student-reported and never inferred automatically.
- **Acceptance criteria:**
  - **Given** an Active placement, **when** its assigned Supervisor creates a task with required details, **then** the Student can see it.
  - **Given** a task on the Student's Active placement, **when** the Student updates its status, **then** the selected status is shown.
  - **Given** an unfinished task whose due date is before today, **when** it is viewed, **then** it is indicated as overdue.
- **Edge cases:** A task due today is not overdue. Marking an overdue task `Done` removes its overdue indication. Company Staff cannot assign a task or change its status unless also the assigned Supervisor or an Admin.
- **Dependencies:** RQ-01, RQ-09, and RQ-15 for assignment notifications.

### RQ-11 — Submit, review, revise, and retain weekly reports

- **Actor:** Student, Supervisor, Admin
- **User story:** As a Student, I want to submit a weekly report and respond to review feedback, so that my progress is documented transparently.
- **Preconditions:** The Student has an Active placement; the reviewing Supervisor is assigned to that placement, unless the reviewer is an Admin.
- **Business rules:** A Student can save a private draft for a reporting week. A report requires accomplishments, challenges, and next-week plan; attachments are optional. Only one report for a placement and reporting week is active at a time. Submission records content and time and makes it visible to its reviewer. Reviewer outcomes are `Approved` or `Revision Requested`; a revision request requires feedback. The Student may revise and resubmit that reporting week after a revision request. Every submitted version and review/feedback entry is retained. Company Staff may read authorized progress but may not review reports unless also the assigned Supervisor or an Admin.
- **Acceptance criteria:**
  - **Given** an Active placement and a complete draft, **when** the Student submits it, **then** it is available to the assigned Supervisor and Admin with its submission time.
  - **Given** a submitted report, **when** an authorized reviewer requests revision with feedback, **then** the Student can revise and resubmit it for the same week.
  - **Given** a revised report is resubmitted, **when** report history is viewed, **then** the prior submission and review feedback remain available alongside the new version.
  - **Given** a reviewer attempts to request revision without feedback, **when** they submit the decision, **then** the decision is refused.
- **Edge cases:** A Student cannot submit another independent report for the same placement and week. A draft remains private until submitted. A completed or terminated placement does not accept new drafts or submissions, but authorized users retain read access to history.
- **Dependencies:** RQ-01, RQ-09, and RQ-15 for feedback/revision notifications.

### RQ-12 — Submit a student self-assessment

- **Actor:** Student
- **User story:** As a Student, I want to submit a separate self-assessment and learning outcomes for my placement, so that my perspective is recorded.
- **Preconditions:** The Student owns the placement.
- **Business rules:** The self-assessment includes self-ratings, reflection, and learning outcomes. The Student may save before submitting. It is distinct from the supervisor/admin evaluation and does not determine a final decision or academic grade.
- **Acceptance criteria:**
  - **Given** the Student's placement, **when** the Student saves a self-assessment, **then** it remains available for that Student to complete.
  - **Given** a complete self-assessment, **when** the Student submits it, **then** the assigned Supervisor and Admin can view it separately from their evaluation.
- **Edge cases:** A Student cannot create a self-assessment for another Student's placement. An incomplete saved assessment is not presented as submitted.
- **Dependencies:** RQ-01 and RQ-09.

### RQ-13 — Submit an independent performance evaluation

- **Actor:** Assigned Supervisor, Admin
- **User story:** As an assigned Supervisor, I want to submit a performance evaluation and completion decision, so that the placement has an accountable outcome.
- **Preconditions:** The placement exists and the actor is its assigned Supervisor or an Admin.
- **Business rules:** The performance evaluation includes performance ratings and one completion decision: `Passed`, `Failed`, `Pending`, or `Incomplete`. It is a separate submission from the Student self-assessment. The product displays the two assessments separately and does not calculate or represent an official academic grade. AI cannot determine any rating, decision, or academic outcome.
- **Acceptance criteria:**
  - **Given** an authorized reviewer and a placement, **when** they submit performance ratings and a valid completion decision, **then** the evaluation is recorded separately from the Student self-assessment.
  - **Given** both assessments exist, **when** the Student views the evaluation area, **then** each assessment is identifiable by its authoring role and content is not combined into a calculated grade.
  - **Given** an unassigned Supervisor, **when** they attempt to submit an evaluation, **then** submission is refused.
- **Edge cases:** `Pending` is a valid final recorded state while an outcome is unresolved. Absence of a self-assessment does not give a Supervisor access to create one for the Student.
- **Dependencies:** RQ-01, RQ-09, and RQ-12.

### RQ-14 — Monitor program activity without changing source records

- **Actor:** Admin
- **User story:** As an Admin, I want a program-level view of internship activity and deadlines, so that I can identify items needing attention without altering operational records from the dashboard.
- **Preconditions:** The Admin is authenticated and relevant application, placement, task, or report information exists.
- **Business rules:** Monitoring is aggregated and read-only. It includes placement status, task and report progress, application totals and outcomes, upcoming deadlines, and recent activity for the relevant program or term. The monitoring view does not directly modify source records.
- **Acceptance criteria:**
  - **Given** applications and placements in the relevant program or term, **when** an Admin opens monitoring, **then** aggregate counts and relevant status/progress information are displayed.
  - **Given** upcoming application or reporting deadlines, **when** an Admin views monitoring, **then** those deadlines are visible.
  - **Given** an Admin views a monitoring item, **when** they attempt to change its source record from the monitoring view, **then** no direct modification is available.
- **Edge cases:** Empty programs/terms display zero or no-data information rather than misleading totals. Aggregation does not reveal records beyond the Admin's administrative scope.
- **Dependencies:** RQ-01, RQ-07 through RQ-11, and RQ-13.

### RQ-15 — Deliver and manage in-app notifications

- **Actor:** Student, Company Staff, Supervisor, Admin
- **User story:** As a participant, I want in-app notifications about changes and deadlines relevant to me, so that I can respond on time.
- **Preconditions:** A relevant event occurs and the recipient is authorized to view the related record.
- **Business rules:** Notifications are created for application status changes, task assignments, weekly-report feedback or revision requests, and relevant application or reporting deadlines. Each identifies the recipient, event, related record when applicable, time, and read/unread state. A user may view and mark only their own notifications as read. External delivery channels are out of scope.
- **Acceptance criteria:**
  - **Given** an application status changes, **when** the change is recorded, **then** the affected Student receives an in-app notification.
  - **Given** a task is assigned to a placement, **when** it is created, **then** the placement Student receives an in-app notification.
  - **Given** report feedback or a revision request is recorded, **when** the event occurs, **then** the placement Student receives an in-app notification.
  - **Given** an unread notification, **when** its recipient marks it read, **then** only that recipient's notification state changes.
- **Edge cases:** Multiple distinct events may create distinct notifications. No notification exposes a related record to a recipient who lacks access. The absence of email, SMS, or push delivery does not prevent the in-app event from being recorded.
- **Dependencies:** RQ-01, RQ-08, RQ-10, and RQ-11.

### RQ-16 — Offer optional, non-decisive AI assistance

- **Actor:** Student, Assigned Supervisor
- **User story:** As a Student or assigned Supervisor, I want optional AI assistance that explains existing information, so that I can understand it faster without delegating decisions to AI.
- **Preconditions:** The actor is authorized for the relevant posting or report; the underlying score breakdown or submitted report exists.
- **Business rules:** AI may explain an already calculated Match Score or summarize a submitted weekly report. Generated content must be distinguishable from the deterministic score and original report. AI cannot screen applicants, conduct interviews, set workflow statuses, assign tasks, rate performance, decide completion, or calculate academic outcomes. A failure, delay, or unavailability of AI cannot block core workflows.
- **Acceptance criteria:**
  - **Given** a displayed Match Score and breakdown, **when** the Student requests an explanation, **then** any generated explanation is presented as advisory and does not change the score or eligibility.
  - **Given** a submitted report, **when** its assigned Supervisor requests a summary, **then** the original report remains available and the summary is identified as generated assistance.
  - **Given** AI assistance is unavailable, **when** a Student submits an application or report, **then** the submission can still complete using the required non-AI information.
- **Edge cases:** No generated result is treated as a source record or as a human decision. An unauthorized actor cannot request a summary of a report they cannot view.
- **Dependencies:** RQ-01, RQ-05, and RQ-11.

## Out of scope

The following are deliberately excluded from these requirements: AI interviews or screening; automated hiring, evaluation, task, completion, or workflow-status decisions; semantic/embedding search; external notification delivery; and all implementation architecture or technology decisions.
