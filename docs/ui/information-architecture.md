# InternHub Information Architecture

## Purpose and scope

This information architecture describes InternHub after authentication. It is derived from the functional requirements in [`docs/requirements/requirements.md`](../requirements/requirements.md); a user sees only records and actions allowed by both their active role and their relationship to the record.

Sign-in and account creation are outside scope. A user with more than one role selects an **active role** from the account menu; the shell first calls `PUT /api/v1/me/active-role`. On success it replaces the token, clears role-scoped data, cancels prior requests, refreshes navigation, and returns to that role's landing page. Failure retains the old shell or triggers session recovery; changing navigation alone never changes authorization.

The current React prototype provides useful patterns to retain: cards, filter controls, status badges, detail sidebars, timelines, and readable two-column desktop layouts. Apply the warm editorial visual direction: paper main surfaces, cream navigation, white raised content, moss primary actions, warm borders, and restrained elevation. Its single mixed-role sidebar, simulated AI interviews, interview scores, and any AI-driven decision presentation are not part of this architecture.

## Authenticated application shell

All product screens use one shell.

- **Header:** InternHub home link, page context/breadcrumbs where useful, notification bell with unread count, and account menu with active role and role switcher.
- **Primary navigation:** role-aware, 232px persistent cream left sidebar with a subtle right border on desktop; compact trigger and drawer on smaller viewports. It contains only areas useful to the active role. Active items use a white bordered surface with moss text/icon; inactive items use muted ink.
- **Content header:** a Fraunces page title, short context, filters or period selector when relevant, and the page's moss primary action. Record pages use a breadcrumb and record status.
- **Content area:** responsive, scrollable paper content with a ~1180px maximum, 40–48px desktop horizontal padding, and 32–40px desktop top padding. Raised cards/panels are white with warm borders. Index/list pages use filter-and-list or table layouts; record pages use a main column plus contextual side panel at desktop widths.
- **Notifications:** the bell opens a short recent-notifications panel; a link opens the full notification inbox. Notifications deep-link to an authorized record and mark themselves read on open or explicit action.

The shell is not a permission boundary by itself. Direct links and refreshed pages must also check access. If access is absent, show the standard access-denied page without revealing protected data.

## Primary navigation by active role

| Active role | Landing page | Primary navigation | Notes |
| --- | --- | --- | --- |
| Student | Discover | Discover, Saved, Applications, Placement, Reports, Evaluation, Profile | Placement, reports, and evaluation may show an informative empty state until a placement exists. |
| Company Staff | Postings | Company, Postings, Applications, Placements | All records are limited to the staff member's company. Placement content is read-only except when the user is also acting as Supervisor or Admin. |
| Supervisor | Assigned Placements | Assigned Placements, Reports, Evaluations | Lists include only explicitly assigned placements. |
| Admin | Monitoring | Monitoring, Companies, Postings, Applications, Placements, Evaluations | Admin may enter operational detail to administer a record; Monitoring itself is read-only. |

The account menu and full notification inbox are shared utilities, not duplicated navigation entries. A record reached through a notification, search result, or contextual link opens in the same detail view used from lists.

## Content hierarchy and record structure

### Opportunity and application area

```text
Discover (Student)
├── Results
├── Saved opportunities
└── Posting detail
    ├── Match score and skill breakdown
    ├── Optional AI explanation
    └── Apply
        └── Application detail
            └── immutable status history / permitted withdrawal

Postings (Company Staff, Admin)
├── Posting list
├── Posting editor
└── Posting detail
    ├── lifecycle controls
    └── Applicants
        └── Application review / status history
```

Only Open, non-expired postings appear in normal Student discovery and accept applications. An authorized user may still open a Draft, Closed, Archived, or expired posting from a related record, saved list, or management view; its unavailable state explains why new saving or application is suppressed.

### Placement and progress area

```text
Placement list
└── Placement overview
    ├── Context: student, posting, company, supervisor, dates, lifecycle
    ├── Tasks
    │   ├── supervisor/admin task creation
    │   └── student task-status updates
    ├── Reports
    │   ├── student report editor and history
    │   └── reviewer report detail and decision
    └── Evaluations
        ├── student self-assessment
        └── supervisor/admin performance evaluation
```

Placement overview is the common contextual parent. Its available tabs and actions vary by active role. A Completed or Terminated placement preserves its history but removes create, submit, and status-changing actions that require an Active placement.

### Administration and cross-cutting area

```text
Monitoring (Admin, read-only)
├── program/term selector
├── aggregate counts and outcomes
├── placement, task, and report progress
├── deadlines and recent activity
└── authorized detail drill-through

Notifications (all roles)
├── recent-notifications panel
└── full inbox
    └── authorized record deep link
```

Drill-through from monitoring opens an operational detail page only when the admin chooses to administer that record; no create, edit, transition, or lifecycle action appears on the monitoring dashboard.

## Detail-page subnavigation

| Record | Always-visible context | Subsections | Action ownership |
| --- | --- | --- | --- |
| Posting | company, title, status, deadline, openings | Overview, Requirements, Applicants (management roles) | Company Staff for own company; Admin for any company. |
| Application | student/posting identity, current status, submitted time | Application, Documents, Status history, Placement link once accepted | Student views own and may withdraw when eligible; authorized staff/Admin process. |
| Placement | student, posting, company, supervisor, dates, lifecycle | Overview, Tasks, Reports, Evaluations | Access and actions depend on relationship and active role. |
| Report | placement, reporting week, latest state/version | Content, Attachments, Version and review history | Student drafts/submits/revises; assigned Supervisor/Admin reviews. |
| Evaluation | placement and authoring role | Student self-assessment, Supervisor/Admin evaluation | Each form is separate; never merge ratings into a grade. |

Status and history are context, not editable labels. A status transition opens a confirmation/dialogue that shows the permitted target state, required note/feedback conditions, and the resulting notification/placement consequence where applicable.

## Access, availability, and lifecycle behavior

- **Role plus relationship:** hide ordinary navigation/actions that cannot be used, but protect direct URLs as well. The access-denied page provides a safe return to the active-role landing page and does not name or summarize the protected record.
- **Unavailable posting:** display an explicit state such as `Closed`, `Archived`, `Draft`, or `Expired`. Authorized historical viewers retain details and related application access; Student `Apply` and new `Save` controls are absent or disabled with an explanation.
- **Inactive placement:** display `Completed` or `Terminated` in the placement header. History remains readable to authorized users; task creation, student task updates, report drafts/submissions, and other Active-only actions are unavailable with a concise explanation.
- **Terminal application:** `Accepted`, `Rejected`, and `Withdrawn` have no transition controls. A placement link appears only for Accepted applications.
- **Empty collections:** distinguish “nothing yet” from filtered/no-search results and lack of access. Empty states name the next permitted action where one exists.

## Requirement coverage map

| Requirement | Primary screen or flow |
| --- | --- |
| RQ-01 Role and record ownership | Role-aware shell, permission checks, access-denied state, record-specific action visibility. |
| RQ-02 Student profile and preferences | Student Profile: identity/education, Skills & Preferences, Documents. |
| RQ-03 Company and postings | Company Profile, Posting List, Posting Editor, Posting Detail/lifecycle controls. |
| RQ-04 Discovery | Discover Results and Posting Detail. |
| RQ-05 Match Score | Posting Detail score breakdown; Discover sort by Match Score; optional explanation panel. |
| RQ-06 Saved opportunities | Save control on eligible Posting Detail and Saved Opportunities list. |
| RQ-07 Applications | Apply flow, Student Application List, Application Detail/history. |
| RQ-08 Processing and placement creation | Applicant List, Application Review/status-transition dialogue, resulting Placement Overview. |
| RQ-09 Placement lifecycle | Placement List/Overview and Supervisor/Admin lifecycle action. |
| RQ-10 Tasks | Placement Tasks tab, Task Creation dialogue, Student task-status control. |
| RQ-11 Weekly reports | Reports List, Student Report Editor, Report Detail/review, version history. |
| RQ-12 Self-assessment | Student Evaluation area and Self-assessment Editor/detail. |
| RQ-13 Performance evaluation | Supervisor/Admin Evaluation area and Performance Evaluation Editor/detail. |
| RQ-14 Monitoring | Admin Monitoring dashboard with read-only drill-through. |
| RQ-15 Notifications | Header notification panel, Notification Inbox, authorized deep links. |
| RQ-16 Optional AI assistance | On-demand Match Score explanation and Report Summary panels, including unavailable/error fallback. |

## Assignment and reporting navigation

Application Review includes the eligible-supervisor/date acceptance form. Admin Placement Overview includes an Assignment History/Change action; it is outside read-only Monitoring and absent for Company Staff/Supervisors. Report creation starts from the placement reporting calendar, including weeks without reports. Deadline deep links carry reportingPeriodId to select the correct week. These flows use the contracts and privacy rules in [behavior rules](../design/behavior-rules.md).
