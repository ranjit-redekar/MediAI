import type { AIInsight, DashboardStats, AIAgent } from '../types';

export const aiInsights: AIInsight[] = [
  {
    id: 'AI001',
    patientId: 'P004',
    type: 'Risk Assessment',
    confidence: 87,
    description: 'High risk of stroke detected based on AFib pattern and age factors',
    recommendations: [
      'Immediate anticoagulation therapy',
      'Cardiology consultation within 48 hours',
      'Continuous cardiac monitoring recommended'
    ],
    createdAt: '2024-03-02T10:30:00Z',
    severity: 'Critical',
    agentId: 'quickcheck-agent'
  },
  {
    id: 'AI002',
    patientId: 'P002',
    type: 'Anomaly Detection',
    confidence: 92,
    description: 'Blood pressure readings show concerning upward trend over past 3 visits',
    recommendations: [
      'Increase monitoring frequency to twice daily',
      'Consider medication adjustment',
      'Lifestyle modification counseling'
    ],
    createdAt: '2024-02-28T14:15:00Z',
    severity: 'High',
    agentId: 'quickcheck-agent'
  },
  {
    id: 'AI003',
    patientId: 'P005',
    type: 'Treatment Recommendation',
    confidence: 85,
    description: 'HbA1c levels suggest need for treatment intensification',
    recommendations: [
      'Add GLP-1 agonist to current regimen',
      'Diabetes education program enrollment',
      'Nutritionist consultation'
    ],
    createdAt: '2024-02-25T09:45:00Z',
    severity: 'Medium',
    agentId: 'careguide-agent'
  },
  {
    id: 'AI004',
    patientId: 'P008',
    type: 'Diagnosis Support',
    confidence: 89,
    description: 'Lipid panel indicates high cardiovascular risk',
    recommendations: [
      'High-intensity statin therapy indicated',
      'Lifestyle intervention program',
      '6-week follow-up for lipid recheck'
    ],
    createdAt: '2024-03-05T11:20:00Z',
    severity: 'High',
    agentId: 'trendwatch-agent'
  },
  {
    id: 'AI005',
    patientId: 'P003',
    type: 'Risk Assessment',
    confidence: 78,
    description: 'Low risk pregnancy progression. All markers within normal range.',
    recommendations: [
      'Continue routine prenatal care',
      'Schedule glucose screening at 24 weeks',
      'Maintain current nutrition plan'
    ],
    createdAt: '2024-03-03T16:00:00Z',
    severity: 'Low',
    agentId: 'careguide-agent'
  },
  {
    id: 'AI006',
    patientId: 'P006',
    type: 'Diagnosis Support',
    confidence: 81,
    description: 'Pattern analysis suggests mechanical rather than inflammatory back pain',
    recommendations: [
      'Physical therapy referral',
      'Core strengthening exercises',
      'Ergonomics assessment'
    ],
    createdAt: '2024-03-04T13:30:00Z',
    severity: 'Medium',
    agentId: 'shiftguide-agent'
  }
];

export const dashboardStats: DashboardStats = {
  totalPatients: 2847,
  totalDoctors: 48,
  todayAppointments: 24,
  pendingBills: 18,
  monthlyRevenue: 125840,
  patientGrowth: 12.5,
  appointmentGrowth: 8.3,
  revenueGrowth: 15.2
};

export const revenueChartData = [
  { month: 'Jan', revenue: 98000, appointments: 420 },
  { month: 'Feb', revenue: 105000, appointments: 450 },
  { month: 'Mar', revenue: 112000, appointments: 480 },
  { month: 'Apr', revenue: 108000, appointments: 465 },
  { month: 'May', revenue: 118000, appointments: 510 },
  { month: 'Jun', revenue: 125840, appointments: 542 }
];

export const patientDemographics = [
  { name: '0-18', value: 320, color: '#6366f1' },
  { name: '19-35', value: 680, color: '#06b6d4' },
  { name: '36-50', value: 850, color: '#8b5cf6' },
  { name: '51-65', value: 620, color: '#10b981' },
  { name: '65+', value: 377, color: '#f59e0b' }
];

export const departmentDistribution = [
  { name: 'General Medicine', value: 35 },
  { name: 'Cardiology', value: 18 },
  { name: 'Orthopedics', value: 15 },
  { name: 'Pediatrics', value: 12 },
  { name: 'OB/GYN', value: 10 },
  { name: 'Others', value: 10 }
];

export const recentActivities = [
  { id: 1, type: 'appointment', description: 'New appointment scheduled', patient: 'Sarah Johnson', time: '10 minutes ago' },
  { id: 2, type: 'lab', description: 'Lab results completed', patient: 'Michael Chen', time: '25 minutes ago' },
  { id: 3, type: 'billing', description: 'Payment received', patient: 'Emily Rodriguez', time: '1 hour ago' },
  { id: 4, type: 'ai', description: 'AI alert: High risk patient', patient: 'Robert Williams', time: '1 hour ago' },
  { id: 5, type: 'appointment', description: 'Appointment completed', patient: 'Amanda Thompson', time: '2 hours ago' }
];

export const aiAgents: AIAgent[] = [
  {
    id: 'quickcheck-agent',
    name: 'QuickCheckAgent',
    focus: 'Clinical Triage',
    description: 'Scans intake vitals and visit reasons to escalate unstable patients before the exam room.',
    status: 'Online',
    statusMessage: 'Watching triage queue (6 patients)',
    lastUpdated: '2 minutes ago',
    metrics: [
      { label: 'Watchlist', value: '6 patients', helper: '+2 vs yesterday', trend: 'up' },
      { label: 'Average response', value: '1.4s' },
      { label: 'Escalations today', value: '3 cases' }
    ],
    highlights: [
      'Flagged 2 stroke-risk patients within 90 seconds',
      'Auto-ordered STAT labs for one trauma arrival'
    ],
    primaryAction: 'Review triage queue',
    viewBook: {
      tagline: 'Frontline triage intelligence for every intake bay.',
      mission: 'Deliver proactive stabilization by detecting deterioration cues the moment a patient registers.',
      promise: 'No patient with red-flag vitals waits unseen.',
      pillars: [
        { title: 'Signal-first Intake', description: 'Continuously ingests vitals, symptoms, and nurse notes within 3 seconds of capture.', badge: 'Live feed' },
        { title: 'Risk Escalation Tree', description: 'Maps AI risk bands to hospital escalation ladders so handoffs are effortless.', badge: 'Built-in SOP' },
        { title: 'Action Orchestration', description: 'Auto-creates tasks—STAT labs, stroke code text, trauma page—based on severity.', badge: 'Hands-free' }
      ],
      workflows: [
        { title: 'Rapid vitals sweep', description: 'Analyzes BP/HR/SpO₂ streams for shock or neuro deficits.', impact: 'Alerts charge nurse + auto-orders labs', metric: '1.4s avg response' },
        { title: 'Symptom triage chat', description: 'Parses intake text for stroke phrases and chest-pain clusters.', impact: 'Pages stroke team with NIHSS pre-check', metric: '6 cases daily' },
        { title: 'Escalation huddle', description: 'Bundles flagged patients into a rolling huddle card for attending review.', impact: 'Keeps MD decisions under 2 min', metric: '6 watchlist pts' }
      ],
      successStories: [
        { title: 'Stroke door-to-needle', result: '15% faster', detail: 'Proactively escalated two AFib seniors before classic symptoms surfaced.' },
        { title: 'Sepsis detection', result: '3 hrs earlier', detail: 'Flagged lactic trend + fever for trauma patient; antibiotics started on arrival.' }
      ],
      timeline: [
        { phase: '08:15 · Intake sync', detail: 'Pulled EMS vitals + travel history for inbound trauma.', timestamp: '08:15' },
        { phase: '08:17 · Escalation', detail: 'Triggered Stroke Code Amber for NIHSS 5 suspicion.', timestamp: '08:17' },
        { phase: '08:20 · Action Pack', detail: 'Auto-sent STAT CT order + lab bundle to radiology.', timestamp: '08:20' }
      ]
    }
  },
  {
    id: 'careguide-agent',
    name: 'CareGuideAgent',
    focus: 'Chronic Care Pathways',
    description: 'Keeps long-term care plans on track with reminders for follow-ups, labs, and education.',
    status: 'Monitoring',
    statusMessage: 'Tracking 148 active care plans',
    lastUpdated: '5 minutes ago',
    metrics: [
      { label: 'Gaps resolved', value: '12 this week', helper: '-3 vs last week', trend: 'down' },
      { label: 'Overdue tasks', value: '14 patients' },
      { label: 'Engagement', value: '88%' }
    ],
    highlights: [
      'Triggered outreach for CHF cohort after missed visit',
      'Scheduled 4 diabetes nutrition consults automatically'
    ],
    primaryAction: 'Open care plans',
    viewBook: {
      tagline: 'Companion intelligence for every chronic journey.',
      mission: 'Coordinate care-plan tasks across teams so no chronic patient slips through the cracks.',
      promise: 'Every pathway step is acknowledged, nudged, and documented.',
      pillars: [
        { title: 'Longitudinal Memory', description: 'Unifies med lists, notes, and wearables into a single narrative.', badge: '148 plans' },
        { title: 'Behavioral Nudges', description: 'Prioritizes empathetic scripts for nursing, pharmacy, and outreach staff.', badge: '88% engagement' },
        { title: 'Outcome Tracking', description: 'Monitors biomarkers, PROs, and med adherence to prove impact.', badge: '12 gaps closed' }
      ],
      workflows: [
        { title: 'Gap sweeps', description: 'Nightly check for overdue labs, visits, or education steps.', impact: 'Auto-creates outreach queue', metric: '14 patients flagged' },
        { title: 'Care companion SMS', description: 'Friendly, multilingual reminders triggered off the plan cadence.', impact: 'Boosts adherence by 9 points', metric: '1.2k nudges/mo' },
        { title: 'Team briefing', description: 'Generates weekly pathway PDF with color-coded risk bands.', impact: 'Saves 4 hrs manual prep', metric: 'Delivered Mondays' }
      ],
      successStories: [
        { title: 'CHF readmission drop', result: '-11%', detail: 'Guided diuretic titration follow-ups with pharmacists + nurses.' },
        { title: 'Diabetes bundle', result: '4 consults booked', detail: 'Auto-scheduled nutrition + foot exam after HbA1c spike alerts.' }
      ],
      timeline: [
        { phase: 'Mon · Cohort scan', detail: 'Detected 9 CHF patients without week-4 labs.', timestamp: '09:00' },
        { phase: 'Tue · Outreach sprint', detail: 'Auto-drafted bilingual SMS/email for each patient.', timestamp: '13:00' },
        { phase: 'Thu · Clinician sync', detail: 'Summarized responses + adherence percent in huddle card.', timestamp: '17:30' }
      ]
    }
  },
  {
    id: 'trendwatch-agent',
    name: 'TrendWatchAgent',
    focus: 'Population Surveillance',
    description: 'Aggregates labs and encounters to warn about emerging community health trends.',
    status: 'Online',
    statusMessage: 'Monitoring 5 priority conditions',
    lastUpdated: '8 minutes ago',
    metrics: [
      { label: 'Signals detected', value: '3 this week', helper: 'Respiratory uptick', trend: 'up' },
      { label: 'Coverage', value: '2.8k patients' },
      { label: 'Lead time', value: '3 days earlier' }
    ],
    highlights: [
      'RSV-like symptoms rising in pediatrics (+18%)',
      'Orthopedic post-op infections trending down'
    ],
    primaryAction: 'View cohort briefing',
    viewBook: {
      tagline: 'Population sentry across every service line.',
      mission: 'Surface epidemiologic shifts before they overwhelm clinics and supply chains.',
      promise: '48-hour lead time on emerging patient cohorts.',
      pillars: [
        { title: 'Multisource Feeds', description: 'Combines labs, chief complaints, LOS, and pharmacy queries.', badge: '5 priority cond.' },
        { title: 'Anomaly Radar', description: 'Detects statistically significant spikes with explainable charts.', badge: '+18% RSV alert' },
        { title: 'Action Briefings', description: 'Auto-builds memos with recommended staffing + supply moves.', badge: 'Weekly digest' }
      ],
      workflows: [
        { title: 'Cohort modeling', description: 'Clusters patients by age, location, diagnosis drift.', impact: 'Highlights hot spots early', metric: '2.8k pts monitored' },
        { title: 'Resource advisory', description: 'Maps surges to PPE, ventilator, or bed supply suggestions.', impact: 'Preps ops for demand', metric: '3 signals/week' },
        { title: 'Leaderboard handoff', description: 'Sends summary cards to pediatrics, ED, and admin execs.', impact: 'Keeps leadership aligned', metric: '5 teams subscribed' }
      ],
      successStories: [
        { title: 'RSV surge notice', result: '3 days early', detail: 'Pediatrics opened flex clinic before weekend spike.' },
        { title: 'Orthopedic SSI drop', result: '-22%', detail: 'Flagged instrument tray contamination cluster for Sterile Processing.' }
      ],
      timeline: [
        { phase: 'Week 1 · Signal', detail: 'Detected 18% RSV uptick in ages <6 across two clinics.', timestamp: 'Week 1' },
        { phase: 'Week 2 · Advisory', detail: 'Recommended surge staffing + suction kits; implemented by leadership.', timestamp: 'Week 2' },
        { phase: 'Week 3 · Outcome', detail: 'Visits managed without divert status; inventory burn within plan.', timestamp: 'Week 3' }
      ]
    }
  },
  {
    id: 'revenueguard-agent',
    name: 'RevenueGuardAgent',
    focus: 'Revenue Cycle',
    description: 'Audits claims, pharmacy stock, and coding patterns to prevent denials and stockouts.',
    status: 'Online',
    statusMessage: 'No critical denials pending',
    lastUpdated: '12 minutes ago',
    metrics: [
      { label: 'At-risk claims', value: '5 charts', helper: 'Coding edit ready' },
      { label: 'Denial rate', value: '1.8%', trend: 'down' },
      { label: 'Inventory alerts', value: '2 drugs' }
    ],
    highlights: [
      'Flagged missing modifier on cardiology bundle',
      'Predicted ceftriaxone shortage in 4 days'
    ],
    primaryAction: 'Review revenue tasks',
    viewBook: {
      tagline: 'Financial vigilance meets clinical context.',
      mission: 'Eliminate surprise denials and inventory stockouts with proactive analytics.',
      promise: 'Every dollar justified before it leaves the EMR.',
      pillars: [
        { title: 'Claim Foresight', description: 'Runs payer-specific edits moments after visit sign-off.', badge: '1.8% denial rate' },
        { title: 'Coding Copilot', description: 'Suggests modifiers and bundling to meet documentation rules.', badge: '5 charts flagged' },
        { title: 'Inventory Sentinel', description: 'Projects pharmacy burn vs. deliveries to avoid shortages.', badge: '2 drugs alert' }
      ],
      workflows: [
        { title: 'Pre-bill scrub', description: 'Crosswalks CPT/ICD combos with payer rules + medical necessity lists.', impact: 'Saves 3 follow-up touches/claim', metric: '92% clean rate' },
        { title: 'Denial simulator', description: 'Scores every encounter for payment risk and surfaces remediator steps.', impact: 'Focuses coders on high-yield fixes', metric: '5 active edits' },
        { title: 'Pharmacy burn-down', description: 'Models drug usage vs. delivery schedules for top therapeutics.', impact: 'Prevents out-of-stock and rush fees', metric: '4-day horizon' }
      ],
      successStories: [
        { title: 'Cath lab bundle', result: '$32K saved', detail: 'Caught missing -XU modifier before transmission.' },
        { title: 'ABX shortage avoided', result: 'No cancellations', detail: 'Forecasted ceftriaxone burn; expedited order mid-week.' }
      ],
      timeline: [
        { phase: 'Daily · Scrub', detail: 'Reviewed 68 encounters, flagged 5 coding edits.', timestamp: '07:30' },
        { phase: 'Midweek · Finance brief', detail: 'Shared cash-flow outlook + denial trends with CFO.', timestamp: '14:00' },
        { phase: 'Weekly · Pharmacy sync', detail: 'Compared usage vs. supplier ETAs for top 10 drugs.', timestamp: 'Friday' }
      ]
    }
  },
  {
    id: 'shiftguide-agent',
    name: 'ShiftGuideAgent',
    focus: 'Staffing Optimization',
    description: 'Analyzes rosters, acuity, and no-show patterns to recommend coverage adjustments.',
    status: 'Idle',
    statusMessage: 'Awaiting next schedule upload',
    lastUpdated: '20 minutes ago',
    metrics: [
      { label: 'Adjustments queued', value: '3 swaps' },
      { label: 'Coverage risk', value: 'Low', helper: 'Night shift stable' },
      { label: 'Predicted wait', value: '11 mins', trend: 'down' }
    ],
    highlights: [
      'Suggested telehealth block to absorb no-shows',
      'Pairing new NP with senior hospitalist for ICU'
    ],
    primaryAction: 'Open staffing board',
    viewBook: {
      tagline: 'Orchestrating coverage with predictive calm.',
      mission: 'Blend acuity, no-show probabilities, and skill mix to keep every unit resourced.',
      promise: 'Right clinician, right hour, zero scrambling.',
      pillars: [
        { title: 'Acuity Forecasting', description: 'Looks at admissions, LOS, and vent usage to predict workload.', badge: '11 min waits' },
        { title: 'Smart Rostering', description: 'Balances senior/junior staff, specialties, and PTO windows.', badge: '3 swaps ready' },
        { title: 'Playbook Library', description: 'Offers templates for surge clinics, telehealth shifts, backup pools.', badge: 'Reusable' }
      ],
      workflows: [
        { title: 'Daily huddle insights', description: 'Summarizes staffing risk for each pod with mitigation ideas.', impact: 'Gives leaders a 12h head start', metric: 'Coverage risk: Low' },
        { title: 'Swap recommender', description: 'Suggests equitable trade pairs with compliance checks.', impact: 'Cuts manual texting', metric: '3 swaps queued' },
        { title: 'Virtual load balancer', description: 'Allocates telehealth NPs when no-show probability spikes.', impact: 'Keeps visit volume steady', metric: '-9% idle time' }
      ],
      successStories: [
        { title: 'ED surge night', result: 'Waits <20 min', detail: 'Activated backup hospitalist + telehealth pod automatically.' },
        { title: 'ICU mentorship', result: 'New NP ramped fast', detail: 'Matched with senior partner per agent recommendation.' }
      ],
      timeline: [
        { phase: '05:00 · Forecast', detail: 'Projected 18% higher admits due to RSV alert feed.', timestamp: '05:00' },
        { phase: '09:00 · Swap plan', detail: 'Suggested two cross-cover trades + one surge incentive slot.', timestamp: '09:00' },
        { phase: '15:00 · Debrief', detail: 'Verified coverage and updated leadership scoreboard.', timestamp: '15:00' }
      ]
    }
  }
];
