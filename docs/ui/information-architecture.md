# InternHub Information Architecture

## Purpose and visual reference

This architecture describes InternHub after authentication. It preserves the product scope in [`docs/requirements/requirements.md`](../requirements/requirements.md): records and actions are visible only when the active role and record relationship permit them.

The InternHub Stitch project is the visual reference for the authenticated experience: a fixed translucent header, wide search-led discovery, high-context detail surfaces, structured talent presentation, and an application tracker. Its public-content, CV/ATS, mock-interview, and sample marketing features are not part of this architecture.

## Authenticated application shell

All product screens share one fixed, translucent 80px top header.

- **Header:** InternHub home link, role-aware primary navigation, notification bell/unread count, active role/account menu, and one contextual primary action where useful. The desktop header may use a compact segmented navigation group; tablet/mobile expose a labelled menu drawer.
- **Role switch:** a multi-role user changes active role from the account menu. The shell calls `PUT /api/v1/me/active-role`; on success it replaces the token, clears role-scoped data, cancels prior requests, refreshes navigation, and opens the new landing page. Failure retains the current shell or starts session recovery. Navigation alone never changes authorization.
- **Content:** offset below the header and constrained to a 1280px maximum. Use a twelve-column desktop grid, an eight-column tablet grid, and a single mobile column. Page headers contain breadcrumb, `h1`, concise context, then local filters/action.
- **Record context:** detail screens use a record hero followed by an 8/4 desktop reading/context split. Context panels move below the primary content on smaller viewports.
- **Notifications:** the bell opens recent role-authorized notifications; the full inbox supports read state and deep-links only to authorized records.

The shell is not a permission boundary. Direct links and refreshes check access; absent access renders the standard Access Denied page without protected identifiers or summaries.

## Primary navigation by active role

| Active role | Landing page | Header navigation | Notes |
| --- | --- | --- | --- |
| Student | Discover | Discover, Saved, Applications, Placement, Reports, Evaluation, Profile | Placement, reports, and evaluation may show an informative empty state until a placement exists. |
| Company Staff | Postings | Company, Postings, Applications, Placements | Records remain limited to the staff member's company; placement progress is read-only unless also acting as Supervisor/Admin. |
| Supervisor | Assigned Placements | Assigned Placements, Reports, Evaluations | Lists include only explicitly assigned placements. |
| Admin | Monitoring | Monitoring, Companies, Postings, Applications, Placements, Evaluations | Monitoring is read-only; administration occurs in operational record detail. |

The account menu and notification inbox are shared utilities, not role-navigation duplicates. Contextual tabs appear inside records and do not change access rules.

## Content hierarchy and record structure

### Opportunity and application area

```text
Discover (Student)
├── Search-led results
├── Saved opportunities
└── Posting detail
    ├── Match score and skill breakdown
    ├── Optional AI explanation
    └── Apply
        └── Application detail
            └── immutable status history / permitted withdrawal

Applications (Student)
├── Status kanban (default desktop view; non-draggable)
├── Accessible list/table alternative
└── Application detail
```

Only Open, non-expired postings appear in normal Student discovery and accept applications. Authorized viewers may open unavailable postings from related records or management views; the record explains why Save/Apply is unavailable.

The tracker lanes map source lifecycle state without inventing new states: **Submitted**, **Under Review**, **Interview**, **Accepted**, and **Closed** (Rejected or Withdrawn). Cards navigate to detail and never offer drag-and-drop status updates. On narrow screens, cards stack by lane; the accessible list/table alternative remains available.

### Placement and progress area

```text
Placement list
└── Placement overview
    ├── Context: student, posting, company, supervisor, dates, lifecycle
    ├── Tasks
    ├── Reports
    └── Evaluations
        ├── Student self-assessment
        └── Supervisor/Admin performance evaluation
```

Placement overview is the common contextual parent. Its tabs/actions vary by role. Completed and Terminated placements retain readable history but remove Active-only controls.

### Administration and cross-cutting area

```text
Monitoring (Admin, read-only)
├── program/term selector
├── aggregate counts and outcomes
├── placement, task, and report progress
├── deadlines and recent activity
└── authorized detail drill-through

Notifications (all roles)
├── recent header panel
└── full inbox
    └── authorized record deep link
```

## Screen composition rules

| Area | Composition |
| --- | --- |
| Discover | Search-led header with keyword/category/location controls; compact active filters and sort; results with consistent company identity, role, metadata, skill tags, advisory Match Score, and clear detail action. Data-backed scoped metrics may follow search; never add marketing claims. |
| Posting detail | Company/opportunity hero with status, deadline, identity, key metadata, Save/share controls where permitted, and Apply that opens the validated application form. Desktop body uses 8/4 content/context columns; the contextual panel holds action availability and related company/opportunity information. |
| Student profile | Talent-showcase hierarchy using existing profile data only: identity/education hero, skills/preferences, reusable documents, and editable sections. Do not introduce public portfolio publishing or new profile fields without requirements. |
| Applications | High-context tracker header with search/filter and a kanban/list view switch. Board lanes are display/navigation only; card status labels, submitted time, company identity, and valid related links are textually available in both views. |
| Operational lists | Compact page header, filters, result count, then dense table or role-appropriate cards. Tables retain an identity column and bounded horizontal scroll only when necessary. |
| Record/placement detail | Context hero, lifecycle label, primary reading content, contextual 8/4 panel, and semantic tabs for tasks/reports/evaluations/history. |
| Monitoring | Scoped filters, data-backed metric panels, progress summaries, deadline/activity panels, and explicit read-only notice. Drill-through goes to operational record detail. |

## Detail-page subnavigation

| Record | Always-visible context | Subsections | Action ownership |
| --- | --- | --- | --- |
| Posting | Company, title, status, deadline, openings | Overview, Requirements, Applicants (management roles) | Company Staff for own company; Admin for any company. |
| Application | Student/posting identity, status, submitted time | Application, Documents, Status history, Placement link once accepted | Student views own and may withdraw when eligible; authorized staff/Admin process. |
| Placement | Student, posting, company, supervisor, dates, lifecycle | Overview, Tasks, Reports, Evaluations | Access/actions depend on relationship and active role. |
| Report | Placement, reporting week, latest state/version | Content, Attachments, Version and review history | Student drafts/submits/revises; assigned Supervisor/Admin reviews. |
| Evaluation | Placement and authoring role | Student self-assessment, Supervisor/Admin evaluation | Forms remain separate; never merge ratings into a grade. |

Status and history are context, not editable labels. A status transition opens a confirmation that identifies permitted target state, required feedback/note, and resulting consequence.

## Access, availability, and lifecycle behavior

- Hide ordinary unavailable actions/navigation, but protect direct URLs. Access Denied provides a safe return to the role landing page and never reveals the protected record.
- Unavailable postings display Draft, Closed, Archived, or Expired. Authorized historical viewers retain readable data; Student Apply and new Save are absent or explained as unavailable.
- Inactive placements display Completed or Terminated. History remains readable; creation, status updates, drafts, submissions, and other Active-only actions are unavailable with concise reason.
- Accepted, Rejected, and Withdrawn applications are terminal. A placement link appears only for Accepted applications.
- Empty states distinguish no data, filtered/no-search results, and lack of access; offer the next permitted action when one exists.

## Scope safeguards

No visual reference pattern introduces CV generation, ATS scores, mock interviews, public career/resources/events areas, external notification delivery, or AI-driven selection/decision controls. The architecture retains the existing requirements for profile, postings, applications, placement lifecycle, tasks, reports, separate assessments, monitoring, notifications, and optional advisory AI.

## Retained behavioral contracts

- **Profiles and files:** Student profile retains identity/education, skills with stable IDs and optional proficiency, preferences, and reusable documents. Upload controls disclose PDF/JPEG/PNG/DOCX support and 10 MiB limit; authenticated download uses the API content URL and recoverable transfer failures preserve form state.
- **Scoring and applications:** Match Score remains deterministic 0–100, with required skills weighted 2 and optional skills weighted 1 through presence matching only. Empty skill sets state that no skills were specified rather than judging suitability. One application per posting is enforced; a withdrawn application is retained and cannot be recreated.
- **Processing and assignment:** Application review permits only valid state transitions. Acceptance requires eligible supervisor selection plus start/end dates, atomically creates one placement/reporting periods, and handles identical retry by showing the existing placement. Admin supervisor replacement/revocation retains reason and expected-assignment conflict handling.
- **Tasks and reports:** Supervisors/Admins create tasks; only the placement Student changes task state. Report calendars include weeks without reports and recorded due timezone. Drafts are private until submitted; revision requests require feedback; submitted versions/reviews remain linked by report version. A stale review refreshes history while retaining entered feedback for reconsideration.
- **Assessments and lifecycle:** Student self-assessment and Supervisor/Admin evaluation remain separate. Completed/Terminated placement history remains readable but Active-only actions disappear. Status decisions identify actor, time, old/new state, and retained note.
- **Advisory AI and monitoring:** AI explanation/summary is on demand, source-versioned, and failure-safe; original source content and human controls stay usable. Monitoring remains read-only, uses the same reporting deadlines/timezones, and drills through only to authorized operational detail.

## Requirement coverage map

| Requirement | Primary surfaces |
| --- | --- |
| RQ-01 Role and record ownership | Role-aware header, direct-access checks, Access Denied, record-specific action visibility. |
| RQ-02 Student profile and preferences | Student Profile, Skills & Preferences, Documents. |
| RQ-03 Company and postings | Company Profile, Posting List/Editor/Detail. |
| RQ-04–06 Discovery, Match Score, saved opportunities | Discover, Posting Detail, Saved Opportunities. |
| RQ-07–08 Applications, processing, placement creation | Tracker/list, Application Detail/Review, acceptance confirmation, Placement Overview. |
| RQ-09–10 Placement lifecycle and tasks | Placement Overview, Task Board/Editor. |
| RQ-11 Weekly reports | Reports calendar, Report Editor/Detail, Review Detail/version history. |
| RQ-12–13 Separate assessments | Student Evaluation Area, Performance Evaluation Area/Editor. |
| RQ-14 Monitoring | Read-only Monitoring dashboard and authorized drill-through. |
| RQ-15 Notifications | Header notification panel, inbox, authorized deep links. |
| RQ-16 Optional AI assistance | On-demand Match Score explanation and Report Summary panels. |
