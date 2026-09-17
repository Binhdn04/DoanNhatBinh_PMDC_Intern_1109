# InternHub Screen Inventory and Flows

## Shared visual and state conventions

All authenticated screens use the fixed Stitch-aligned header, Plus Jakarta Sans/Inter hierarchy, slate canvas, white elevated cards, indigo primary action, and responsive grid from the [design system](design-system.md). Every data screen supports loading, recoverable error, empty/no-result, and access-denied states as applicable. Record screens retain lifecycle status and immutable history; list filters persist when returning from detail.

- **Permission:** unauthorized direct access renders Access Denied without record data; unrelated records never appear in lists or notifications.
- **Form:** inline validation identifies required values; in-progress submit prevents duplicates; recoverable failure preserves entered values.
- **Availability:** unavailable postings and inactive placements remain readable only to authorized actors and suppress Active-only actions.
- **Confirmation:** consequential actions require a dialogue that states impact; retained transitions show actor, time, old/new state, and note.
- **Responsive:** desktop uses the fixed header and twelve-column layout; tablet moves side content below reading content; mobile stacks content and actions while preserving 44px touch targets.

## Shared and utility screens

| Screen | Visual composition and purpose | Main actions | Required states/flow |
| --- | --- | --- | --- |
| Access Denied | Plain, non-disclosing centered state below the standard header; no protected identifiers. | Return to active-role landing page. | Direct URL/blocked deep link → landing page. |
| Notification panel and inbox | Header bell opens a compact recent panel; inbox uses filterable timeline/list with event, record label, time, and read state. | Open authorized record; mark one/all read. | Empty, loading/error, unread/read, inaccessible target. |
| Confirm action dialogue | Elevated modal with action summary, impacted record, consequence, required feedback/note, and clear cancel/confirm hierarchy. | Confirm or cancel. | Focus trapping, validation, success/error, return to refreshed source. |

## Student screens

| Screen | Visual composition and purpose | Main actions | Required states/flow |
| --- | --- | --- | --- |
| Discover Results | Search-led discovery surface: keyword, category, and location controls; active filter chips/result count; responsive opportunity-card collection. Cards show verified data only: company identity, role, metadata, skills, advisory score, and detail link. | Search, filter, sort, open detail. | Loading; no matches; no eligible posts; empty skill set remains neutral. |
| Saved Opportunities | Compact filter/header followed by saved cards or list rows with availability and deadline context. | Open detail; remove save. | Empty; saved item later unavailable; load/error. |
| Posting Detail | Opportunity/company hero with lifecycle/deadline, permitted Save/share/Apply actions, metadata summary, 8/4 desktop reading/context layout, requirements, responsibilities, benefits, score panel, and advisory AI panel. | Save/remove; request explanation; Apply when eligible. | Open; already applied; Draft/Closed/Archived/Expired; AI loading/unavailable/error. Apply opens the validated form, never an unvalidated one-click submission. |
| Apply | Focused, 800px-max form beneath posting summary; retain concise posting context and upload requirements. | Submit application; cancel/back. | Eligibility changed; duplicate; missing CV/data; upload/submit states. Successful submit → Application Detail. |
| My Applications | Tracker header with filter/search, a labelled non-draggable kanban board as desktop default, and list/table view switch. Lanes: Submitted, Under Review, Interview, Accepted, Closed (Rejected/Withdrawn); cards link to details only. | Change view/filter; open application. | Board scroll region is labelled; list/table is keyboard accessible; mobile stacks lanes/cards; empty/load/error. |
| Application Detail | Identity/status hero followed by read-only snapshot/documents, status timeline, posting summary, and placement link when accepted. | Withdraw eligible non-terminal application; open placement. | Submitted/Under Review/Interview; terminal Accepted/Rejected/Withdrawn; withdrawal failure. |
| Placement Overview | Placement hero, status/dates/company/supervisor summary, responsive progress cards, and tabs for Tasks, Reports, Evaluations. | Open permitted tab/action. | No placement; Active; Completed/Terminated read-only. |
| Student Tasks | Status-grouped board/list with priority, due date, textually explicit overdue state, and task description. | Update own Active-placement task state only. | Empty; update pending/error; inactive read-only. |
| Student Reports | Reporting calendar/list with week, due instant/timezone, latest state, missing/late context, and clear entry action. | Start/open report. | Empty; no Active placement; active week; inactive read-only. |
| Report Editor/Detail | Focused editor or readable detail with reporting-period identity, private-draft label, attachments, feedback, version/review timeline, and advisory assistance adjacent to source content. | Save draft; submit; revise/resubmit; return. | Validation; private draft; duplicate-week prevention; revision; upload/submit error; inactive read-only. |
| Student Evaluation Area and Self-assessment | Placement-context screen with separate self-assessment and evaluator-assessment panels; self-assessment editor is a focused form. | Save/submit self-assessment; view submitted evaluator assessment. | No placement; draft; submitted; evaluator assessment absent; inactive read-only. |
| Student Profile | Existing profile data presented as a talent-showcase hierarchy: identity/education hero, skills/preferences, and reusable documents in structured cards with edit affordances. | Edit/save profile; manage skills/preferences/documents. | Loading/error; no skills/documents; field/upload errors. No public portfolio or new profile-product capability. |

## Company Staff and Admin operational screens

| Screen | Visual composition and purpose | Main actions | Required states/flow |
| --- | --- | --- | --- |
| Company Profile | Company identity hero and focused public-information editor; show source-backed verification only when available. | Edit/save. | Loading/error; validation; staff ownership boundary. |
| Posting List and Editor | Filtered management table/cards; editor uses grouped two-column short fields and full-width narrative fields. | Create, save Draft, update, attempt Publish. | Empty; lifecycle filters; publish validation names missing requirements. |
| Posting Detail and Applicants | Context hero plus 8/4 reading/lifecycle layout; applicant summary links to dense applicant list with filters. | Edit, publish, close, archive, open/review applicants. | Draft/Open/Closed/Archived/expired; transition confirmation/error; owned-company boundary. |
| Application Review | Submitted snapshot, documents, immutable timeline, and clearly separated human-decision panel. Acceptance form keeps supervisor search and dates visible before confirmation. | Permitted transition, reject, accept/create placement. | Terminal/non-terminal; validation/error; no eligible supervisor; idempotent accepted-placement handling. |
| Company Placement Progress | Read-only progress summaries and authorized retained history within placement context. | Open readable detail only. | Empty; Active; Completed/Terminated; no review/assignment/status controls. |

## Supervisor and Admin placement screens

| Screen | Visual composition and purpose | Main actions | Required states/flow |
| --- | --- | --- | --- |
| Assigned/All Placements | Searchable operational table with contextual status/progress chips and readable identity hierarchy. | Open placement. | Empty; loading/error; Supervisor assignment scope. |
| Placement Overview | Context hero, lifecycle state, progress summary, semantic Tasks/Reports/Evaluations tabs, and role-permitted contextual actions. | Complete/terminate; Admin assignment management; open tabs. | Active; retained Completed/Terminated history; assignment conflict/refresh. |
| Task Board and Editor | Status-grouped board/list with clear task ownership; focused editor dialogue/form. | Supervisor/Admin create; Student alone updates own state. | Empty; validation; Active-only; overdue; inactive read-only. |
| Report Review List/Detail | Queue table/cards and source-first review detail with original content, attachments, version history, advisory summary, feedback, and decision controls bound to displayed version. | Approve; request revision; request summary. | Submitted/revision/approved; AI fallback; feedback validation; stale version; inactive read-only. |
| Evaluation Area and Performance Evaluation | Separate student self-assessment and evaluator-performance cards; focused evaluator editor. | View assessment; save/submit own performance evaluation. | Assessment absent/draft privacy; evaluator draft/submitted; assignment denied. |

## Admin monitoring

| Screen | Visual composition and purpose | Main actions | Required states/flow |
| --- | --- | --- | --- |
| Monitoring | Program/term filter bar, authorized scoped metric panels, textual/chart summaries, deadline/activity panels, and explicit read-only notice. Use metric styling only for current source data, never marketing/social-proof figures. | Change scope/filter; drill through. | No data; loading/error; read-only drill-through to operational detail. |

## Flow safeguards

### Discover, save, and apply

1. Student searches/filter/sorts Open opportunities and opens Posting Detail.
2. Detail exposes deterministic Match Score and optional AI explanation as advisory context; neither affects eligibility or action availability.
3. Save is available only for an Open posting. Apply opens the complete application form with required cover note and CV validation.
4. Successful submit opens Application Detail with `Submitted` history. The tracker reflects server lifecycle state; the Student cannot move cards between lanes.

### Posting, placement, and reporting

1. Company Staff/Admin saves a Draft, validates publishing fields, and publishes only a valid posting.
2. Staff/Admin processes applications through permitted human decisions. Acceptance collects supervisor/start/end dates, retains history, creates one placement, and notifies the Student.
3. Supervisor/Admin creates Active-placement tasks; Student updates only their own task state. Student saves/submits reports; reviewers approve or request revision with required feedback.
4. Student self-assessment and Supervisor/Admin performance evaluation remain distinct authored records and are never rendered as a combined grade.

## Exclusions

The visual reference does not add CV generators, ATS scores, public career/resources/event surfaces, mock interviews, AI screening, AI-driven decisions, or external email/SMS/push delivery. Every screen retains the requirements' authorization, lifecycle, audit-history, file, validation, and advisory-AI safeguards.

## Detailed acceptance constraints

- Required text fields reject whitespace-only values and associate errors with their controls. Long forms summarize missing requirements and preserve recoverable drafts; confirmations name irreversible outcomes.
- Application acceptance exposes a labelled searchable supervisor selector plus start/end dates. Assignment replacement/revocation names outgoing/incoming supervisor and requires a retained reason; raw user IDs are never selection labels.
- Report due dates show recorded timezone. Private revision drafts explicitly state that only the author can see them; submitted history remains distinct. Stale review conflicts retain feedback but require a refreshed-version review before another decision.
- File rows show name, type, size, transfer state, and permitted actions. Required CV versus optional attachment status is explicit, and file controls disclose supported types and 10 MiB limit.
- Progress bars, kanban lanes, charts, and status colors expose equivalent text. Match Score panels show score, matched/missing skills, calculation context, and the advisory disclaimer; they never use traffic-light eligibility labels.
- Role switching, notification opening, submit success/failure, and read-state changes announce outcome without stealing focus. Direct links preserve access checks and filters/drafts survive recoverable transitions where applicable.
