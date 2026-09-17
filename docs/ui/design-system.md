# InternHub Design System

## Reference and principles

This system adopts the visual language of the InternHub Stitch reference: confident indigo and slate surfaces, Plus Jakarta Sans hierarchy, Inter reading text, rounded controls, light elevation, and a translucent fixed header. It is a visual reference only. Product workflows, authorization, lifecycle rules, and human decisions remain defined by the requirements and behavior rules.

- Make the next permitted action clear without presenting an unavailable action as usable.
- Prefer structured, high-signal information over decoration. Cards group related information; they are not decorative containers.
- Show source records, retained history, and human decisions plainly. Generated assistance is optional, labelled, and secondary.
- Match Score is advisory skill alignment, never pass/fail, eligibility, candidate ranking, ATS scoring, or a hiring signal.
- Do not show invented partner claims, social-proof counts, success rates, company verification, or program metrics. Render those elements only from authorized, verifiable data.

## Foundations

### Tokens

```css
--background: #FAF8FF;
--surface: #FFFFFF;
--surface-low: #F2F3FF;
--surface-container: #EAEDFF;
--surface-high: #DAE2FD;
--outline: #C7C4D8;
--ink: #131B2E;
--ink-soft: #464555;

--primary: #4F46E5;
--primary-strong: #3525CD;
--primary-soft: #E2DFFF;
--amber: #F59E0B;
--amber-soft: #FFEDCB;
--cyan: #006693;
--cyan-soft: #C9E6FF;
--error: #BA1A1A;
--error-soft: #FFDAD6;
```

| Family | Use | Rule |
| --- | --- | --- |
| Slate surfaces | Canvas, quiet groups, filters, and lanes. | Keep the canvas light and use white for raised reading surfaces. |
| Indigo | Primary actions, selected navigation, keyboard focus, and active tabs. | Use one primary action per local task area; white text is required on solid indigo. |
| Amber | Attention, deadlines, pending/revision states, and verified data-driven emphasis. | Always pair with a label and supporting context. Never use as a routine CTA or fabricated urgency. |
| Cyan | Informational content, progress context, and neutral system emphasis. | It supplements, never replaces, textual state. |
| Error | Validation, destructive actions, rejection, and termination. | State the reason and, where retained, an audit note. |

Maintain WCAG AA contrast: 4.5:1 for normal text and 3:1 for large text and non-text indicators. Never encode state, priority, or availability with color alone.

### Typography, shape, and motion

- Use **Plus Jakarta Sans** for page titles, section titles, metrics, navigation, buttons, labels, and badges. Use **Inter** for body copy, metadata, form text, and dense tables; provide system fallbacks.
- Type scale: display 40px/48px, page title 32px/40px, section title 24px/32px, card title 18px/26px, body 14–16px/20–24px, label 12–14px/16–20px, compact label 11px/14px. Use sentence case; reserve uppercase for short labels only.
- Use a 4 / 8 / 12 / 16 / 24 / 32 / 40px spacing rhythm. Typical card padding is 24px desktop and 16px mobile; related controls use 8–16px gaps and separate page modules by 24–40px.
- Use 8px control radius, 12px standard-card radius, 16px feature-card/dialogue radius, and full radius only for compact status/filter chips, avatars, and explicitly specified primary CTA treatments.
- Cards use a 1px outline and a low, neutral shadow. Menus and dialogues may use stronger elevation. Do not use excessive glassmorphism, large shadows, hover-only content, bouncing, or motion that communicates critical state.
- Interactive transitions are limited to 150–200ms color, border, opacity, or restrained shadow changes. Respect `prefers-reduced-motion`.

## Layout and responsive behavior

| Area | Desktop (>= 1024px) | Tablet (640–1023px) | Mobile (< 640px) |
| --- | --- | --- | --- |
| Shell | Fixed 80px translucent header; 1280px content maximum; 32px gutters. | Header remains fixed; navigation collapses to compact controls/drawer; 24px gutters. | Header is compact with menu drawer; 16px gutters; no horizontal page overflow at 320px. |
| Page layout | Twelve-column grid; content/detail layouts commonly use 8/4 or 9/3 spans. | Eight-column fluid layout; side content moves below the primary reading order. | Single column; sticky task actions may stay reachable above safe-area clearance. |
| Collections | Multi-column cards and kanban lanes when each remains usable. | Reduce card columns and make wide boards scroll within their own labelled region. | Stack cards and lanes; never require horizontal scrolling for ordinary forms or actions. |
| Forms/actions | Related short fields may use two columns; action row follows the final field. | Collapse constrained field groups as needed. | One field per row, 44px minimum touch targets, and stacked full-width action controls. |

- The fixed header has a solid fallback background and enough top content offset to avoid obscuring headings or focus targets.
- Keep long narrative text around 65–75 characters per line. Standalone editors have an 800px reading-width maximum.
- Page header order is breadcrumb (when needed), `h1`, concise context, then local controls/action. Header actions wrap below the title rather than overflow.
- Use 24px between a filter/search surface and results. Tables and desktop kanban boards scroll inside their own bounded container, with an accessible alternative view.

## Component rules

| Component | Specification |
| --- | --- |
| Fixed application header | A fixed, translucent white/slate header with subtle blur, bottom border, InternHub home link, role-aware navigation, notification control, active-role/account control, and contextual primary action when applicable. It is navigation, not an authorization boundary. Desktop navigation may be a compact segmented group; tablet/mobile use a labelled drawer. |
| Role-aware navigation | Render only destinations useful to the active role. Selected items use indigo fill or an indigo-on-light selected treatment plus text; inactive items remain legible slate. Account role switching reports pending/error state and does not show destination data before server confirmation. |
| Search hub and filters | Discovery begins with a prominent keyword/category/location search surface. Result filters and sort controls are compact, keyboard-operable, show active choices and result count, and provide Clear filters. Preserve filters on return from detail. |
| Buttons and icon controls | Primary actions use solid indigo; secondary actions use outlined/quiet surfaces; destructive actions use error only. Labels begin with a verb. Icon-only controls have accessible names, 40px visual minimum and 44px mobile targets. Disable only with nearby explanation when an action is otherwise expected. |
| Cards and feature panels | White raised cards use light outline/shadow, 12–16px radius, and purposeful internal hierarchy. Feature panels may use a restrained indigo-tinted ambient background, never text over an unreadable gradient. Avoid nesting cards except to express genuine hierarchy. |
| Company identity | A company mark, name, and concise metadata establish record identity. Show verification only when verified source data is available; otherwise omit it rather than simulating a badge. |
| Metric panels | Use only authorized, scoped, current values with label, period/context, and text alternative. Monitoring metrics are read-only and do not become marketing claims. |
| Tags and statuses | Filter tags and compact metadata chips may be pill-shaped. Lifecycle labels use low-saturation primary/amber/error/cyan treatments with icon or textual cue. Status vocabulary remains: Posting Draft/Open/Closed/Archived/Expired; Application Submitted/Under Review/Interview/Accepted/Rejected/Withdrawn; Placement Active/Completed/Terminated; Report Draft/Submitted/Revision Requested/Approved; Task To Do/In Progress/Done plus separate Overdue. |
| Tabs and segmented controls | Use a quiet surface container with an obvious selected segment. Tabs expose normal tab semantics and keyboard behavior; segmented controls are used only for alternate views/filters, not critical lifecycle changes. |
| Detail layout | Opportunity and record detail uses a high-context hero/identity surface followed by an 8/4 desktop reading/context split. The context panel contains current state, time-sensitive metadata, permitted actions, and related links; it follows reading content on smaller screens. |
| Forms and upload rows | Labels sit above 48px white inputs with outline and indigo focus ring. Explain required/optional status, supported upload types, size limits, help, and precise errors. Preserve entered values after recoverable failure. |
| Kanban tracker | Student applications default to a non-draggable status board. Each labelled lane has a count and cards link to detail; cards do not imply the Student can change a hiring status. Provide a keyboard-accessible list/table alternative, and horizontally contain the board only on wide-screen layouts. |
| Timeline/history | Display chronological actor, timestamp, old/new state where applicable, and retained note. Retained history has no edit/delete affordance. |
| Advisory AI | Use a labelled Generated assistance panel with source attribution, refresh/loading/error state, and disclaimer that it does not change source data or decisions. It is never placed in task assignment, application transition, evaluation, completion, or other decision controls. |
| Dialogues/drawers | Use accessible modal/drawer patterns: focus trap, explicit close/cancel, focus return, internal overflow, and 16px viewport clearance. Confirmation text names irreversible results and required feedback. |
| Empty, loading, and error | Distinguish no data, no filtered matches, lack of access, and failures. Skeletons preserve final hierarchy. Errors support retry without losing filters or draft values. |

## Accessibility and workflow safeguards

- Use semantic landmarks, a skip link, real links/buttons, visible focus, logical tab order, keyboard-operable menus/chips/drawers/dialogues, and accessible live regions for non-disruptive state updates.
- Detail state, deadlines, progress, charts, files, and kanban lanes require textual equivalents. Monitoring charts always have a tabular/textual summary.
- Permission determines action rendering, but direct URLs still render standard Access Denied without protected record data.
- Validate publish and submit requirements before the final action. `Request revision` requires feedback. `Accept`, `Reject`, `Withdraw`, `Complete`, `Terminate`, `Archive`, and `Publish` require explicit confirmation.
- Student self-assessment and Supervisor/Admin performance evaluation remain separate authored records; never average, combine, or style them as an academic grade.

## Scope exclusions

Do not add public career content, events, CV creation, ATS scoring, simulated/mock interviews, interview retakes/results, AI screening, AI-selected task/status/evaluation outcomes, external delivery channels, or any other reference-only feature not required by InternHub.
