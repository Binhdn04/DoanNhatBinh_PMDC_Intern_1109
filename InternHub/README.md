# InternHub

InternHub is a web prototype for the **Smart Internship Management System**. It helps students discover internship opportunities, submit applications, and track the entire internship journey.

## Main Features

- **Discover & Matching:** search and filter internship opportunities and view a Match Score based on the student's skills.
- **Application Management:** view internship details, submit applications, complete a simulated interview, and track application status.
- **Internship Progress:** manage tasks, update progress, submit weekly reports, and receive supervisor feedback.
- **Evaluation:** view and complete internship evaluation steps.
- **Profile & Organization:** manage profiles, skills, company information, and user roles.
- **Monitoring & Reporting:** provide admin and university dashboards for tracking progress, deadlines, statuses, and internship activity.

## Technology Stack

- React 19 and TypeScript
- Vite
- Tailwind CSS

The current application uses mock data defined in the frontend for UI/UX and interaction demonstrations. A backend and external API integrations are not included in this prototype.

## Run the Project

Make sure Node.js and pnpm are installed.

```bash
pnpm install
pnpm dev
```

Open the local address displayed by Vite in the terminal. To create a production build:

```bash
pnpm build
```

## Main Structure

```text
InternHub/
├── src/
│   ├── App.tsx       # Main screens and interaction flows
│   ├── index.css     # Global styles
│   └── main.tsx      # Application entry point
├── index.html
├── package.json
└── vite.config.ts
```
