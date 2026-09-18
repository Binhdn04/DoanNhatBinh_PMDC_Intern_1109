# InternHub web

React, React Router and TanStack Query with Vite. Run `pnpm dev:web` at repository root after starting the API. The default `/api/v1` base uses Vite's proxy to localhost:3000. Set `VITE_API_BASE_URL` before building for a separately hosted API; configure its `WEB_ORIGIN` to the browser origin.

`src/app` owns routing and session state; `src/features` owns workflow pages; `src/lib/api.ts` handles bearer tokens, problem details and private transfers. Wire models are imported from `packages/contracts`. Transfer URLs resolve against the configured API origin, and unexpected origins are rejected.

Commands: `pnpm test:web`, `pnpm typecheck:web`, `pnpm build:web`. `pnpm test:browser` at the root runs the four-role internship lifecycle against an isolated API/database. AI controls are disabled until a real processor exists.
