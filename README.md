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

## The AI-first idea

Most "AI-powered" admin tools add a layer: the AI writes advice, and a human still does the work —
so the AI has *added* a reading step rather than removed a task.

MediAI inverts that. **The AI drafts the work; the human approves it.** When an agent detects a
risk, it does not print "cardiology consultation within 48 hours" and leave you to go book it. It
picks the right specialist, finds a slot on their actual rota, fills in the details, and hands you
one button:

> **Book specialist consult** — Dr. Maria Garcia · Cardiology · Thu 4 Sep, 10:30
> *Why this?* · **Edit** · **Dismiss** · **Approve**

Three principles hold this together:

1. **Every AI output is executable.** Recommendations are pre-filled actions, not bullet points.
   The approval queue tracks the manual minutes each one saves.
2. **Clinical decisions always need a human.** Medication and monitoring changes are flagged
   `Clinician sign-off` and are deliberately excluded from bulk approval. Administrative work —
   booking, referrals, labs, outreach, enrolment — can be cleared in one click.
3. **Reasoning is always available, never forced.** Every draft carries a "Why this?" explaining
   the specialty match, the slot choice, and the signal it came from.

There is also exactly **one queue**. An alert you can't act on isn't worth a notification, so the
task inbox and the action queue are the same surface — reachable from the dashboard, the header,
the Copilot, or AI Insights.

## Information design

Screens are built to answer one question first, then get out of the way. Three rules:

1. **Action before ambience.** The dashboard opens with what needs approving, not with charts.
   Analytics sit below the actionable list on AI Insights for the same reason.
2. **One decision per screen.** Login asks who you are — everything else on that page is a
   consequence of that choice, shown live rather than described.
3. **Collapsed rows carry three signals, not nine.** An AI insight row shows urgency, patient, and
   whether work is outstanding. Confidence, source agent, and timing appear when you open it.

Nothing was deleted to achieve this — detail moved to where it is actually read, and content that
appeared on two screens now appears on one.

## Roles

Eight roles, chosen at login. The role is not a label — it changes the sidebar, the dashboard, the
command palette, the routes you may open, and **which drafted actions reach your queue**.

| Role | Username | Password | Approves | Queue |
| --- | --- | --- | --- | --- |
| Administrator | `admin@mediai.com` | `Admin@123` | Everything | 18 |
| Doctor | `doctor@mediai.com` | `Doctor@123` | Everything, including medication | 18 |
| Assistant Doctor | `assistant@mediai.com` | `Assist@123` | Everything **except** medication | 14 |
| Nurse | `nurse@mediai.com` | `Nurse@123` | Monitoring, outreach, education, visits | 9 |
| Pharmacist | `pharmacist@mediai.com` | `Pharma@123` | Medication orders only | 4 |
| Lab Technician | `lab@mediai.com` | `Lab@123` | Lab orders only | 2 |
| Receptionist | `reception@mediai.com` | `Front@123` | Bookings, referrals, outreach | 4 |
| Patient | `patient@mediai.com` | `Patient@123` | — (own portal) | — |

Each role has its own sign-in. Selecting a role on the login screen fills its credentials, and the
fields stay editable — the username you submit decides which workspace you land in, so the picker
is a shortcut rather than the authority. These are demo values checked in the browser; there is no
authentication behind them.

A pharmacist signs in to four medication drafts and a four-item sidebar, not twenty-one items and
thirteen nav entries belonging to other people. That is the whole point: **the role removes work
rather than adding a permissions screen.**

Three details worth calling out:

- **Assistant Doctor vs Doctor is a real distinction, not cosmetic.** Residents get the full
  clinical picture but cannot sign medication orders — those drafts route to the attending instead.
- **Drafts belonging to another role stay visible but locked** ("Not your queue"), so nobody is left
  wondering where an action went.
- **Patients get a different shell entirely.** `PortalLayout` has no sidebar, no command palette, no
  agent drawer, no copilot — just their next visit, results, prescriptions, and bills. An admin
  console with most items hidden still reads like an admin console.

Switch roles from the account menu without signing out, which makes the differences easy to demo.

## Key Features

- **Unified shell** — responsive sidebar + header, compact mode, skip-to-content link, and a
  keyboard-first command palette (`⌘K` / `Ctrl+K`).
- **Command palette** — fuzzy search across patients, doctors, modules, AI agents, and quick
  actions, with full arrow-key navigation and `↵` to open.
- **Operational dashboards** — a compact KPI strip, the approval queue, a live activity feed, and
  revenue/demographics charts, all scoped to the signed-in role.
- **Today's Schedule** — clinicians see their own list for today with the next slot highlighted and
  one-click start/join; desk roles see the whole day. Mock appointment dates are anchored to the
  current date at load, so the demo never drifts into an empty past.
- **Patients & doctors** — searchable, sortable rosters with AI risk meters, plus deep profile pages
  covering vitals, medical timelines, labs, and appointments.
- **Appointments** — calendar and agenda views, rich filtering, and full booking/edit flows.
- **Billing** — sortable invoice ledger, an overdue-first alert banner, and a detailed invoice modal
  with line items and totals.
- **Pharmacy** — stock-level meters, expiry-window warnings, supply-risk banner, and reorder actions.
- **Laboratory** — order queue with expandable results and critical-value flagging.
- **Approval queue** — every AI-drafted action in one place, grouped by patient, with batch approve,
  inline editing, per-action reasoning, and undo on everything.
- **AI Intelligence Center** — severity filters, confidence scoring, drafted actions attached to every
  insight, and a library of operational AI agents with dedicated viewbooks.
- **Copilot that acts** — answers end in buttons that do the work: approve the safe queue, chase
  unpaid invoices, draft supplier reorders.
- **Role workspaces** — tailored views for receptionists, attending doctors, and pharmacy/lab leads.
- **Six themes** — five dark variants plus a full light mode, driven entirely by CSS design tokens.
- **Login that previews the app** — every role has its own username and password. Picking one fills
  the credentials and renders a live miniature of that person's workspace — their real sidebar and
  their real approval queue, built from the same data the app runs on. Arrow keys walk the roles.
- **Patient portal** — a separate, minimal shell: next visit with join/reschedule, lab results with
  plain-language flags, prescriptions, bills with pay/receipt, and a message-your-care-team action.

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
| `AIActionCard` | One drafted action — approve, edit, dismiss, or read the reasoning |
| `AIActionQueue`, `AIWorkSummary` | Dashboard and page-level views of the approval queue |
| `RoleGuard` | Blocks routes outside a role, with an explanation rather than a blank page |
| `PortalLayout` | The patient-facing shell — no admin chrome |

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
2. Replace the mock session with real authentication — the `SessionContext` boundary and
   `canAccess` rules are already in place, so server-side enforcement slots in behind them.
3. Extend drafted actions to intake — AI-prefilled registration and visit notes for human review.
4. Add Vitest/RTL smoke tests and Playwright journeys for routing and modal flows.

---

© Ranjit Redekar. UI preview — **contact me for the complete application.**
