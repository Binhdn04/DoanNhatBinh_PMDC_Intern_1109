# InternHub Design System

## Design principles

InternHub should feel like a warm editorial SaaS product: professional, calm, human, refined, and information-dense without becoming crowded. The visual system favors legible operational information, clear alignment, and deliberate hierarchy over decoration.

- Make the next permitted action obvious, without implying an action is permitted when role, relationship, or lifecycle forbids it.
- Show source records, immutable history, and human decisions plainly. Generated AI text is always optional, labelled, and visually secondary.
- Use Match Scores to help a student understand skill alignment, never as pass/fail, eligibility, ranking by worth, or a hiring signal.
- Keep related data together: a record’s identity and current state stay visible while users work in its detail sections.
- Avoid generic AI-dashboard styling: no excessive gradients, glassmorphism, oversized rounded cards, normal-action pills, strong shadows, neon colors, or oversized whitespace.

## Layout and responsive behavior

| Area | Desktop (>= 1024px) | Tablet (768–1023px) | Mobile (< 768px) |
| --- | --- | --- | --- |
| Shell | 232px persistent cream sidebar with a subtle right border; paper main pane and scrollable content. | Collapsible sidebar/drawer; content stays full width. | Header plus menu drawer; no persistent sidebar. |
| Page content | Paper canvas; 40–48px horizontal gutters, 32–40px top padding, and a ~1180px content maximum. Use two-column record pages when useful. | 24px gutters; two columns only if each remains usable. | 16px gutters; one content column. |
| Detail pages | Main content plus 280–360px contextual side panel. | Side panel moves below or becomes summary drawer. | Context summary precedes content; actions remain reachable. |
| Lists/tables | Full table with filters in header. | Hide/deprioritize lower-value columns. | Use cards for simple lists; otherwise horizontally scrollable table with first identity column retained. |
| Forms and actions | Two columns only for short, related fields; primary action aligned to page flow. | Collapse dense sections as needed. | One field per row; full-width primary action; minimum 44px touch targets. |

Avoid horizontal page overflow at 320 CSS pixels and support browser zoom/reflow to 400%. Do not rely on hover for essential content or actions.

## Foundations

### Typography

- Use `Inter` for body copy, navigation, labels, forms, buttons, and metadata. Use `Fraunces` for page titles, important entity titles, branding, and selected editorial emphasis; provide sensible system fallbacks.
- Use sentence case for headings, labels, buttons, and status explanations. Avoid all-caps except short table headers where tracking and contrast remain readable.
- Type scale: page title is Fraunces 30px/36px, 600; section title is Fraunces or Inter 20–24px, 600; card/entity title is Fraunces 16–18px, 600; body is Inter 14–15px, 400–500; metadata is Inter 12–13.5px; small labels are Inter 10.5–12px, 600.
- Establish one page `h1`; section headings follow semantic order. Never use font size or color alone to create document structure.

### Spacing, shape, and elevation

- Use a consistent 4 / 6 / 8 / 10 / 12 / 14 / 16 / 18 / 20 / 24 / 32 / 40 / 48px rhythm. Typical gaps are 8–10px for controls, 6–12px for related content, 12px between cards, 20–32px between sections, and 32–48px at page level. Cards use 18–20px padding.
- Use 7–8px radii for controls and navigation items, 7px for tags, and 10–12px for cards, panels, and dialogues. Avatars are circular. Reserve `999px` radii for semantic status badges only.
- Default surfaces are `--paper` with white raised content. Group content with `1px solid var(--line)`; cards and panels have little or no shadow. Use subtle elevation only for menus, dialogs, and overlays.
- Keep content line length near 65–75 characters for long narrative fields such as reports and feedback.

### Interaction

- Use subtle 150–200ms background, border, or color transitions for interactive elements. Do not use exaggerated transforms, bouncing, or scaling cards.
- Hover improves affordance but never reveals essential content or actions. Focus states remain clearly visible, including the moss input/control focus ring.

### Color and semantic meaning

```css
--paper: #FBF8F0;
--paper-raised: #FFFFFF;
--cream: #F3EEDF;
--line: #E7E0CC;

--ink: #26231A;
--ink-soft: #837C68;

--moss: #3F7D58;
--moss-hover: #356B4A;
--moss-soft: #E6F0E8;

--marigold: #E8A33D;
--marigold-soft: #FBF0DC;

--coral: #D96248;
--coral-soft: #FBEAE3;
```

| Token family | Intended use | Rule |
| --- | --- | --- |
| Paper, cream, line, ink | `--paper` is the canvas, `--paper-raised` is a raised surface, `--cream` supports the sidebar and quiet tags, `--line` groups content, and ink tokens establish text hierarchy. | Reuse these tokens instead of introducing arbitrary neutrals. |
| Moss | Primary calls to action, selected navigation, focus indicators, and positive states. | Use `--moss` with white text and `--moss-hover` on hover. One primary action per local task area. |
| Marigold | Deadline, warning, revision, or pending-attention states. | Use only with precise wording and date/context; prefer `--marigold-soft` for badges and panels. |
| Coral | Validation errors, destructive actions, rejection/termination, and urgent states. | Use only with a reason or audit note where applicable; prefer `--coral-soft` for badges and panels. |

Use text and icon/label redundantly. Maintain at least WCAG AA contrast (4.5:1 for normal text, 3:1 for large text and non-text UI indicators); do not put essential text over gradients. Avoid gradients, neon colors, glassmorphism, and non-semantic color accents.

## Component rules

| Component | Rules |
| --- | --- |
| App shell and navigation | The desktop sidebar is cream with a subtle right border and compact 8px-radius items. Display active role near the account menu and only role-permitted destinations. Use one outline icon family (14–18px, ~1.8px stroke, `currentColor`) plus text labels. Inactive items use muted ink; hover darkens cream slightly; active items use a white surface, subtle border, moss icon/text, and semibold label. |
| Page header | Contains a Fraunces page title, concise context, relevant scope/filter controls, and at most one moss primary action. On record pages, show breadcrumb, identity, and lifecycle status. |
| Button | Primary buttons use moss, white text, 7–8px radius, and medium/semibold labels; hover uses darker moss. Secondary buttons use white or transparent surfaces, a subtle line border, and ink/soft-ink text. Keep heights and padding consistent; labels start with a verb. Destructive/warning colors are never normal actions. Disable only with a nearby reason when the user could otherwise act. |
| Forms | Place labels above 40px white controls with a subtle line border, 7–8px radius, and 14px Inter text. Mark required fields with text and an asterisk; use inline help before errors and specific error text after validation. Moss border/ring focus is visible and accessible. Preserve values after recoverable failures. Group related fields with headings. |
| Filters and search | Keep keyword search visible above results. Filters remain compact and do not dominate the page. Show active filters as removable compact tags or clearly selected controls, include “Clear filters”, and state result count. Preserve filter state on return from detail. |
| Cards and lists | Use white, 1px warm-bordered, 10–12px-radius cards with 18–20px padding and little or no shadow. Cards are structured information containers, not decorative floating blocks; avoid nested cards unless hierarchy requires them. Use tables for multi-record administrative comparison and cards for discoverable opportunities, summaries, and narrow mobile lists. |
| Tags and status badges | Skill/category tags use a cream surface, muted ink, compact padding, and 7px radius. Status badges may use low-saturation moss-soft (positive), marigold-soft (attention), or coral-soft (urgent/error) backgrounds, always with label and icon/shape cue. Posting: Draft, Open, Closed, Archived, Expired. Application: Submitted, Under Review, Interview, Accepted, Rejected, Withdrawn. Placement: Active, Completed, Terminated. Report: Draft, Submitted, Revision Requested, Approved. Task: To Do, In Progress, Done, plus separate Overdue. |
| Timeline/history | Render events chronologically with old/new status where applicable, actor, timestamp, and note/feedback. Do not offer edit/delete controls for retained history. |
| Score breakdown | Show integer score, calculation context, matched skills, and missing skills. Head it “Match score” with “Advisory—does not affect eligibility or decisions.” Do not use traffic-light labels, gates, pass marks, or employer-facing candidate ranking. |
| Advisory-AI panel | Use a restrained white or cream panel titled “Generated assistance”, differentiated through label, border, and hierarchy rather than a separate accent color. Include source attribution (“Based on this score breakdown” or “Based on this submitted report”), request/refresh state, and a disclaimer that it does not change source data or decisions. Keep original source content adjacent and accessible. |
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

Retain the prototype’s filter bar, opportunity cards, skill tags, progress bars with text values, status badges, audit-like timelines, and desktop main-content/sidebar composition. Restyle them with the warm editorial paper/cream palette, moss primary actions, Fraunces editorial hierarchy, warm borders, and restrained elevation so they work consistently across all roles and small screens.

Do not document or design simulated interviews, interview retakes/results, AI screening, AI applicant scoring, AI-selected task/status/evaluation outcomes, or external email/SMS/push delivery. They are outside the current requirements.

## Corrected workflow interaction rules

Required text fields reject whitespace-only values and associate errors with the input. Acceptance uses a labelled searchable supervisor selector plus start/end date fields; assignment replacement/revocation confirms the outgoing/incoming supervisor and required reason. Do not present raw user IDs as the selection label.

Display due dates with their recorded timezone and show version numbers beside report feedback and generated summaries. Private revision drafts have an explicit “Only you can see this draft” label; prior submitted history remains visually separate. Stale-version conflicts retain feedback but require reviewing the refreshed version before a new decision. Role switching exposes pending/error states and does not display the destination role's data before server confirmation.

An empty skill set uses a neutral no-skills explanation rather than a negative suitability judgment. File controls disclose the supported PDF/JPEG/PNG/DOCX types and 10 MiB limit and preserve form input across transfer errors. [Behavior rules](../design/behavior-rules.md) define the source policies; UI styling never substitutes for authorization.
