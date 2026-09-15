# Refactor Blueprint

## Target repository shape

```text
apps/
  web/                           # React/Vite mock-data prototype
    src/{app,features,shared,styles}/
  api/                           # planned NestJS modular monolith
  worker/                        # planned job consumers
packages/
  contracts/                     # planned REST DTO types
  domain/                        # planned scoring and state-machine logic
infra/                            # planned platform configuration
docs/architecture/
```

The workspace and web feature structure have been created. The API, worker, packages, and infrastructure directories currently contain ownership READMEs only; their runtime implementation remains planned.

## Frontend migration map

| Current concern in `src/App.tsx` | Target home |
| --- | --- |
| `INTERNSHIPS`, UI filtering, detail view | `features/discovery` plus API-backed query hooks |
| Apply/interview/application timeline | `features/applications` |
| Kanban, weekly reports, supervisor review | `features/progress` |
| Profile/skills/preferences | `features/profile` |
| sidebar, button, form controls | `shared/ui` |
| screen union and root conditional | `app/AppShell` state composition (guarded routes are future work) |
| mock state and `useState` orchestration | feature-local state; query/cache layer is future work |

## API contract baseline

| Resource | Operations | Authorized roles |
| --- | --- | --- |
| `/auth` | register, login, refresh, logout | Public/authenticated as applicable |
| `/internships` | list/search, detail, create/update/publish | Read: authenticated; write: Company Staff owner or Admin |
| `/internships/{id}/match` | deterministic score and explanation status | Student owner or Admin |
| `/applications` | create, list, detail | Student owner; Company Staff for own company; Admin |
| `/applications/{id}/status` | transition status and append audit history | Company Staff owner or Admin; Student may withdraw own application |
| `/applications/{id}/documents` | request upload and list metadata | Student owner; authorized company/admin readers |
| `/placements` | list/detail after accepted application | Student, assigned Supervisor, authorized Company Staff, Admin |
| `/placements/{id}/tasks` | create/list/update task status | Assigned Supervisor/Admin creates; placement student updates owned task state |
| `/placements/{id}/reports` | submit/list weekly reports | Placement student submits; assigned Supervisor/Admin reads |
| `/reports/{id}/feedback` | add/list feedback | Assigned Supervisor/Admin writes; report owner reads |
| `/notifications` | list/read own notifications | Authenticated owner |

All endpoints are prefixed with `/api/v1`, consume/produce JSON except scoped object-storage transfers, and enforce DTO validation. Publish OpenAPI from the API and generate/validate the shared client contract in CI.

## Domain and persistence reconciliation

- Change `user_role` to include `company_staff`; replace or rename `company_admins` to a `company_memberships` relation linking Company Staff to a company. Retain supervisor-to-company association.
- Retain application uniqueness per `(student_id, internship_id)` and status history. Enforce the state graph: `submitted → under_review → interview → accepted|rejected`; students can withdraw from non-terminal states; terminal statuses do not transition.
- Treat `internship_placements` as the placement boundary created only after acceptance. Tasks, reports, and feedback always reference it.
- Add a durable `jobs`/outbox persistence model for notification and AI work. Store provider failures and retries separately from user-visible domain records.

## Ownership matrix

| Resource/action | Student | Company Staff | Supervisor | Admin |
| --- | --- | --- | --- | --- |
| Edit own profile/skills | Yes | Own account | Own account | Yes |
| Create/publish company internship | No | Own company | No | Yes |
| Submit/withdraw own application | Yes | No | No | Yes |
| Transition company application | No | Own company | No | Yes |
| Read placement | Own placement | Own company placement | Assigned placement | Yes |
| Assign task / give report feedback | No | No | Assigned placement | Yes |
| Update task / submit report | Own placement | No | No | Yes |

## Future test blueprint

- Unit: Match Score weighting and application state-machine transitions.
- Integration: JWT/RBAC plus organization/placement ownership, status-history transaction, document authorization, and API/OpenAPI contracts.
- End-to-end: student discovery-to-application, Company Staff status transition, and student report-to-supervisor feedback.
- Resilience: AI timeout/error leaves score/raw report usable and records a retryable job failure.

