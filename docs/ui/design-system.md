# InternHub Design System

## Design principles

InternHub should feel calm, practical, and auditable. The visual system favors legible operational information over decoration.

- Make the next permitted action obvious, without implying an action is permitted when role, relationship, or lifecycle forbids it.
- Show source records, immutable history, and human decisions plainly. Generated AI text is always optional, labelled, and visually secondary.
- Use Match Scores to help a student understand skill alignment, never as pass/fail, eligibility, ranking by worth, or a hiring signal.
- Keep related data together: a record’s identity and current state stay visible while users work in its detail sections.

## Layout and responsive behavior

| Area | Desktop (>= 1024px) | Tablet (768–1023px) | Mobile (< 768px) |
| --- | --- | --- | --- |
| Shell | 224–256px persistent sidebar; header and scrollable content pane. | Collapsible sidebar/drawer; content stays full width. | Header plus menu drawer; no persistent sidebar. |
| Page content | 32px page gutters; max-widths for reading/forms; two-column record pages when useful. | 24px gutters; two columns only if each remains usable. | 16px gutters; one content column. |
| Detail pages | Main content plus 280–360px contextual side panel. | Side panel moves below or becomes summary drawer. | Context summary precedes content; actions remain reachable. |
| Lists/tables | Full table with filters in header. | Hide/deprioritize lower-value columns. | Use cards for simple lists; otherwise horizontally scrollable table with first identity column retained. |
| Forms and actions | Two columns only for short, related fields; primary action aligned to page flow. | Collapse dense sections as needed. | One field per row; full-width primary action; minimum 44px touch targets. |

Avoid horizontal page overflow at 320 CSS pixels and support browser zoom/reflow to 400%. Do not rely on hover for essential content or actions.

## Foundations

### Typography

- Use the prototype’s friendly sans-serif heading face (currently DM Sans) with a highly legible sans-serif body face; use system fallbacks.
- Use sentence case for headings, labels, buttons, and status explanations. Avoid all-caps except short table headers where tracking and contrast remain readable.
- Type scale: page title 24–28px/32–36px bold; section title 18–20px/26–28px semibold; card/table title 14–16px/20–24px semibold; body 14–16px/20–24px; metadata/help text 12–14px/16–20px.
- Establish one page `h1`; section headings follow semantic order. Never use font size or color alone to create document structure.

### Spacing, shape, and elevation

- Base spacing unit: 4px. Common spacing: 8px between compact controls, 12px within rows, 16px card padding on small screens, 20–24px card padding on desktop, 24–32px between page sections.
- Use 8px radii for controls and 12px radii for cards/dialogues. Keep all controls in a component family at the same radius.
- Default surfaces are white on a very light cool-neutral canvas. Use a 1px neutral border for grouping; reserve subtle shadow for raised menus, dialogs, and the active overlay—not every card.
- Keep content line length near 65–75 characters for long narrative fields such as reports and feedback.

### Color and semantic meaning

| Token | Intended use | Rule |
| --- | --- | --- |
| Neutral | Canvas, surfaces, borders, primary text, metadata. | Text and borders must meet contrast requirements against their surfaces. |
| Blue / primary | Main call to action, selected navigation, focus indicators, informational emphasis. | One primary action per local task area. |
| Green / success | Completed, approved, submitted-success feedback. | Pair with icon/text such as “Approved”; never use color alone. |
| Amber / warning | Revision requested, deadline approaching, pending attention. | Provide precise state wording and date/context. |
| Red / danger | Validation errors, destructive actions, rejection/termination confirmation. | Red status does not substitute for a reason or audit note. |
| Violet / advisory AI | Generated-assistance container/icon only. | Never use it for match eligibility, applications, performance ratings, or outcomes. |

Use text and icon/label redundantly. Maintain at least WCAG AA contrast (4.5:1 for normal text, 3:1 for large text and non-text UI indicators); do not put essential text over gradients.

## Component rules

| Component | Rules |
| --- | --- |
| App shell and navigation | Display active role near the account menu. Show only role-permitted destinations. Use an icon plus text label; selected state needs more than color, such as a filled surface and clear text weight. |
| Page header | Contains page title, concise context, relevant scope/filter controls, and at most one visually primary action. On record pages, show breadcrumb, identity, and lifecycle status. |
| Button | Variants: primary, secondary, tertiary/ghost, destructive. Labels start with a verb: “Publish posting”, “Submit report”, “Request revision”. Disable only with a nearby reason when the user could otherwise act. |
| Forms | Place labels above controls; mark required fields with text and an asterisk; use inline help before errors and specific error text after validation. Preserve values after recoverable failures. Group related fields with headings. |
| Filters and search | Keep keyword search visible above results. Show active filters as removable chips or clearly selected controls, include “Clear filters”, and state result count. Preserve filter state on return from detail. |
| Cards and lists | Use cards for discoverable opportunities, summaries, and narrow mobile lists. Use tables for multi-record administrative comparison. Cards expose one primary next action and concise metadata. |
| Status chips | Use a consistent label, icon/shape cue, and semantic color. Posting: Draft, Open, Closed, Archived, Expired. Application: Submitted, Under Review, Interview, Accepted, Rejected, Withdrawn. Placement: Active, Completed, Terminated. Report: Draft, Submitted, Revision Requested, Approved. Task: To Do, In Progress, Done, plus separate Overdue. |
| Timeline/history | Render events chronologically with old/new status where applicable, actor, timestamp, and note/feedback. Do not offer edit/delete controls for retained history. |
| Score breakdown | Show integer score, calculation context, matched skills, and missing skills. Head it “Match score” with “Advisory—does not affect eligibility or decisions.” Do not use traffic-light labels, gates, pass marks, or employer-facing candidate ranking. |
| Advisory-AI panel | Use a visibly distinct but restrained panel titled “Generated assistance”. Include source attribution (“Based on this score breakdown” or “Based on this submitted report”), request/refresh state, and a disclaimer that it does not change source data or decisions. Keep original source content adjacent and accessible. |
| File row | Show file name, type, size, upload/update state, and permitted actions. Required CV is labelled required in the application form; optional attachments remain optional. |
| Dialogues/drawers | Trap focus while open, provide an explicit close/cancel action, return focus to the invoking control, and use a native/accessible modal pattern. Confirmation copy names irreversible results. |
| Empty, error, and loading states | Explain what is absent or failed, distinguish no data from no search matches, and offer the next permitted action. Skeletons should preserve final layout; errors should offer retry without losing filters/draft entries. |

## Workflow-specific consistency

### Permission and lifecycle

- Permission determines whether an action is rendered, but the interface must still respond safely to direct access attempts with Access Denied.
- Display readable historical records to authorized users even after closing, expiration, archival, completion, or termination. Replace unavailable actions with a short reason when the context benefits from it.
- Keep action ownership explicit: supervisors/Admins create tasks; only the placement Student changes task status; Company Staff read placement progress but do not receive task/review controls unless actively acting as an assigned Supervisor or Admin.

### Forms, validation, and irreversible work

- Validate publish and submit requirements before the final action, and summarize missing fields at the top for long forms while preserving field-level messages.
- Use `Save draft` for reports and assessments. Clearly label report drafts “Private until submitted.”
- `Request revision` requires feedback before confirmation. `Accept`, `Reject`, `Withdraw`, `Complete`, `Terminate`, `Archive`, and `Publish` use confirmation language that describes the result.
- Prevent duplicate submission affordances during processing. On successful application submission, report submission, or status transition, show a confirmation and refreshed history rather than relying only on a toast.

### Assessments and human decisions

- Present **Student self-assessment** and **Supervisor/Admin performance evaluation** in separate cards, views, forms, and history areas. Identify the authoring role and submission state.
- Never average, combine, color-code into a grade, or describe either assessment as an official academic grade.
- AI panels are not allowed in task assignment, application status change, performance rating, completion decision, or assessment decision controls.

## Accessibility requirements

- Use semantic landmarks for header, navigation, main content, complementary details, dialogs, tables, and forms. Use real buttons for actions and real links for navigation.
- All functions are keyboard operable. Provide a visible high-contrast focus indicator, logical tab order, skip-to-main-content link, and keyboard-operable menus, chips, drawers, and dialogs.
- Associate every form control with a programmatic label. Associate errors and help text using appropriate descriptions; announce submit success/error and notification-read updates through an accessible live region without stealing focus.
- Use descriptive names for icon-only controls (for example, “Open notifications” and “Remove saved opportunity”). Do not encode a status, deadline risk, or required state by color alone.
- Ensure attached files, timeline events, charts, and progress bars have text equivalents. Charts on Monitoring require a tabular or textual summary.
- Respect reduced-motion preferences; avoid auto-playing motion. Avoid using animation to communicate time-critical state.

## Prototype alignment and exclusions

Retain the prototype’s restrained blue-on-neutral visual language, filter bar, opportunity cards, skill tags, progress bars with text values, status badges, audit-like timelines, and desktop main-content/sidebar composition. Normalize them under the rules above so they work across all roles and small screens.

Do not document or design simulated interviews, interview retakes/results, AI screening, AI applicant scoring, AI-selected task/status/evaluation outcomes, or external email/SMS/push delivery. They are outside the current requirements.

## Corrected workflow interaction rules

Required text fields reject whitespace-only values and associate errors with the input. Acceptance uses a labelled searchable supervisor selector plus start/end date fields; assignment replacement/revocation confirms the outgoing/incoming supervisor and required reason. Do not present raw user IDs as the selection label.

Display due dates with their recorded timezone and show version numbers beside report feedback and generated summaries. Private revision drafts have an explicit “Only you can see this draft” label; prior submitted history remains visually separate. Stale-version conflicts retain feedback but require reviewing the refreshed version before a new decision. Role switching exposes pending/error states and does not display the destination role's data before server confirmation.

An empty skill set uses a neutral no-skills explanation rather than a negative suitability judgment. File controls disclose the supported PDF/JPEG/PNG/DOCX types and 10 MiB limit and preserve form input across transfer errors. [Behavior rules](../design/behavior-rules.md) define the source policies; UI styling never substitutes for authorization.
