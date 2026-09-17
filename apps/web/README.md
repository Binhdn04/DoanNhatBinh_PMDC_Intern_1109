# @internhub/web

React 19, TypeScript, Vite, and Tailwind CSS frontend for InternHub. It uses React Router, TanStack Query, session-scoped JWT storage, and the running NestJS controller at `/api/v1` by default.

## Run from the repository root

```bash
corepack enable
corepack install
pnpm install
pnpm dev:web
```

Use `pnpm typecheck:web` and `pnpm build:web` to validate the application.

Use `pnpm test:web` for the frontend unit tests. Copy `.env.example` to `.env.local` only when the API is hosted away from the Vite origin.

## Source layout

```text
src/
  app/                 # app shell, state-based navigation, sidebar
  features/
    discovery/         # internship listing, filtering, detail, mock internships
    applications/      # apply, interview, result, application timeline
    progress/          # task board, weekly report, supervisor review
    evaluation/        # internship evaluation
    profile/           # profile and organization screens
    admin/             # monitoring dashboard
  shared/ui/           # reusable controls
  styles/              # global Tailwind entry stylesheet
```

Only controller-backed flows are exposed. Workflows without a currently running endpoint show an explicit unavailable state instead of mock data.
