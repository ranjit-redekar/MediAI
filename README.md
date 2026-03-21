# MediAI – AI-Powered Hospital Admin Template

MediAI is a React + TypeScript single-page application that simulates an AI-assisted hospital command center. It ships with richly designed dashboards, searchable list/detail experiences for patients and doctors, scheduling tools, billing tables, pharmacy and laboratory trackers, and an insights hub that visualizes machine-learning alerts. All data is mocked locally so teams can focus on UX first and wire in real APIs later.

## Key Features
- **Unified layout & navigation** – Responsive sidebar + header shell with quick search, notifications, and AI status.
- **Operational dashboards** – KPI cards, revenue charts, demographics pie, recent activities, and an AI widget powered by Recharts.
- **Patient & doctor management** – List + detail flows, medical timelines, vitals, lab tabs, doctor availability, rating, and achievements.
- **Appointments workspace** – Calendar/list toggle, grouped agendas, filters, and CRUD modals for scheduling.
- **Billing, pharmacy & laboratory modules** – Inventory cards, invoice tables, lab result grids with severity badges.
- **AI Intelligence Center** – Severity filters, radar/area charts, expandable recommendations, and “Run AI Scan” call-to-action.
- **Glassmorphic design system** – Reusable `Glass*` components (cards, buttons, inputs, badges, modals) built on Tailwind CSS.

## Tech Stack
- React 19 + React Router 7
- TypeScript (strict, bundler resolution)
- Vite 8 beta build tooling
- Tailwind CSS 3.4 with custom gradients/animations
- Recharts for charts and Lucide for icons
- ESLint flat config, PostCSS/Autoprefixer, clsx + tailwind-merge helper

## Getting Started
### Prerequisites
- Node.js **18.18+** (required by Vite 8)
- One package manager (npm, pnpm, or bun). A `package-lock.json` and `bun.lock` are present—pick one tool and stick with it.

### Installation & Scripts
```sh
npm install          # install dependencies (or pnpm install / bun install)
npm run dev          # start the Vite dev server with HMR
npm run build        # type-check + production build
npm run preview      # preview the built app on a local server
npm run lint         # run ESLint (TS + React Hooks + React Refresh rules)
```
> Tip: all data is mocked inside `src/data`, so refreshing the browser resets CRUD operations.

## Directory Highlights
| Path | Description |
| --- | --- |
| `src/App.tsx` | Router definition (Dashboard + feature pages) nested under the global `Layout`. |
| `src/components/layout` | Sidebar + header chrome with responsive drawer behavior. |
| `src/components/ui` | Glass-themed primitives (`GlassCard`, `GlassButton`, `GlassModal`, etc.). |
| `src/components/forms` | Controlled forms for patients, doctors, and appointments. |
| `src/components/calendar/CalendarView.tsx` | Month grid + agenda logic used by the Appointments page. |
| `src/components/timeline/MedicalTimeline.tsx` | Expandable patient medical history timeline. |
| `src/components/ai/AIDashboardWidget.tsx` | Shared AI insights widget reused on the dashboard. |
| `src/pages` | Feature modules (Dashboard, Patients/Doctors list & detail, Appointments, Billing, Pharmacy, Laboratory, Reports, AI Insights, Settings). |
| `src/data` | Mock database split by concern and re-exported as the `db` object. |
| `src/types` | Domain models covering patients, doctors, appointments, billing, medicines, lab tests, AI insights, etc. |

## Mock Data & Extensibility
- `src/data/index.ts` aggregates all mock tables (`patients`, `doctors`, `appointments`, `bills`, `medicines`, `labTests`, AI stats, charts, demographics, recent activities) into `db`.
- Feature pages import `db` once and hydrate local `useState` hooks. Add/Edit/Delete flows simply mutate that local state.
- To back this UI with a real service layer, replace direct `db` imports with API hooks or React Query, then persist mutations over HTTP/WebSocket calls.
- Tailwind customization lives in `tailwind.config.js` and `src/index.css` (Inter font, gradient background, custom scrollbars, animation helpers) so you can re-skin quickly.

## Documentation
A deeper dive into routing, modules, data shapes, shared components, and recommended next steps lives in [`docs/MediAI_Technical_Overview.md`](docs/MediAI_Technical_Overview.md). Start there when onboarding engineers or planning integrations.

## Suggested Next Steps
1. Connect the mock data layer to your API (REST, GraphQL, or React Query loaders) and persist CRUD mutations.
2. Implement auth/role-based access to protect billing and AI modules.
3. Wire the header’s theme toggle to CSS variables for light/dark support.
4. Add Vitest/RTL smoke tests and Playwright journeys for routing + modal flows.

Happy building!
