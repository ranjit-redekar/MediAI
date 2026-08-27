# MediAI — AI-Powered Hospital Admin (UI Preview)

MediAI is a React + TypeScript command center for hospital operations: dashboards, patient and
doctor workspaces, scheduling, billing, pharmacy, laboratory, and an AI intelligence layer that
surfaces risk before it becomes an incident.

---

## ⚠️ About this repository

**This is a UI-only preview build.** Every screen runs on local mock data from `src/data` — there is
no backend, no database, and no authentication behind it yet. Actions such as creating an invoice,
downloading a report, or resolving an AI task update local state and show a confirmation, but they
do not persist. Refreshing the browser resets everything.

The backend integration is a separate phase that begins once this UI is signed off.

### 📩 Requesting the complete application

**This repository contains the UI layer only. For the complete application — full source, backend
services, API integration, deployment setup, and licensing — please contact me directly.**

> **Contact:** Ranjit Redekar · [ranjitredekar8@gmail.com](mailto:ranjitredekar8@gmail.com)

Please get in touch before using this in a commercial or production setting.

---

## Key Features

- **Unified shell** — responsive sidebar + header, compact mode, skip-to-content link, and a
  keyboard-first command palette (`⌘K` / `Ctrl+K`).
- **Command palette** — fuzzy search across patients, doctors, modules, AI agents, and quick
  actions, with full arrow-key navigation and `↵` to open.
- **Operational dashboards** — animated KPI cards with sparklines, revenue and demographics charts,
  a live activity feed, and AI critical alerts.
- **Patients & doctors** — searchable, sortable rosters with AI risk meters, plus deep profile pages
  covering vitals, medical timelines, labs, and appointments.
- **Appointments** — calendar and agenda views, rich filtering, and full booking/edit flows.
- **Billing** — sortable invoice ledger, an overdue-first alert banner, and a detailed invoice modal
  with line items and totals.
- **Pharmacy** — stock-level meters, expiry-window warnings, supply-risk banner, and reorder actions.
- **Laboratory** — order queue with expandable results and critical-value flagging.
- **Task inbox** — AI-raised alerts you can review or resolve, with undo.
- **AI Intelligence Center** — severity filters, confidence scoring, expandable recommendations, and
  a library of operational AI agents with dedicated viewbooks.
- **Role workspaces** — tailored views for receptionists, attending doctors, and pharmacy/lab leads.
- **Six themes** — five dark variants plus a full light mode, driven entirely by CSS design tokens.

## Design System

All colors, surfaces, borders, shadows, and radii are CSS custom properties defined in
`src/index.css`. Components read semantic tokens (`text-app`, `text-app-muted`, `bg-[var(--surface-2)]`)
rather than hard-coded colors, so a new theme is a block of variable overrides and requires no
component changes.

Shared primitives live in `src/components/ui`:

| Component | Purpose |
| --- | --- |
| `GlassCard`, `GlassButton`, `GlassBadge` | Core surfaces and controls |
| `GlassInput`, `GlassSelect`, `SearchInput` | Form and search fields |
| `GlassModal` | Accessible dialog — focus trap, `Esc` to close, scroll lock, focus restore |
| `EmptyState` | Standard empty/filtered-out state with a way out |
| `FilterTabs` | Segmented status filters used across list pages |
| `DataTable` (`SortableHeader`, `useSort`) | Sortable table headers with `aria-sort` |
| `Skeleton`, `RouteFallback` | Loading placeholders for code-split routes |
| `StatCard`, `MiniStat`, `Sparkline` | Animated metric tiles |

## Accessibility

- Skip-to-content link and a focusable `<main>` landmark
- Focus trap, `Esc`, scroll lock, and focus restoration in modals
- `aria-sort` on sortable columns, `role="listbox"`/`option` in the command palette
- Labelled icon-only buttons throughout
- Visible focus rings via a shared `.focus-ring` utility
- Full `prefers-reduced-motion` support — all animation is disabled when requested

## Tech Stack

- React 19 + React Router 7 (lazy-loaded routes)
- TypeScript (strict, bundler resolution)
- Vite 8 build tooling
- Tailwind CSS 3.4 layered over CSS custom properties
- Recharts for charts, Lucide for icons
- ESLint flat config, PostCSS/Autoprefixer, `clsx` + `tailwind-merge`

## Getting Started

### Prerequisites

- Node.js **18.18+** (required by Vite 8)
- One package manager — a `package-lock.json` and `bun.lock` are both present, so pick one and
  stay with it.

### Installation & Scripts

```sh
npm install          # install dependencies (or pnpm install / bun install)
npm run dev          # start the Vite dev server with HMR
npm run build        # type-check + production build
npm run preview      # preview the built app locally
npm run lint         # run ESLint
```

### Performance

Routes are code-split with `React.lazy`, so the initial bundle carries only the shell. Recharts
loads on demand, which keeps it off the login screen entirely.

| | Initial JS (gzip) |
| --- | --- |
| Single bundle | ~291 kB |
| Code-split | ~96 kB |

## Mock Data & Wiring Up a Backend

- `src/data/index.ts` aggregates every mock table (`patients`, `doctors`, `appointments`, `bills`,
  `medicines`, `labTests`, AI insights, agents, chart series) into a single `db` object.
- Feature pages read `db` once and hold mutations in React context (`PatientsContext`,
  `DoctorsContext`, `AppointmentsContext`, `StaffContext`, `TasksContext`).
- To connect a real service layer, replace the `db` imports inside those context providers with API
  calls or React Query hooks. Page components consume the contexts, not the mock data directly, so
  they should need few or no changes.

## Documentation

A stakeholder-friendly walkthrough of every module lives in
[`docs/MediAI_Technical_Overview.md`](docs/MediAI_Technical_Overview.md).

## Roadmap

1. Connect the context layer to real APIs and persist mutations.
2. Add authentication and role-based access control for billing and AI modules.
3. Introduce bed/ward occupancy and emergency triage boards.
4. Add Vitest/RTL smoke tests and Playwright journeys for routing and modal flows.

---

© Ranjit Redekar. UI preview — **contact me for the complete application.**
