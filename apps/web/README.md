# @internhub/web

React 19, TypeScript, Vite, and Tailwind CSS prototype for InternHub. It intentionally uses frontend mock data and local React state; it does not include React Router, backend clients, or API dependencies.

## Run from the repository root

```bash
corepack enable
corepack install
pnpm install
pnpm dev:web
```

Use `pnpm typecheck:web` and `pnpm build:web` to validate the application.

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

The existing screen callbacks and mock state are intentionally retained during this structural refactor.
