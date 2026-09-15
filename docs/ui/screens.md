# InternHub Screen Inventory and Flows

## Screen conventions

Every data screen supports loading, recoverable load error, empty/no-result, and access-denied states as applicable. List screens preserve filters when a user returns from detail. Record screens show a lifecycle state in their header and use an immutable history/timeline wherever the requirements retain audit information.

The following state vocabulary prevents repetitive ambiguity in the inventory:

- **Permission:** unauthorized direct access renders Access Denied without record data; unrelated records never appear in lists or notifications.
- **Form:** inline validation identifies required missing fields; submit controls show in-progress state and prevent duplicate submission. Recoverable failure preserves entered values.
- **Availability:** unavailable postings and inactive placements remain readable only to authorized actors and suppress Active-only actions.
- **Confirmation:** destructive or irreversible actions require a confirmation dialogue. Status decisions retain actor, time, old/new status, and supplied note.

## Shared and utility screens

| Screen | Purpose and actors | Key content/components | Main actions | States | Navigation/flow |
| --- | --- | --- | --- | --- | --- |
| Access Denied | Safely handles an unauthorized record or URL for all actors. | Plain explanation, active-role landing-page link; no protected identifiers. | Return home. | Permission only. | Direct URL or blocked deep link → active-role landing page. |
| Notification panel and inbox | Lets all actors see and manage only their notifications. | Recent panel from bell; full inbox with event, related-record label, time, unread/read indicator, filter, and mark-read controls. | Open, mark one/all read. | Empty, loading/error, unread/read, inaccessible target. | Bell → panel → Inbox; notification → authorized related record. |
| Confirm action dialogue | Makes consequential actions explicit. | Action summary, impacted record, consequence, optional/required note or feedback, cancel/confirm. | Confirm or cancel. | Disabled until validation passes; success/error feedback. | Invoked from lifecycle, withdrawal, publish, and review actions; returns to refreshed source screen. |

## Student screens

| Screen | Purpose and actors | Key content/components | Main actions | States | Navigation/flow |
| --- | --- | --- | --- | --- | --- |
| Discover Results | Student searches eligible opportunities. | Keyword search across title/company/skills; category, location, duration, work-arrangement filters; relevance/newest/Match Score sort; result cards with advisory score. | Search, filter, sort, open detail. | Loading; no matching eligible posts; no eligible posts; results without skills still show valid score. | Student nav → Posting Detail. |
| Saved Opportunities | Student revisits personal saves. | Saved posting cards/table, current availability, deadline, score where eligible, remove control. | Open detail, remove save. | Empty; saved item later unavailable; load/error. | Student nav or save confirmation → Posting Detail. |
| Posting Detail | Student evaluates an opportunity without being screened out. | Role, company, description, required/optional skills with matched/missing labels, responsibilities/benefits or “Not provided”, deadline, openings, deterministic 0–100 score breakdown, advisory disclosure. | Save/remove if Open; request AI explanation; Apply when eligible. | Loading/error; Open; already applied; Draft/Closed/Archived/Expired; AI loading/unavailable/error. | Discover/Saved → Apply or back to prior list. |
| Apply | Student creates one application for an eligible posting. | Posting summary; current contact/education snapshot, availability, cover note, required CV, optional documents; required-field validation. | Submit application, cancel/back. | Eligibility changed before submit; duplicate application; missing data/CV; upload and submit states. | Posting Detail → submitted Application Detail; cancel → Posting Detail. |
| My Applications | Student tracks own applications. | Search/filterable application list with posting, company, submitted date, current status and placement link when Accepted. | Open application. | Empty; list loading/error. | Student nav → Application Detail. |
| Application Detail | Student sees submitted data and auditable status. | Read-only submitted snapshot/documents, current status, immutable status timeline with actor/time/note, posting summary, placement link if accepted. | Withdraw non-terminal application with optional note; open placement. | Submitted/Under Review/Interview; terminal Accepted/Rejected/Withdrawn; withdrawal failure. | My Applications/notification → Placement Overview or back to list. |
| Placement Overview | Student sees own placement context and progress. | Status, dates, posting/company/supervisor, progress summary, tabs for Tasks, Reports, Evaluations. | Open permitted tab/action. | No placement; Active; Completed/Terminated read-only. | Student nav/accepted application/notification → tasks, reports, evaluations. |
| Student Tasks | Student reports task progress. | Task board/list grouped by To Do/In Progress/Done, priority, due date, explicit overdue indicator, task description. | Change own Active-placement task status only. | Empty; Active; task update pending/error; inactive placement read-only. | Placement Overview → task detail/status control. |
| Student Reports | Student manages weekly reports. | Week-indexed list with Draft/Submitted/Revision Requested/Approved state, latest update, due context. | Start report for available week, open draft/history. | Empty; no Active placement; active report for week; inactive placement read-only. | Placement Overview → Report Editor or Report Detail. |
| Report Editor | Student saves, submits, or revises one weekly report. | Reporting-week selector/identity, accomplishments, challenges, next-week plan, optional attachments, draft state, prior reviewer feedback when revising. | Save draft, submit, revise/resubmit, cancel. | Required-content validation; draft private; duplicate-week prevention; revision-requested; Active-only; upload/submit error. | Reports → Report Detail after submit; back preserves draft. |
| Student Report Detail | Student reads the report and retained history. | Current submitted content, attachments, review outcome/feedback, chronological submitted-version and review history. | Revise when Revision Requested; return to reports. | Draft private; Submitted awaiting review; Revision Requested; Approved; inactive placement read-only. | Reports/notification → Report Editor or Reports list. |
| Student Evaluation Area | Student keeps assessments separate. | Placement context plus two clearly labelled cards: My Self-assessment and Supervisor/Admin Evaluation. | Create/edit draft/submit self-assessment; view submitted evaluation. | No placement; draft; submitted; evaluator assessment absent; authorized read-only on inactive placement. | Placement Overview → Self-assessment Editor/detail. |
| Self-assessment Editor/detail | Student records ratings, reflection, and learning outcomes. | Self-rating inputs, reflection, learning outcomes, saved/submitted state; no supervisor decision controls. | Save draft, submit, view own submitted content. | Validation; saved incomplete; submitted; load/error. | Evaluation Area → back to evaluation area. |
| Student Profile | Student maintains application-ready profile. | Identity/contact and education editor, Skills & Preferences subpages, reusable Documents file list. | Edit/save identity/education; add/change/remove skill and optional proficiency; set preferences; upload/replace/remove reusable documents. | Loading/error; saved confirmation; field/upload errors; no skills/documents. | Student nav; Profile links to Skills & Preferences/Documents. |

## Company Staff and Admin operational screens

| Screen | Purpose and actors | Key content/components | Main actions | States | Navigation/flow |
| --- | --- | --- | --- | --- | --- |
| Company Profile | Company Staff manages its company; Admin manages selected company. | Public company identity, description, contact and other public information. | Edit/save company profile. | Loading/error; validation; access limited to owned company for staff. | Company/Companies list → Postings. |
| Posting List | Company Staff or Admin manages postings. | Filter/searchable list with status, deadline, openings, applicant count, and lifecycle state. | Create posting, open detail/editor. | Empty; Draft/Open/Closed/Archived; loading/error. | Nav/company profile → Posting Editor or Posting Detail. |
| Posting Editor | Staff/Admin creates or edits a posting. | Company, title, description, category, location, work arrangement, duration, deadline, openings, required/optional skills, optional responsibilities/benefits. | Save Draft, update Draft, attempt Publish. | Field errors; publish validation names every missing required publishing field; saved Draft; error. | Posting List/detail → posting detail after save/publish. |
| Posting Detail and lifecycle | Staff/Admin reviews an owned/administered posting. | Full posting, status and deadline, availability explanation, applicants summary, immutable contextual data. | Edit; Publish valid Draft; Close; Archive; open Applicants. | Draft; Open; Closed; Archived; expired; transition confirmation/error. | Posting List → Applicants or editor. |
| Applicant List | Staff/Admin examines applications for a posting. | Applicant list, current status, submitted time, filters, sort, and count. | Open an application. | Empty; loading/error; owned-company boundary. | Posting Detail → Application Review. |
| Application Review | Staff/Admin processes an authorized application. | Submitted application snapshot/documents, current state, permitted next transitions, rejection option, immutable status history. | Move Submitted → Under Review → Interview → Accepted; reject from permitted state; add note; open created placement. | Non-terminal; terminal; transition validation/error; accepted placement created exactly once. | Applicant List/notification → Placement Overview after acceptance. |
| Company Placement Progress | Company Staff reads relevant placement progress. | Placement context, task/report progress summaries and authorized report history. | Open readable detail only. | Empty; Active; Completed/Terminated; no assignment/review/status controls. | Company Staff Placements → Placement Overview read-only sections. |

Admins use the same Company, Posting, Applicant, Application Review, and Placement screens with an explicit selected-company/program context. Admin actions remain operational actions performed from record detail, not Monitoring.

## Supervisor and Admin placement screens

| Screen | Purpose and actors | Key content/components | Main actions | States | Navigation/flow |
| --- | --- | --- | --- | --- | --- |
| Assigned/All Placements | Supervisor sees assigned placements; Admin sees scoped placement list. | Search/filterable list with student, posting/company, supervisor, dates, lifecycle, task/report progress. | Open placement. | Empty; loading/error; only assigned records for Supervisor. | Nav → Placement Overview. |
| Placement Overview | Authorized participant sees core placement context. | Student, posting, company, assigned supervisor, dates, lifecycle, tabs for Tasks/Reports/Evaluations and role-appropriate summary. | Supervisor/Admin mark Completed or Terminated; open tabs. | Active; Completed/Terminated history; lifecycle confirmation/error. | Placement list/application acceptance → tab views. |
| Task Board and Task Editor | Supervisor/Admin assigns work; Student sees status control in their version. | Tasks grouped/listed by status, title, description, priority, optional due date, explicit overdue flag. Editor has title/description/priority required. | Supervisor/Admin create task; Student alone updates own task status. | Empty; required-field errors; Active-only creation/update; overdue; inactive placement read-only. | Placement Tasks tab → create dialogue/task detail. |
| Report Review List | Supervisor/Admin finds submitted reports for authorized placements. | Report queue/list with placement, week, state, submitted time, revision attention indicator. | Open report. | Empty; loading/error; assigned-only for Supervisor. | Nav/notification/Placement Reports tab → Report Review Detail. |
| Report Review Detail | Supervisor/Admin reads original report and makes a human review decision. | Original content and attachments, version/review history, on-demand advisory AI summary, feedback field, decision controls. | Approve; request revision with required feedback; request summary. | Submitted; Revision Requested history; Approved; AI loading/unavailable/error; feedback validation; inactive placement read-only. | Review list → returns to queue or placement report history. |
| Evaluation Area | Supervisor/Admin views independent assessments for authorized placement. | Clearly separate student self-assessment and supervisor/admin performance-evaluation cards; no combined grade. | View student assessment; create/edit own performance evaluation. | Student assessment absent/draft not visible; evaluator draft/submitted; assignment denied. | Placement Evaluations tab → Performance Evaluation Editor/detail. |
| Performance Evaluation Editor/detail | Assigned Supervisor/Admin records performance evaluation. | Performance rating inputs, completion decision selector (`Passed`, `Failed`, `Pending`, `Incomplete`), save/submit state; separate student assessment link. | Save draft, submit evaluation. | Validation; draft; submitted; unassigned-supervisor access denied; error. | Evaluation Area → back to authorized placement. |

## Admin monitoring screen

| Screen | Purpose and actors | Key content/components | Main actions | States | Navigation/flow |
| --- | --- | --- | --- | --- | --- |
| Monitoring | Admin identifies program/term attention items without changing source records. | Program/term selector; aggregate application totals/outcomes; placement-status counts; task/report-progress summaries; upcoming application/report deadlines; recent activity; read-only tables/charts. | Change scope, filter, drill through to authorized record detail. | No data shows zero/no-data; loading/error; read-only notice. | Admin nav → operational detail via drill-through; no inline edit/create/transition controls. |

## Main user flows

### Discover, save, and apply

1. Student opens Discover, searches/filters/sorts eligible postings, and opens Posting Detail.
2. Detail displays the deterministic score and matched/missing skills as advice. The student may request an AI explanation, but can continue if it is unavailable.
3. Student saves an Open posting or proceeds to Apply. Applying validates eligibility and one-application-per-posting before submission.
4. Successful submission opens Application Detail with `Submitted` and its first history entry. Later notifications lead back to this detail. A non-terminal application can be withdrawn; it cannot be recreated afterward for the same posting.

### Draft, publish, and process a posting

1. Company Staff/Admin creates or edits a posting and saves Draft.
2. Publish validates company, title, description, location, work arrangement, duration, deadline, openings, and required/optional skills. Missing fields are named and the posting remains Draft.
3. An Open posting appears in Student discovery until it closes, is archived, or expires. Existing applications remain available to authorized users.
4. Staff/Admin opens an application and uses only permitted transitions. Acceptance writes the audit event, creates one placement, and exposes the placement link.

### Placement tasks and reports

1. Supervisor/Admin opens an Active authorized placement and creates a task with title, description, priority, and optional due date; the Student receives a notification.
2. Student opens the task and reports `To Do`, `In Progress`, or `Done`. Unfinished past-due tasks display as overdue.
3. Student starts one report for a reporting week, saves its private draft, then submits required content. Supervisor/Admin receives an authorized review entry.
4. Reviewer approves, or requests revision with required feedback. A revision returns the student to that same week’s editor; every submitted version and review entry remains visible in history.

### Evaluations, notifications, and AI fallback

1. Student saves/submits a self-assessment; assigned Supervisor/Admin independently saves/submits a performance evaluation and decision.
2. Both roles view them as separate authored records, never as a calculated grade.
3. Notifications expose only the recipient’s authorized events and deep-link to the relevant record. Reading or marking read affects only that recipient.
4. Match explanations and report summaries are requested on demand. Their loading/error/unavailable states leave score breakdowns, original reports, applications, reports, and human decisions fully usable.
