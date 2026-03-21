import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Calendar, Phone, Mail, Droplet, Brain, AlertTriangle,
  CheckCircle, Plus, MapPin, User, Activity, FlaskConical, Clock,
  Stethoscope, Heart, Thermometer, Wind, Weight, Sparkles
} from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { GlassBadge } from '../../components/ui/GlassBadge';
import { GlassModal } from '../../components/ui/GlassModal';
import { MedicalTimeline } from '../../components/timeline/MedicalTimeline';
import { ContextHelperRail } from '../../components/ai/ContextHelperRail';
import { db } from '../../data';
import type { MedicalRecord } from '../../types';

type TabId = 'overview' | 'history' | 'labs' | 'appointments';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <User className="w-4 h-4" /> },
  { id: 'history', label: 'Medical History', icon: <Stethoscope className="w-4 h-4" /> },
  { id: 'labs', label: 'Lab Results', icon: <FlaskConical className="w-4 h-4" /> },
  { id: 'appointments', label: 'Appointments', icon: <Calendar className="w-4 h-4" /> },
];

export const PatientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const patient = db.patients.find(p => p.id === id);
  const aiInsight = db.aiInsights.find(i => i.patientId === id);
  const patientAppointments = db.appointments.filter(a => a.patientId === id);

  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>(patient?.medicalHistory || []);
  const [isAddRecordModalOpen, setIsAddRecordModalOpen] = useState(false);
  const careGuideAgent = db.aiAgents.find(a => a.id === 'careguide-agent');

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
          <User className="w-10 h-10 text-white/20" />
        </div>
        <p className="text-white/50 text-lg">Patient not found</p>
        <GlassButton variant="primary" onClick={() => navigate('/patients')}>
          Back to Patients
        </GlassButton>
      </div>
    );
  }

  const [patientData, setPatientData] = useState(patient);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [contactDraft, setContactDraft] = useState({
    phone: patient.phone,
    email: patient.email,
    status: patient.status
  });

  useEffect(() => {
    setPatientData(patient);
    setContactDraft({
      phone: patient.phone,
      email: patient.email,
      status: patient.status
    });
  }, [patient]);

  const handleContactSave = () => {
    setPatientData(prev => ({ ...prev, ...contactDraft }));
    setIsEditingContact(false);
  };

  const handleAddRecord = (record: Partial<MedicalRecord>) => {
    const newRecord: MedicalRecord = {
      ...record,
      id: `MR${String(medicalRecords.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
    } as MedicalRecord;
    setMedicalRecords([newRecord, ...medicalRecords]);
    setIsAddRecordModalOpen(false);
  };

  const latestRecord = medicalRecords[0];
  const allLabResults = medicalRecords.flatMap(r =>
    (r.labResults || []).map(lab => ({ ...lab, date: r.date, diagnosis: r.diagnosis }))
  );
  const criticalLabs = allLabResults.filter(l => l.status === 'Critical');
  const helperInsights = careGuideAgent ? [
    {
      title: 'AI Risk Score',
      description: patientData.aiRiskScore
        ? `${patientData.aiRiskScore}/100 · ${patientData.status}`
        : 'No AI signal available',
      tag: 'Patient'
    },
    aiInsight
      ? {
          title: aiInsight.type,
          description: aiInsight.recommendations[0],
          tag: aiInsight.severity
        }
      : {
          title: 'Care Pathway',
          description: 'All follow-ups up to date'
        },
    {
      title: 'Upcoming Visits',
      description: patientAppointments.length
        ? `Next: ${patientAppointments[0].date} · ${patientAppointments[0].doctorName}`
        : 'No future visits scheduled'
    }
  ] : [];

  return (
    <div className="space-y-6 lg:flex lg:items-start lg:gap-6">
      <div className="flex-1 space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate('/patients')}
        className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm">Back to Patients</span>
      </button>

      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-white/50">
        {['Dashboard', 'Patients', patientData.name].map((crumb, index) => (
          <span key={crumb} className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-full border ${index === 2 ? 'border-violet-500/40 text-white' : 'border-white/15'}`}>
              {crumb}
            </span>
            {index < 2 && <span className="text-white/30">/</span>}
          </span>
        ))}
      </div>

      {/* Patient Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl">
        <div className={`
          absolute inset-0
          ${patientData.status === 'Critical' ? 'bg-gradient-to-r from-red-900/40 via-slate-900/60 to-slate-900/80' :
            patientData.aiRiskScore && patientData.aiRiskScore >= 40 ? 'bg-gradient-to-r from-amber-900/30 via-slate-900/60 to-slate-900/80' :
            'bg-gradient-to-r from-indigo-900/40 via-slate-900/60 to-slate-900/80'}
        `} />
        <div className="absolute inset-0 backdrop-blur-sm border border-white/10 rounded-3xl" />

        <div className="relative p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Avatar + Status */}
            <div className="relative flex-shrink-0">
              <img
                src={patientData.avatar}
                alt={patientData.name}
                className="w-24 h-24 md:w-32 md:h-32 rounded-3xl border-4 border-white/20 object-cover shadow-2xl"
              />
              <div className={`
                absolute -bottom-2 -right-2 px-2.5 py-1 rounded-full text-xs font-bold border-2 border-slate-900
                ${patientData.status === 'Active' ? 'bg-emerald-500 text-white' :
                  patientData.status === 'Critical' ? 'bg-red-500 text-white animate-pulse' :
                  'bg-gray-500 text-white'}
              `}>
                {patientData.status}
              </div>
            </div>

            {/* Core Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-white">{patientData.name}</h1>
                {patientData.status === 'Critical' && (
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 text-sm animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" /> Critical
                  </span>
                )}
              </div>
              <p className="text-white/50 text-sm mb-4">ID: {patientData.id} · Registered {patientData.registrationDate}</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-white/10">
                    <User className="w-3.5 h-3.5 text-white/60" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40">Age / Gender</p>
                    <p className="text-sm font-medium text-white">{patientData.age} yrs · {patientData.gender}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-red-500/20">
                    <Droplet className="w-3.5 h-3.5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40">Blood Group</p>
                    <p className="text-sm font-medium text-white">{patientData.bloodGroup}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-white/10">
                    <Phone className="w-3.5 h-3.5 text-white/60" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40">Phone</p>
                    {isEditingContact ? (
                      <input
                        value={contactDraft.phone}
                        onChange={(e) => setContactDraft(d => ({ ...d, phone: e.target.value }))}
                        className="w-full bg-white/5 border border-white/20 rounded-lg px-2 py-1 text-sm text-white"
                      />
                    ) : (
                      <p className="text-sm font-medium text-white">{patientData.phone}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-white/10">
                    <Mail className="w-3.5 h-3.5 text-white/60" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40">Email</p>
                    {isEditingContact ? (
                      <input
                        value={contactDraft.email}
                        onChange={(e) => setContactDraft(d => ({ ...d, email: e.target.value }))}
                        className="w-full bg-white/5 border border-white/20 rounded-lg px-2 py-1 text-sm text-white"
                      />
                    ) : (
                      <p className="text-sm font-medium text-white truncate">{patientData.email}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs text-white/40">Status</span>
                {isEditingContact ? (
                  <select
                    value={contactDraft.status}
                    onChange={(e) => setContactDraft(d => ({ ...d, status: e.target.value as typeof contactDraft.status }))}
                    className="bg-white/5 border border-white/20 rounded-lg px-2 py-1 text-sm text-white"
                  >
                    {['Active', 'Inactive', 'Critical'].map(option => (
                      <option key={option} value={option} className="bg-slate-900">
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <GlassBadge variant={patientData.status === 'Critical' ? 'danger' : patientData.status === 'Active' ? 'success' : 'default'}>
                    {patientData.status}
                  </GlassBadge>
                )}
                <GlassButton
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (isEditingContact) {
                      handleContactSave();
                    } else {
                      setIsEditingContact(true);
                    }
                  }}
                >
                  {isEditingContact ? 'Save' : 'Edit info'}
                </GlassButton>
                {isEditingContact && (
                  <GlassButton
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditingContact(false);
                      setContactDraft({
                        phone: patientData.phone,
                        email: patientData.email,
                        status: patientData.status
                      });
                    }}
                  >
                    Cancel
                  </GlassButton>
                )}
              </div>
            </div>

            {/* AI Risk Score */}
            {patientData.aiRiskScore !== undefined && (
              <div className="flex-shrink-0 w-full md:w-44">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-3">
                    <Brain className="w-4 h-4 text-violet-400" />
                    <span className="text-xs font-medium text-violet-300">AI Risk Score</span>
                    <Sparkles className="w-3 h-3 text-violet-400" />
                  </div>
                  <div className={`text-4xl font-bold mb-1 ${
                    patientData.aiRiskScore >= 70 ? 'text-red-400' :
                    patientData.aiRiskScore >= 40 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {patientData.aiRiskScore}
                    <span className="text-lg text-white/30">/100</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        patientData.aiRiskScore >= 70 ? 'bg-gradient-to-r from-red-500 to-rose-400' :
                        patientData.aiRiskScore >= 40 ? 'bg-gradient-to-r from-amber-500 to-orange-400' :
                        'bg-gradient-to-r from-emerald-500 to-teal-400'
                      }`}
                      style={{ width: `${patientData.aiRiskScore}%` }}
                    />
                  </div>
                  <span className={`text-xs font-medium ${
                    patientData.aiRiskScore >= 70 ? 'text-red-400' :
                    patientData.aiRiskScore >= 40 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {patientData.aiRiskScore >= 70 ? 'High Risk' : patientData.aiRiskScore >= 40 ? 'Moderate Risk' : 'Low Risk'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Latest Vitals Strip */}
          {latestRecord?.vitals && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-xs text-white/40 mb-3 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                Latest Vitals — {latestRecord.date}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {latestRecord.vitals.bloodPressure && (
                  <VitalChip icon={<Heart className="w-3.5 h-3.5 text-red-400" />} label="BP" value={latestRecord.vitals.bloodPressure} unit="mmHg" />
                )}
                {latestRecord.vitals.heartRate && (
                  <VitalChip icon={<Activity className="w-3.5 h-3.5 text-pink-400" />} label="Heart Rate" value={latestRecord.vitals.heartRate.toString()} unit="bpm" />
                )}
                {latestRecord.vitals.temperature && (
                  <VitalChip icon={<Thermometer className="w-3.5 h-3.5 text-orange-400" />} label="Temp" value={latestRecord.vitals.temperature.toString()} unit="°F" />
                )}
                {latestRecord.vitals.oxygenSaturation && (
                  <VitalChip icon={<Wind className="w-3.5 h-3.5 text-cyan-400" />} label="O₂ Sat" value={latestRecord.vitals.oxygenSaturation.toString()} unit="%" normal={latestRecord.vitals.oxygenSaturation >= 95} />
                )}
                {latestRecord.vitals.weight && (
                  <VitalChip icon={<Weight className="w-3.5 h-3.5 text-indigo-400" />} label="Weight" value={latestRecord.vitals.weight.toString()} unit="kg" />
                )}
                {latestRecord.vitals.height && (
                  <VitalChip icon={<User className="w-3.5 h-3.5 text-violet-400" />} label="Height" value={latestRecord.vitals.height.toString()} unit="cm" />
                )}
                {latestRecord.vitals.bmi && (
                  <VitalChip icon={<Activity className="w-3.5 h-3.5 text-teal-400" />} label="BMI" value={latestRecord.vitals.bmi.toString()} unit="" normal={latestRecord.vitals.bmi < 30} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex overflow-x-auto gap-1 p-1 bg-white/5 rounded-2xl border border-white/10 hide-scrollbar">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-5 py-2.5 rounded-xl whitespace-nowrap transition-all font-medium text-sm flex-shrink-0
              ${activeTab === tab.id
                ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/10'
              }
            `}
          >
            {tab.icon}
            {tab.label}
            {tab.id === 'labs' && criticalLabs.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center ml-1">
                {criticalLabs.length}
              </span>
            )}
            {tab.id === 'history' && (
              <span className="w-5 h-5 rounded-full bg-white/20 text-white text-xs flex items-center justify-center ml-1">
                {medicalRecords.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <OverviewTab patient={patientData} aiInsight={aiInsight} medicalRecords={medicalRecords} />
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white">Medical History</h3>
              <p className="text-white/50 text-sm">{medicalRecords.length} visits recorded</p>
            </div>
            <GlassButton variant="primary" size="sm" onClick={() => setIsAddRecordModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" />
              Add Record
            </GlassButton>
          </div>
          <MedicalTimeline records={medicalRecords} />
        </div>
      )}

      {activeTab === 'labs' && (
        <LabResultsTab allLabResults={allLabResults} />
      )}

      {activeTab === 'appointments' && (
        <AppointmentsTab appointments={patientAppointments} />
      )}

      {/* Add Record Modal */}
      <GlassModal
        isOpen={isAddRecordModalOpen}
        onClose={() => setIsAddRecordModalOpen(false)}
        title="Add Medical Record"
        size="lg"
      >
        <MedicalRecordForm
          onSubmit={handleAddRecord}
          onCancel={() => setIsAddRecordModalOpen(false)}
        />
      </GlassModal>
      </div>
      {careGuideAgent && (
        <ContextHelperRail
          agent={careGuideAgent}
          title="Care Guidance"
          insights={helperInsights}
          ctaLabel="Open CareGuide"
        />
      )}
    </div>
  );
};

// ─── Vital Chip ─────────────────────────────────────────────────────────────
const VitalChip: React.FC<{ icon: React.ReactNode; label: string; value: string; unit: string; normal?: boolean }> = ({
  icon, label, value, unit, normal = true
}) => (
  <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
    <div className="p-1.5 rounded-lg bg-white/10">{icon}</div>
    <div className="min-w-0">
      <p className="text-xs text-white/40 leading-none mb-0.5">{label}</p>
      <p className={`text-sm font-semibold leading-none ${normal ? 'text-white' : 'text-amber-400'}`}>
        {value} <span className="text-xs font-normal text-white/40">{unit}</span>
      </p>
    </div>
  </div>
);

// ─── Overview Tab ─────────────────────────────────────────────────────────────
const OverviewTab: React.FC<{
  patient: ReturnType<typeof db.patients.find>;
  aiInsight: ReturnType<typeof db.aiInsights.find>;
  medicalRecords: MedicalRecord[];
}> = ({ patient, aiInsight, medicalRecords }) => {
  if (!patient) return null;

  const currentMeds = medicalRecords.flatMap(r => r.medications);
  const uniqueMeds = [...new Set(currentMeds)];
  const latestRecord = medicalRecords[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column */}
      <div className="lg:col-span-2 space-y-6">
        {/* AI Insight Card */}
        {aiInsight && (
          <GlassCard className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-white">AI Clinical Analysis</h3>
                <Sparkles className="w-4 h-4 text-violet-400 ml-1" />
                <GlassBadge variant={aiInsight.severity === 'Critical' ? 'danger' : aiInsight.severity === 'High' ? 'warning' : 'info'} size="sm">
                  {aiInsight.severity}
                </GlassBadge>
              </div>
              <p className="text-white/80 text-sm mb-4 leading-relaxed">{aiInsight.description}</p>
              <div className="flex items-center gap-3 mb-4 p-2 rounded-lg bg-white/5">
                <span className="text-xs text-white/50">AI Confidence</span>
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-violet-500 rounded-full" style={{ width: `${aiInsight.confidence}%` }} />
                </div>
                <span className="text-sm font-semibold text-violet-400">{aiInsight.confidence}%</span>
              </div>
              {patient.aiRecommendations && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-white/50">AI Recommendations</p>
                  {patient.aiRecommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-sm text-white/75">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                      </div>
                      {rec}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </GlassCard>
        )}

        {/* Recent Visit Summary */}
        {latestRecord && (
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                Most Recent Visit
              </h3>
              <span className="text-sm text-white/50">{latestRecord.date}</span>
            </div>
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Stethoscope className="w-4 h-4 text-indigo-400" />
                <span className="font-semibold text-white">{latestRecord.diagnosis}</span>
                {latestRecord.visitType && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-white/10 text-white/60">
                    {latestRecord.visitType}
                  </span>
                )}
              </div>
              <p className="text-sm text-white/60 italic">"{latestRecord.notes}"</p>
            </div>
            {latestRecord.symptoms.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-white/40 mb-2">Symptoms Presented</p>
                <div className="flex flex-wrap gap-2">
                  {latestRecord.symptoms.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-full bg-white/10 text-white/70 text-xs">{s}</span>
                  ))}
                </div>
              </div>
            )}
            {latestRecord.followUpDate && (
              <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span className="text-sm text-white/60">Follow-up scheduled: </span>
                <span className="text-sm font-medium text-amber-400">{latestRecord.followUpDate}</span>
              </div>
            )}
          </GlassCard>
        )}
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        {/* Patient Details */}
        <GlassCard>
          <h3 className="font-semibold text-white mb-4">Patient Details</h3>
          <div className="space-y-3">
            <DetailRow icon={<MapPin className="w-4 h-4 text-white/40" />} label="Address" value={patient.address} />
            <DetailRow icon={<Calendar className="w-4 h-4 text-white/40" />} label="Registered" value={patient.registrationDate} />
            <DetailRow icon={<Clock className="w-4 h-4 text-white/40" />} label="Last Visit" value={patient.lastVisit} />
            <DetailRow icon={<Activity className="w-4 h-4 text-white/40" />} label="Total Visits" value={`${medicalRecords.length} visits`} />
          </div>
        </GlassCard>

        {/* Current Medications */}
        <GlassCard>
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <span>Current Medications</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">{uniqueMeds.length}</span>
          </h3>
          <div className="space-y-2">
            {uniqueMeds.length === 0 ? (
              <p className="text-white/40 text-sm">No active medications</p>
            ) : (
              uniqueMeds.slice(0, 6).map((med, i) => (
                <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                  <span className="text-sm text-white/80">{med}</span>
                </div>
              ))
            )}
          </div>
        </GlassCard>

        {/* Visit History Summary */}
        <GlassCard>
          <h3 className="font-semibold text-white mb-4">Visit Summary</h3>
          <div className="space-y-2">
            {['Emergency', 'Routine', 'Follow-up', 'Specialist', 'Preventive', 'Surgery'].map(type => {
              const count = medicalRecords.filter(r => r.visitType === type).length;
              if (count === 0) return null;
              return (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm text-white/60">{type}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${(count / medicalRecords.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-white w-4 text-right">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

const DetailRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 flex-shrink-0">{icon}</div>
    <div>
      <p className="text-xs text-white/40">{label}</p>
      <p className="text-sm text-white/80">{value}</p>
    </div>
  </div>
);

// ─── Lab Results Tab ───────────────────────────────────────────────────────────
const LabResultsTab: React.FC<{
  allLabResults: Array<{ parameter: string; value: string; unit: string; referenceRange: string; status: 'Normal' | 'Abnormal' | 'Critical'; date: string; diagnosis: string }>;
}> = ({ allLabResults }) => {
  const [filter, setFilter] = useState<'All' | 'Critical' | 'Abnormal' | 'Normal'>('All');

  const filtered = filter === 'All' ? allLabResults : allLabResults.filter(l => l.status === filter);

  const counts = {
    All: allLabResults.length,
    Critical: allLabResults.filter(l => l.status === 'Critical').length,
    Abnormal: allLabResults.filter(l => l.status === 'Abnormal').length,
    Normal: allLabResults.filter(l => l.status === 'Normal').length,
  };

  return (
    <div className="space-y-4">
      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {(['All', 'Critical', 'Abnormal', 'Normal'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`
              px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2
              ${filter === f
                ? f === 'Critical' ? 'bg-red-500 text-white' :
                  f === 'Abnormal' ? 'bg-amber-500 text-white' :
                  f === 'Normal' ? 'bg-emerald-500 text-white' :
                  'bg-indigo-500 text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10'
              }
            `}
          >
            {f}
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${filter === f ? 'bg-white/20' : 'bg-white/10'}`}>
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      {/* Lab Results Table */}
      <GlassCard padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="text-left text-xs font-medium text-white/50 px-5 py-3">Parameter</th>
                <th className="text-left text-xs font-medium text-white/50 px-5 py-3">Value</th>
                <th className="text-left text-xs font-medium text-white/50 px-5 py-3">Reference</th>
                <th className="text-left text-xs font-medium text-white/50 px-5 py-3">Status</th>
                <th className="text-left text-xs font-medium text-white/50 px-5 py-3">Visit</th>
                <th className="text-left text-xs font-medium text-white/50 px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-white/30">No lab results found</td>
                </tr>
              ) : (
                filtered.map((lab, i) => (
                  <tr key={i} className={`
                    transition-colors
                    ${lab.status === 'Critical' ? 'bg-red-500/5 hover:bg-red-500/10' :
                      lab.status === 'Abnormal' ? 'bg-amber-500/5 hover:bg-amber-500/10' :
                      'hover:bg-white/5'}
                  `}>
                    <td className="px-5 py-3">
                      <span className="text-sm font-medium text-white">{lab.parameter}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-sm font-bold ${
                        lab.status === 'Critical' ? 'text-red-400' :
                        lab.status === 'Abnormal' ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {lab.value} <span className="text-xs font-normal text-white/40">{lab.unit}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-white/50">{lab.referenceRange}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        lab.status === 'Critical' ? 'bg-red-500/20 text-red-400' :
                        lab.status === 'Abnormal' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {lab.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-white/50 max-w-[180px] truncate">{lab.diagnosis}</td>
                    <td className="px-5 py-3 text-xs text-white/50">{lab.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};

// ─── Appointments Tab ─────────────────────────────────────────────────────────
const AppointmentsTab: React.FC<{
  appointments: typeof db.appointments;
}> = ({ appointments }) => {
  if (appointments.length === 0) {
    return (
      <GlassCard className="text-center py-12">
        <Calendar className="w-12 h-12 text-white/20 mx-auto mb-3" />
        <p className="text-white/50">No appointments found for this patient</p>
      </GlassCard>
    );
  }
  return (
    <div className="space-y-3">
      {appointments.map(apt => (
        <GlassCard key={apt.id} className="flex items-center gap-4">
          <div className={`
            w-2 self-stretch rounded-full flex-shrink-0
            ${apt.status === 'Scheduled' ? 'bg-indigo-500' :
              apt.status === 'Completed' ? 'bg-emerald-500' :
              apt.status === 'Cancelled' ? 'bg-red-500' : 'bg-amber-500'}
          `} />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-semibold text-white">{apt.date} at {apt.time}</span>
              <GlassBadge variant={
                apt.status === 'Completed' ? 'success' :
                apt.status === 'Cancelled' ? 'danger' :
                apt.status === 'No-Show' ? 'warning' : 'primary'
              } size="sm">{apt.status}</GlassBadge>
              {apt.type === 'Video' && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-violet-500/20 text-violet-400">Video</span>
              )}
            </div>
            <p className="text-sm text-white/60">Dr. {apt.doctorName} · {apt.specialty}</p>
            {apt.notes && <p className="text-xs text-white/40 mt-1 italic">"{apt.notes}"</p>}
          </div>
        </GlassCard>
      ))}
    </div>
  );
};

// ─── Medical Record Form ──────────────────────────────────────────────────────
interface MedicalRecordFormProps {
  onSubmit: (record: Partial<MedicalRecord>) => void;
  onCancel: () => void;
}

const MedicalRecordForm: React.FC<MedicalRecordFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<MedicalRecord>>({
    diagnosis: '', symptoms: [], medications: [], doctorId: '', notes: '', visitType: 'Routine',
  });
  const [symptomInput, setSymptomInput] = useState('');
  const [medicationInput, setMedicationInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSubmit(formData); };

  const addSymptom = () => {
    if (symptomInput.trim()) {
      setFormData(prev => ({ ...prev, symptoms: [...(prev.symptoms || []), symptomInput.trim()] }));
      setSymptomInput('');
    }
  };
  const addMedication = () => {
    if (medicationInput.trim()) {
      setFormData(prev => ({ ...prev, medications: [...(prev.medications || []), medicationInput.trim()] }));
      setMedicationInput('');
    }
  };

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:bg-white/10 focus:border-white/30 text-white placeholder:text-white/40 transition-all";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-white/60 mb-1.5">Diagnosis *</label>
          <input value={formData.diagnosis} onChange={e => setFormData(p => ({ ...p, diagnosis: e.target.value }))} className={inputCls} placeholder="Enter diagnosis" required />
        </div>
        <div>
          <label className="block text-xs font-medium text-white/60 mb-1.5">Visit Type</label>
          <select value={formData.visitType} onChange={e => setFormData(p => ({ ...p, visitType: e.target.value as MedicalRecord['visitType'] }))}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:bg-white/10 focus:border-white/30">
            {['Emergency', 'Routine', 'Follow-up', 'Specialist', 'Surgery', 'Preventive'].map(v => (
              <option key={v} value={v} className="bg-slate-900">{v}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-white/60 mb-1.5">Doctor ID *</label>
          <input value={formData.doctorId} onChange={e => setFormData(p => ({ ...p, doctorId: e.target.value }))} className={inputCls} placeholder="e.g. D001" required />
        </div>
      </div>

      {/* Symptoms */}
      <div>
        <label className="block text-xs font-medium text-white/60 mb-1.5">Symptoms</label>
        <div className="flex gap-2 mb-2">
          <input value={symptomInput} onChange={e => setSymptomInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSymptom())}
            className={`flex-1 ${inputCls}`} placeholder="Type and press Enter" />
          <button type="button" onClick={addSymptom} className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm transition-colors">Add</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.symptoms?.map((s, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-white/10 text-white">
              {s} <button type="button" onClick={() => setFormData(p => ({ ...p, symptoms: p.symptoms?.filter((_, j) => j !== i) }))} className="text-white/40 hover:text-white ml-1">×</button>
            </span>
          ))}
        </div>
      </div>

      {/* Medications */}
      <div>
        <label className="block text-xs font-medium text-white/60 mb-1.5">Medications</label>
        <div className="flex gap-2 mb-2">
          <input value={medicationInput} onChange={e => setMedicationInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addMedication())}
            className={`flex-1 ${inputCls}`} placeholder="Type and press Enter" />
          <button type="button" onClick={addMedication} className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm transition-colors">Add</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.medications?.map((m, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-emerald-500/20 text-emerald-300">
              {m} <button type="button" onClick={() => setFormData(p => ({ ...p, medications: p.medications?.filter((_, j) => j !== i) }))} className="text-emerald-400/50 hover:text-emerald-300 ml-1">×</button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-white/60 mb-1.5">Follow-up Date</label>
        <input type="date" value={formData.followUpDate || ''} onChange={e => setFormData(p => ({ ...p, followUpDate: e.target.value }))}
          className={inputCls} />
      </div>

      <div>
        <label className="block text-xs font-medium text-white/60 mb-1.5">Clinical Notes</label>
        <textarea value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
          className={`${inputCls} resize-none`} rows={3} placeholder="Additional clinical notes..." />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <GlassButton type="button" variant="ghost" onClick={onCancel}>Cancel</GlassButton>
        <GlassButton type="submit" variant="primary">Add Record</GlassButton>
      </div>
    </form>
  );
};
