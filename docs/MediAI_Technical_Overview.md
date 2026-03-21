# MediAI Technical Overview

## 1. Product Summary
MediAI is a single-page hospital administration template that showcases how a modern operations team could manage patients, clinicians, appointments, billing, pharmacy inventory, lab work, analytics, and AI-assisted insights inside one React experience. The app uses mock data only—no backend or persistence—but it models real-world workflows with list/detail views, filters, CRUD-style forms, scheduling, and dashboards so that teams can plug in real APIs later.

## 2. Tech Stack & Tooling
| Layer | Details |
| --- | --- |
| Framework | React 19 with StrictMode, function components, and hooks. |
| Language | TypeScript (strict mode, bundler module resolution). |
| Bundler | Vite 8 beta with hot module reload and React plugin. |
| Router | `react-router-dom@7` with nested routes/layout. |
| Styling | Tailwind CSS 3.4 + custom gradients/animations defined in `tailwind.config.js` and `src/index.css`. |
| UI System | Custom "Glass" components (`GlassCard`, `GlassButton`, `GlassInput`, etc.) built on Tailwind + `clsx`/`tailwind-merge` helper `cn()`. |
| Data Viz | Recharts (Area, Bar, Pie, Radar). |
| Icons | `lucide-react` icon set. |
| State | Local `useState` hooks per page; mock data imported from `src/data`. |
| Tooling | ESLint (flat config with React Hooks + React Refresh plugins), TypeScript project references, PostCSS + Autoprefixer. |

## 3. Project Layout Highlights
| Path | Purpose |
| --- | --- |
| `src/App.tsx` | Declares the router (Dashboard + 10 feature routes) wrapped inside `Layout`. |
| `src/main.tsx` | Bootstraps React with StrictMode and global styles. |
| `src/components/layout` | `Sidebar`, `Header`, and `Layout` orchestrate navigation, responsive drawer behavior, and page chrome. |
| `src/components/ui` | Glassmorphic design system primitives (cards, buttons, inputs, selects, modals, badges, delete confirmation). |
| `src/components/forms` | Reusable controlled forms for patients, doctors, and appointments. |
| `src/components/calendar/CalendarView.tsx` | Feature-rich calendar & agenda view for appointments. |
| `src/components/timeline/MedicalTimeline.tsx` | Expandable medical record timeline rendered on patient detail pages. |
| `src/components/ai/AIDashboardWidget.tsx` | Shared AI insights widget that powers the Dashboard hero. |
| `src/pages` | Feature modules (Dashboard, Patients, Doctors, Appointments, Billing, Pharmacy, Laboratory, Reports, AI Insights, Settings). |
| `src/data` | Mock database split by concern plus an aggregated `db` export. |
| `src/types` | Domain models (Patient, Doctor, Appointment, Bill, Medicine, LabTest, MedicalRecord, AIInsight, etc.). |

## 4. Domain Data & Mock Backend
- All data lives in TypeScript modules under `src/data` and is consolidated into a single `db` object (`src/data/index.ts`).
- Tables include:
  - `patients.ts`, `doctors.ts`, `appointments.ts`, `billing.ts`, `pharmacy.ts`, `laboratory.ts` – rich mock records with nested medical histories, vitals, schedules, and lab results.
  - `aiMockData.ts` – AI cards, dashboard stats, chart series, demographic breakdown, and "recent activity" feed.
- Because components import data directly, CRUD actions only mutate component-local state; refreshing the browser resets to the static snapshots. Replace `db` usages with API hooks or React Query when connecting to a backend.

## 5. Routing, Layout & Navigation
- `Layout` renders a persistent Sidebar + Header around an `Outlet` for page content. The sidebar collapses on mobile and provides AI status copy.
- `Header` hosts menu toggle, search input, notification badge, dark-mode toggle placeholder, and a quick action button.
- Route map:
  | Path | Component | Highlights |
  | --- | --- | --- |
  | `/` | `Dashboard` | KPI cards, AI widget, revenue AreaChart, demographics PieChart, AI alert list, real-time activity feed. |
  | `/patients` | `PatientList` | Search + status filter, AI risk bars, CRUD modals, per-row actions. |
  | `/patients/:id` | `PatientDetail` | Hero banner, vitals strip, AI insight card, tabs for overview/history/labs/appointments, record form modal. |
  | `/doctors` | `DoctorList` | Status-aware doctor cards with stats, languages, overlay actions, CRUD modals. |
  | `/doctors/:id` | `DoctorDetail` | Hero profile, metrics, appointment chart, tabs (overview, appointments, schedule, patients). |
  | `/appointments` | `Appointments` | Calendar/list toggle, grouped agendas, filters, stats chips, add/edit/delete flows. |
  | `/billing` | `Billing` | Revenue summary cards, invoice filters, status badges. |
  | `/pharmacy` | `Pharmacy` | Inventory KPIs, stock badges, per-med card layout. |
  | `/laboratory` | `Laboratory` | Status KPIs, searchable lab orders, per-test result grids. |
  | `/reports` | `Reports` | Report metrics, download table. |
  | `/ai-insights` | `AIInsights` | Hero with scanning CTA, severity filters, AI accuracy chart, radar risk profile, expandable insight cards. |
  | `/settings` | `Settings` | Tabbed profile/notifications/security/appearance panels with mock inputs.

## 6. UI / Design System
- **Glass Components**: Buttons, inputs, selects, badges, cards, and modals consistently apply glassmorphic backgrounds, gradients, and hover effects. `cn()` merges Tailwind classes safely.
- **Modals**: `GlassModal` handles centered overlays; `DeleteConfirmModal` wraps it with warning visuals.
- **Inputs & Selects**: `GlassInput` and `GlassSelect` provide labeled fields with optional icons and validation styling.
- **Badges**: `GlassBadge` standardizes status colors (`success`, `warning`, etc.) for tables, alerts, and cards.

## 7. Feature Module Details
### 7.1 Dashboard (`src/pages/Dashboard.tsx`)
- Builds metric cards from `db.dashboardStats` with growth indicators and Lucide icons.
- Injects `AIDashboardWidget` for AI KPIs and rolling insights.
- Uses Recharts `AreaChart` for revenue trends and `PieChart` for demographic slices.
- Surfaces critical AI alerts (severity `High`/`Critical`) with patient cross-links plus a "Recent Activity" feed keyed from `db.recentActivities`.

### 7.2 Patients
- **List (`PatientList`)**: Search by name/ID, filter by status, view AI risk bars, and open add/edit/delete flows. `PatientForm` handles data entry.
- **Detail (`PatientDetail`)**: Hero banner adapts gradient to patient severity; shows vitals, AI risk score, and metadata. Tabs:
  - *Overview*: AI insight summary, recent visit card, patient details, medications, visit type distribution.
  - *History*: `MedicalTimeline` renders chronological records with expandable vitals/labs/notes, plus modal to append new `MedicalRecord`s.
  - *Labs*: Table with status filters (All/Critical/Abnormal/Normal) and color-coded rows.
  - *Appointments*: Card list of that patient's visits, showing type + status.

### 7.3 Doctors
- **List (`DoctorList`)**: Card grid with live status chip, stats (patients, experience, visits), rating stars, languages, consultation fee, and inline actions that open modals for editing/deleting or navigate to detail view.
- **Detail (`DoctorDetail`)**: Profile hero with languages/contact info, metrics, achievements, monthly appointment BarChart, appointment tab with filterable list + stats, schedule tab summarizing availability and weekly hours, patient tab summarizing unique patients (with AI risk scores).

### 7.4 Appointments (`Appointments.tsx`)
- Dual calendar/list views controlled via `viewMode` state.
- Calendar uses `CalendarView` to render a 6x7 grid, monthly KPIs, and upcoming list; selecting a day surfaces appointments in the side panel.
- List view provides stats chips, combined search, status/type filters, date sort, expandable day groups with inline actions. `AppointmentForm` powers add/edit; `DeleteConfirmModal` confirms removal.

### 7.5 Billing (`Billing.tsx`)
- Summaries for revenue, pending amount, and invoice count computed from `db.bills`.
- Search + status filter drives invoice table with totals and status-colored badges.

### 7.6 Pharmacy (`Pharmacy.tsx`)
- Inventory KPIs (total, low stock, out of stock) plus searchable card grid showing stock, price, status, expiry.

### 7.7 Laboratory (`Laboratory.tsx`)
- Category KPIs (pending, in progress, completed).
- Search by patient/test; each card details ordering provider, dates, and result grid with severity badges (Normal/Abnormal/Critical).

### 7.8 Reports (`Reports.tsx`)
- Static KPI cards plus download table for generated reports; `GlassButton` triggers placeholder actions.

### 7.9 AI Insights (`AIInsights.tsx`)
- Hero section with animated gradients, CTA to "Run AI Scan", and chips summarizing patients monitored and predictions.
- Severity cards that filter insights; Recharts area and radar visualizations show model accuracy and category risk distribution.
- Expandable insight cards display AI description, patient snapshot, recommendations, and actions.

### 7.10 Settings (`Settings.tsx`)
- Sidebar tabs toggle between profile, notifications, security, and appearance panels. Each panel uses `GlassInput`s, toggles, and CTA buttons; actual updates remain client-only.

## 8. Shared Experience Modules
- **CalendarView**: Builds a 42-cell grid for the current month, tracks selected date and appointment, summarises monthly totals, and enumerates upcoming 7-day schedule. Status/type-specific colors feed chips and stripes.
- **MedicalTimeline**: Sorts medical records, paints gradient cards based on visit type, toggles details (vitals, symptoms, meds, labs) and adds status cues (critical labs, follow-up dates).
- **AIDashboardWidget**: Aggregates AI statistics and highlights latest insights with severity-specific visuals.
- **Forms**: Patient/Doctor/Appointment forms populate select options from data sets and reuse `GlassInput` plus CTA buttons; they emit partial entities so parent pages can merge them into local state.
- **DeleteConfirmModal**: Provides a consistent confirmation UX before destructive operations.

## 9. State & Data Flow Patterns
- Each page pulls initial data from `db` and stores it in `useState` (e.g., `patients`, `doctors`, `appointments`).
- CRUD operations clone and update local arrays (`setPatients([...patients, newPatient])`). There is no context or global store.
- Filters and derived metrics rely on memoized calculations (`useMemo`) or inline `Array.filter` calls.
- Tabs and modals track booleans or enums in component state.
- There is no API fetching; when integrating a backend, replace the static imports with asynchronous data loaders and persist mutations through API calls.

## 10. Styling & Theming
- `src/index.css` imports the Inter font, defines a full-screen gradient background, custom scrollbars, and helper animation classes.
- `tailwind.config.js` extends color palette with `primary`, `secondary`, `accent`, `glass`, custom font family, blur utilities, and animation keyframes (`fade-in`, `slide-up`, `float`).
- Components compose Tailwind utility classes via `cn()` to avoid conflicting class definitions.
- Animations (pulse, shimmer, gradient shifts) create the futuristic "glass" feel consistent across pages.

## 11. Build, Run, and Quality Commands
Assuming Node.js ≥ 18.18 (Vite 8 requirement) and your preferred package manager (npm/pnpm/bun):
```
npm install        # or pnpm install / bun install
npm run dev        # start Vite dev server with HMR
npm run build      # type-check + Vite production build
npm run preview    # serve the production build locally
npm run lint       # ESLint (flat config with TS + React plugins)
```
Bun lockfile is checked in, but the project also includes `package-lock.json`; use one tool consistently to avoid mismatch.

## 12. Extensibility & Next Steps
1. **Replace Mock Data**: Swap `db` imports for API clients or React Query hooks; uplift shared data into context if multiple pages need live updates.
2. **Persist Forms**: Point `PatientForm`, `DoctorForm`, and `AppointmentForm` submissions to POST/PATCH endpoints, then refetch or optimistic-update local caches.
3. **Authentication & RBAC**: Guard routes using React Router loaders/actions alongside auth context for admin-only areas (Billing, AI insights).
4. **Global State**: Introduce Zustand, Redux Toolkit, or React Query if multiple modules need synchronized data (e.g., appointment counts across dashboard + calendar).
5. **Theming**: Wire the Header’s dark/light toggle to CSS variables or Tailwind’s `data-theme` to enable runtime theming.
6. **Accessibility**: Add focus traps to `GlassModal`, ARIA labels to icon buttons, and ensure color contrast meets WCAG.
7. **Testing**: Add Vitest + React Testing Library smoke tests for critical forms, along with Playwright E2E checks for routing and modals.
8. **Internationalization**: Abstract hard-coded copy/number formats and adopt `Intl` helpers or i18n libraries.

## 13. Key Domain Entities
| Entity | Source | Notes |
| --- | --- | --- |
| `Patient` | `src/types/index.ts` | Includes demographics, contact, status, avatar, AI risk, and nested `medicalHistory` array of `MedicalRecord`s with vitals/labs. |
| `Doctor` | same | Tracks specialty, schedule, availability status, rating, achievements, fees, languages, and appointment metrics. |
| `Appointment` | same | Connects patient + doctor, stores status, type, notes; used by calendar, dashboard stats, and doctor/patient detail tabs. |
| `Bill` | `src/data/billing.ts` | Itemized invoices with statuses (Paid/Pending/Overdue). |
| `Medicine` | `src/data/pharmacy.ts` | Inventory record with stock levels, manufacturer, expiry, and status. |
| `LabTest` | `src/data/laboratory.ts` | Lab orders with statuses and optional result arrays. |
| `AIInsight` | `src/data/aiMockData.ts` | Severity-ranked AI findings with recommendations, patient linkage, and confidence scoring.

Use this document alongside the updated README to onboard engineers, hook the mock UI to live services, or scope future enhancements.
