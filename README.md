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

## Feature Tour
- **Dashboard & AI Widget**: Track total patients/doctors, appointment load, revenue, demographic mix, and AI alerts in one hero view.
- **Patients**: Searchable roster with risk badges plus a cinematic patient detail page (AI insight, vitals strip, timeline, labs, appointments).
- **Doctors**: Availability-driven cards and deep profiles with performance charts, schedules, and patient panels.
- **Appointments**: Month grid + list agenda, rich filtering, and modals for booking/editing/removing visits.
- **Billing**: Revenue, pending, invoice counts, and status-colored table for finance teams.
- **Pharmacy**: Stock KPIs and per-medicine cards showing units, price, expiry, and supply risk.
- **Laboratory**: Queue metrics, searchable orders, and result summaries with severity chips.
- **Reports**: Quick KPIs plus downloadable report catalog for audits and leadership decks.
- **AI Insights**: Severity filters, accuracy/risk charts, and expandable recommendations to prioritize care.
- **Settings**: Tabbed profile, notification, security, and appearance controls using the glass UI kit.

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

## Mock Data & Extensibility
- `src/data/index.ts` aggregates all mock tables (`patients`, `doctors`, `appointments`, `bills`, `medicines`, `labTests`, AI stats, charts, demographics, recent activities) into `db`.
- Feature pages import `db` once and hydrate local `useState` hooks. Add/Edit/Delete flows simply mutate that local state.
- To back this UI with a real service layer, replace direct `db` imports with API hooks or React Query, then persist mutations over HTTP/WebSocket calls.
- Tailwind customization lives in `tailwind.config.js` and `src/index.css` (Inter font, gradient background, custom scrollbars, animation helpers) so you can re-skin quickly.

## Documentation
A stakeholder-friendly deep dive into every module, journey, and roadmap idea lives in [`docs/MediAI_Technical_Overview.md`](docs/MediAI_Technical_Overview.md). Engineers can still inspect the repo structure directly, but the doc keeps the focus on features and outcomes.

## Suggested Next Steps
1. Connect the mock data layer to your API (REST, GraphQL, or React Query loaders) and persist CRUD mutations.
2. Implement auth/role-based access to protect billing and AI modules.
3. Wire the header’s theme toggle to CSS variables for light/dark support.
4. Add Vitest/RTL smoke tests and Playwright journeys for routing + modal flows.

Happy building!
