# MediAI Technical Overview

## 1. What MediAI Solves
MediAI simulates a hospital command center where administrators, clinicians, and operations teams see the same truth: live KPIs, AI-driven alerts, and all the patient/doctor/appointment logistics needed to run a facility. The single-page app shows how modern tooling can streamline:
- Capacity awareness (patients, doctors, appointments, revenue) in one dashboard.
- Patient safety workflows with AI surfacing critical risks.
- Provider productivity via instant insight into schedules, performance, and caseloads.
- Back-office clarity for billing, pharmacy stock, lab queues, and compliance reporting.

## 2. Experience Pillars
| Pillar | Highlights |
| --- | --- |
| **Intelligence Forward** | AI widget + AI Insights page constantly surface high/critical cases, confidence levels, and recommended next steps. |
| **Operational Depth** | Every major department (patients, doctors, appointments, billing, pharmacy, laboratory, reports, settings) has a dedicated workspace with tailored KPIs and workflows. |
| **Actionable UI** | Search, filter, sort, and CRUD modals exist across modules so teams can immediately respond to what they see. |
| **Glassmorphic Brand** | Consistent glass cards, gradients, and micro-animations communicate a futuristic, premium admin experience. |

## 3. Feature Deep-Dive
### 3.1 Dashboard & Intelligence Hub
- 4 KPI tiles (patients, doctors, today’s appointments, monthly revenue) with month-over-month deltas.
- Revenue Overview area chart plus patient demographic pie to spot macro trends.
- AI widget summarizing predictions, critical alerts, and latest recommendations without leaving the page.
- **AI Agent Lineup**: Compact cards present each operational agent’s mission, status (online/monitoring/idle), and live metrics so leaders can see what automation is running before diving deeper.
- Critical Alert list highlights severity, affected patient, and AI confidence so triage teams know where to act first.
- Recent Activity feed mixes AI events, appointments, billing, and labs for situational awareness.

### 3.2 Patient Management
- **Directory View**: Search by name/ID, filter by status, glanceable AI risk bars, and per-row quick actions (view, edit, delete).
- **Patient Detail**: Hero banner adapts to acuity, displays vitals, AI score, demographics, and contact data.
- **Tabs**:
  - *Overview* – AI insight summary, latest visit card, medication chips, and visit mix.
  - *Medical History* – Interactive timeline grouping diagnoses, symptoms, vitals, labs, follow-ups, and attachments.
  - *Lab Results* – Status-filtered grid showing values vs reference ranges.
  - *Appointments* – History of encounters with status badges, visit type, and notes.
- **Forms & Modals**: Add/Edit patient forms collect demographics, contact data, AI risk, etc.; delete modal confirms destructive actions.

### 3.3 Doctor Management
- **Doctor Cards**: Availability badge, specialty, languages, consultation fee, experience, rating stars, and patient counts.
- **Detail Workspace**:
  - Overview hero with contact info, achievements, completion rate, fee, and languages.
  - Appointment Stats chart compares total vs completed visits over time.
  - Tabs for Appointments (filter by status/type), Schedule (weekly availability + hours), and Patients (unique caseload with AI risk).
- **Productivity KPIs**: Completed vs scheduled vs cancelled counts, no-shows, and active patients.

### 3.4 Appointments Control Center
- Toggles between **Calendar View** (month grid + upcoming list) and **List View** (day-grouped agenda).
- Filters for status, type (in-person/video/phone), search across patient/doctor/specialty, and date sorting.
- Inline stats show total, scheduled, completed, cancelled, and no-show counts.
- CRUD modals capture patient/doctor selection, visit type, status, notes, and scheduled time.

### 3.5 Operational Back Office
- **Billing**: Revenue, pending, and invoice count cards plus a searchable invoice table with payment status badges.
- **Pharmacy**: Inventory KPIs (total, low, out-of-stock), quick search, per-medicine cards with stock, price, expiry, and status.
- **Laboratory**: Pending/in-progress/completed cards, search by patient/test, and detailed result tiles with severity chips.
- **Reports**: Quick KPIs (total, this month, patient, financial) and downloadable report list for audits.

### 3.6 AI Intelligence Center
- Hero CTA to "Run AI Scan" with animated background and live status chips.
- Severity cards (Critical, High, Medium, Low) double as filters and show active alert counts.
- Charts track AI model accuracy trend and risk distribution across clinical categories.
- Expandable insight cards combine AI description, patient snapshot, confidence, and actionable recommendations with quick actions (view patient, mark reviewed).
- **Agent Showcase + Viewbooks**: Switch between compact and detailed agent displays, then drill into a full "Agent ViewBook" page featuring mission, pillars, workflows, success stories, and activation timeline for each agent archetype.

### 3.7 Settings & Personalization
- Tabbed panels for Profile (avatar + contact info), Notifications (toggles for alert types), Security (password update), and Appearance (dark/compact mode toggles).
- Each uses the glass component library for consistency with the rest of the product.

### 3.8 Role Workspaces (NEW)
- **Role Directory**: Searchable grid of hospital personas (Receptionist, Attending Doctor, Pharma/Test Coordinator) with the top KPIs, focus areas, and shift context.
- **Role Detail**: Deep dive per role showing AI copilot summary, KPI grid, focus widgets, quick actions, workflow SLAs, live queues, alert feed, linked MediAI screens, and hand-off notes.
- **Purpose**: Demonstrates how RBAC-ready layouts can be composed so each persona sees only the modules and AI nudges they need, paving the way for granular permissions later.

## 4. User Journeys
1. **Command Center Morning Standup**: Team lands on Dashboard, scans KPIs, reviews AI alerts, and drills into flagged patients.
2. **Care Coordinator**: Searches patients, opens detail, reviews AI recommendations, adds a medical note, and schedules a follow-up appointment from the Appointments page.
3. **Medical Director**: Checks doctor cards to see availability and performance, opens a doctor profile to review cancellation trends and adjust schedules.
4. **Billing Specialist**: Filters invoices to pending status, exports data, and confirms totals against finance systems.
5. **Pharmacy Lead**: Sorts medicines for low stock, informs procurement, and checks expiry dates.
6. **Lab Manager**: Monitors pending tests and ensures critical lab flags reach clinicians via AI Insights and patient timelines.

## 5. Visual & Interaction System
- **Glassmorphic Surfaces**: Cards, buttons, modals share frosted transparency, glow states, and gradient borders for brand cohesion.
- **Micro-Animations**: Fade/slide transitions, shimmering highlights, and pulse indicators show live status (AI running, live feeds, availability).
- **Responsive Layout**: Sidebar collapses to a drawer on mobile, ensuring all modules are accessible on tablets and smaller screens.
- **Iconography**: Lucide icons maintain clarity for clinical concepts (vitals, lab, billing, AI) without clutter.

## 6. Data & Integration Notes
- Mock datasets (patients, doctors, appointments, billing, pharmacy, labs, AI stats) provide realistic values for demos.
- Local state updates (add/edit/delete) mimic CRUD but reset on refresh—swap these interactions for API calls or data fetching libraries when wiring up a backend.
- Domain models already include fields common in hospital EMR/RCM systems (vitals, lab ranges, consult fees, AI confidence), easing data mapping later.

## 7. Customisation & Roadmap Ideas
| Area | Opportunity |
| --- | --- |
| Data Connectivity | Replace static `db` imports with REST/GraphQL clients or React Query for live data + caching. |
| Real-Time Signals | Use WebSockets or SSE to push AI alerts, lab results, and appointment changes instantly. |
| RBAC & Security | Gate billing/AI modules by role, add audit logging, and integrate SSO/OAuth flows. |
| Analytics | Extend dashboards with drill-down filters, cohort comparisons, or predictive wait-time charts. |
| Collaboration | Add tasks, comments, or shared notes inside patient and doctor detail pages. |
| Accessibility | Enhance keyboard navigation, focus traps in modals, and contrast ratios for WCAG compliance. |

## 8. Tech Stack Snapshot (for context)
While this document emphasizes capability rather than implementation, the prototype is built with React 19, TypeScript, Vite 8, Tailwind CSS, Recharts, and Lucide icons. Custom “Glass” components ensure consistent design, and ESLint/TypeScript enforce code quality behind the scenes.

---
**Need engineering-level instructions?** The README in the repo links to this guide and can point developers to setup steps, but the product focus above should help stakeholders evaluate MediAI’s feature coverage without digging into files.
