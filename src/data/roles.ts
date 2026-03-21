import type { RoleDefinition } from '../types';

export const roles: RoleDefinition[] = [
  {
    id: 'receptionist',
    name: 'Receptionist',
    persona: 'Front desk & triage orchestrator',
    summary: 'Manages arrivals, verifies coverage, and keeps the waiting room flowing while flagging urgent patients for AI-backed triage.',
    shift: 'Day shift • 06:30 - 15:30 IST',
    status: 'Queue steady (avg wait 07:12)',
    aiCopilot: 'Auto-detects repeat visitors, pre-fills demographics, and suggests triage order based on AI risk.',
    metrics: [
      { label: 'Waiting Room', value: '18 patients', change: '-4 vs 09:00', trend: 'down', helper: 'Target < 20' },
      { label: 'Check-ins / hr', value: '32', change: '+12%', trend: 'up', helper: 'Goal ≥ 25' },
      { label: 'Triage Escalations', value: '3', change: '+1 urgent', trend: 'up', helper: '2 flagged Critical' },
      { label: 'Docs Captured', value: '92%', change: '+5 pts', trend: 'up', helper: 'Auto-upload kiosk' }
    ],
    focusAreas: [
      { title: 'Check-In Velocity', description: 'All kiosks online, backup tablet tested at 09:25.', status: 'Healthy', indicator: 'Automation green' },
      { title: 'Insurance Verification', description: 'Two policies pending manual review due to coverage change.', status: 'Watch', indicator: 'Follow up by 12:00' },
      { title: 'Lobby Capacity', description: 'Peak occupancy hit 82%, overflow bay ready if >90%.', status: 'Healthy', indicator: 'Comfortable' }
    ],
    workflows: [
      { title: 'Arrival Triage', description: 'Scan QR, capture vitals, assign acuity color inside 4 minutes.', sla: 'SLA 04:00', lastUpdated: '09:10 today' },
      { title: 'No-Show Recovery', description: 'Auto-text patients after 5 mins, free slot or convert to telehealth.', sla: 'SLA 08:00', lastUpdated: '08:40 today' },
      { title: 'Document Intake', description: 'Validate coverage + consent packets before routing to nurses.', sla: 'SLA 10:00', lastUpdated: 'Yesterday' }
    ],
    actions: [
      { label: 'Open Live Queue', description: 'Jump to appointment agenda for walk-ins vs scheduled.', route: '/appointments', emphasis: 'primary' },
      { label: 'Check Patient File', description: 'Review demographics or upload IDs instantly.', route: '/patients' },
      { label: 'Escalate to AI', description: 'Send symptomatic patient to AI Insights review.', route: '/ai-insights' }
    ],
    queue: [
      { id: 'APT-9081', title: 'Pediatric fever', meta: 'Arrived 09:42 • Dr. Lin', eta: '07 min', priority: 'High' },
      { id: 'APT-9077', title: 'Chest pain walk-in', meta: 'Vitals flagged orange • needs ECG', eta: '02 min', priority: 'Critical' },
      { id: 'APT-9068', title: 'Insurance update', meta: 'Policy change • awaiting portal auth', eta: '15 min', priority: 'Medium' }
    ],
    alerts: [
      { title: 'MRI downtime', detail: 'Scanner recalibrating 11:30-13:00, reroute neuro follow-ups.', severity: 'warning', timestamp: '09:20', route: '/reports' },
      { title: 'Critical AI ping', detail: 'AI flagged sepsis risk for WALK-IN-221, prioritize vitals.', severity: 'critical', timestamp: '09:05', route: '/ai-insights' }
    ],
    screens: [
      { title: 'Check-In Board', description: 'Calendar/list toggle tuned for reception tablets.', route: '/appointments', badge: 'Live', icon: 'Calendar' },
      { title: 'Patient Cards', description: 'One-tap access to demographics + alerts.', route: '/patients', badge: 'AI Risk', icon: 'Users' },
      { title: 'Alerts Feed', description: 'Surface AI escalations without leaving desk.', route: '/ai-insights', badge: 'Critical', icon: 'Brain' }
    ],
    handoffNotes: [
      'Walk-in flu clinic begins 13:00, expect +12 arrivals.',
      'New kiosk firmware staged; deploy after evening shift.',
      'Security escorted visitor at 08:55 – incident logged in reports.'
    ]
  },
  {
    id: 'doctor-hospitalist',
    name: 'Attending Doctor',
    persona: 'Hospitalist leading interdisciplinary round teams',
    summary: 'Balances rounding, consult queue, and AI-driven risk reviews to keep quality metrics green.',
    shift: 'Core shift • 08:00 - 18:00 IST',
    status: '12 of 14 patients rounded',
    aiCopilot: 'Summarizes patient vitals, drafts progress notes, and highlights rising readmission risks.',
    metrics: [
      { label: 'Rounds Completed', value: '12 / 14', change: '+3 vs plan', trend: 'up', helper: 'ETA finish 14:10' },
      { label: 'Readmission Risk', value: '6 watchlist', change: '-2 week-over-week', trend: 'down', helper: '< 8 goal' },
      { label: 'Consult Queue', value: '5 pending', change: '+1 stat case', trend: 'up', helper: 'Avg wait 22 min' },
      { label: 'Documentation', value: '78% signed', change: '+9 pts', trend: 'up', helper: 'Lock charts by 17:00' }
    ],
    focusAreas: [
      { title: 'Sepsis Protocol', description: 'AI flagged two medium risks overnight – labs reviewed 07:30.', status: 'Watch', indicator: 'Labs pending' },
      { title: 'Discharge Planning', description: 'Three discharges awaiting pharmacy clearance.', status: 'Healthy', indicator: 'Meds ready 11:45' },
      { title: 'Consult SLA', description: 'Neuro consult aging at 26 min, target 20.', status: 'Watch', indicator: 'Pinged specialist' }
    ],
    workflows: [
      { title: 'Morning Rounds', description: 'AI prep packets + bedside updates, capture vitals + orders.', sla: 'Complete by 11:00', lastUpdated: 'Today' },
      { title: 'Alert Review', description: 'Review AI Insights > critical/high before lunch break.', sla: 'Twice daily', lastUpdated: 'Today' },
      { title: 'Evening Hand-off', description: 'Summarize outstanding consults + pending labs for night team.', sla: '17:45', lastUpdated: 'Yesterday' }
    ],
    actions: [
      { label: 'Doctor Directory', description: 'Check colleague availability & specialties.', route: '/doctors', emphasis: 'primary' },
      { label: 'Patient Timeline', description: 'Jump directly into AI-enhanced charts.', route: '/patients' },
      { label: 'AI Alerts Board', description: 'Triage predictive risk feed before rounds wrap.', route: '/ai-insights' }
    ],
    queue: [
      { id: 'CONS-7712', title: 'Neuro consult – stroke watch', meta: 'Ordered 09:05 • waiting labs', eta: '12 min', priority: 'High' },
      { id: 'DIS-5531', title: 'Discharge: Maria P.', meta: 'Needs med reconciliation + final note', eta: '30 min', priority: 'Medium' },
      { id: 'NOTE-8842', title: 'Progress note drafts', meta: 'AI prepared 4, awaiting signature', eta: '45 min', priority: 'Low' }
    ],
    alerts: [
      { title: 'Escalating vitals', detail: 'Patient P-1042 trending tachycardic; AI recommends repeat labs.', severity: 'critical', timestamp: '08:55', route: '/patients/P-1042' },
      { title: 'Consult SLA risk', detail: 'Ortho consult at 18 min; send nudge.', severity: 'warning', timestamp: '09:12', route: '/appointments' }
    ],
    screens: [
      { title: 'Doctor Performance', description: 'Availability, caseload, and completion rates.', route: '/doctors', badge: 'Productivity', icon: 'UserRound' },
      { title: 'Patient Insights', description: 'AI summaries, vitals, and labs per patient.', route: '/patients', badge: 'AI Brief', icon: 'Activity' },
      { title: 'AI Intelligence', description: 'Severity filters + recommendations feed.', route: '/ai-insights', badge: 'Critical', icon: 'Brain' }
    ],
    handoffNotes: [
      'Cardiology night fellow covering until 07:00 tomorrow.',
      'Remember to co-sign PGY-2 notes before 16:00.',
      'Two elective surgeries tomorrow – pre-op consult slots blocked.'
    ]
  },
  {
    id: 'pharmastest',
    name: 'Pharma/Test Coordinator',
    persona: 'Bridges pharmacy inventory and laboratory sample flow',
    summary: 'Keeps meds stocked, batches compound orders, and tracks lab turnaround so clinicians are never waiting.',
    shift: 'Swing shift • 10:00 - 19:00 IST',
    status: 'Inventory audit in progress',
    aiCopilot: 'Forecasts depletion curves, suggests vendor restock windows, and spots lab backlog risk.',
    metrics: [
      { label: 'Low-stock SKUs', value: '7', change: '-3 today', trend: 'down', helper: 'Auto-reorder triggered' },
      { label: 'Lab Turnaround', value: '58 min avg', change: '+6 min', trend: 'up', helper: 'Goal 45-50' },
      { label: 'Expiring Lots', value: '3 lots', change: 'No change', trend: 'up', helper: 'Use before 30 Apr' },
      { label: 'Compound Queue', value: '11 orders', change: '+2 urgent', trend: 'up', helper: 'Batching 14:00' }
    ],
    focusAreas: [
      { title: 'Antibiotic Stock', description: 'Ceftriaxone bins at 28% – vendor ETA 2 days.', status: 'Watch', indicator: 'Monitor deliveries' },
      { title: 'Lab Throughput', description: 'CBC analyzer recalibrated, cleared 15 backlog samples.', status: 'Healthy', indicator: 'Flow restored' },
      { title: 'Cold Chain', description: 'Fridge temp stable after overnight fluctuation.', status: 'Healthy', indicator: 'Sensors green' }
    ],
    workflows: [
      { title: 'Inventory Sweep', description: 'Daily RFID sweep + AI variance check.', sla: 'Start 10:15 • Finish 12:00', lastUpdated: 'Today' },
      { title: 'Lab Batch Transfer', description: 'Bundle specimens > deliver to analyzer in 15 min cycles.', sla: '15 min cadence', lastUpdated: 'Today' },
      { title: 'Recall Drill', description: 'Simulate recall pull-list once per week.', sla: 'Weekly Tue', lastUpdated: 'Tue' }
    ],
    actions: [
      { label: 'Pharmacy Dashboard', description: 'See stock cards and supplier statuses.', route: '/pharmacy', emphasis: 'primary' },
      { label: 'Lab Tracker', description: 'Monitor pending vs completed tests.', route: '/laboratory' },
      { label: 'Billing Impact', description: 'Confirm high-cost meds billed correctly.', route: '/billing' }
    ],
    queue: [
      { id: 'RX-4410', title: 'Chemo mix – STAT', meta: 'Dr. Rao • infusion bay 4', eta: '05 min', priority: 'Critical' },
      { id: 'LAB-8891', title: 'Blood culture batch', meta: '18 samples ready • load analyzer', eta: '10 min', priority: 'High' },
      { id: 'INV-3302', title: 'Cycle count follow-up', meta: 'OR satellite pharmacy', eta: '40 min', priority: 'Medium' }
    ],
    alerts: [
      { title: 'Refrigeration alert', detail: 'Cooler #3 hit 9°C for 3 min at 07:10, verify logs.', severity: 'warning', timestamp: '07:15', route: '/pharmacy' },
      { title: 'Vendor delay', detail: 'Saline bulk shipment arriving 24h late; adjust par levels.', severity: 'info', timestamp: '08:05', route: '/pharmacy' }
    ],
    screens: [
      { title: 'Pharmacy Inventory', description: 'Glass cards for meds, expirations, and suppliers.', route: '/pharmacy', badge: 'Stock', icon: 'Pill' },
      { title: 'Laboratory Queue', description: 'Severity-coded test tracker.', route: '/laboratory', badge: 'Queue', icon: 'FlaskConical' },
      { title: 'Revenue Watch', description: 'Billing KPIs for high-cost therapies.', route: '/billing', badge: 'Finance', icon: 'CreditCard' }
    ],
    handoffNotes: [
      'Fridge sensors recalibrated; next check at 14:00.',
      'Cx43 lot hits 30-day window Friday – prioritize usage.',
      'Lab courier on PTO; backup driver covering after 16:00.'
    ]
  }
];

export default roles;
