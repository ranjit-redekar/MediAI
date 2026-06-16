import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Calendar, Phone, Mail, Droplet, Brain, AlertTriangle,
  CheckCircle, Plus, MapPin, User, Activity, FlaskConical, Clock,
  Stethoscope, Heart, Thermometer, Wind, Weight, Sparkles,
  CalendarPlus, FileText, Pill, ShieldAlert, TrendingUp, ExternalLink, ArrowRight, Pencil,
  ChevronDown, Video, UserRound
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { GlassBadge } from '../../components/ui/GlassBadge';
import { MedicalTimeline } from '../../components/timeline/MedicalTimeline';
import { usePatients } from '../../context/PatientsContext';
import { db } from '../../data';
import { cn } from '../../utils/cn';
import type { AIAgent, Appointment, MedicalRecord, Patient } from '../../types';

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

  const { getPatient } = usePatients();
  const patient = getPatient(id ?? '');
  const aiInsight = db.aiInsights.find(i => i.patientId === id);
  const patientAppointments = db.appointments.filter(a => a.patientId === id);

  const [activeTab, setActiveTab] = useState<TabId>('overview');
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

  const medicalRecords = patient.medicalHistory ?? [];
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

  const latestRecord = medicalRecords[0];
  const allLabResults = medicalRecords.flatMap(r =>
    (r.labResults || []).map(lab => ({ ...lab, date: r.date, diagnosis: r.diagnosis }))
  );
  const criticalLabs = allLabResults.filter(l => l.status === 'Critical');

  return (
    <div className="space-y-6">
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
        <div className="absolute inset-0 glass-card rounded-3xl" />
        <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r to-transparent ${
          patientData.status === 'Critical' ? 'from-red-500/20 via-red-500/[0.05]' :
          patientData.aiRiskScore && patientData.aiRiskScore >= 40 ? 'from-amber-500/20 via-amber-500/[0.05]' :
          'from-indigo-500/15 via-violet-500/[0.06]'}`} />

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
                <h1 className="text-2xl sm:text-[28px] font-bold text-app tracking-tight">{patientData.name}</h1>
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

      {/* Tab Navigation + Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
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
      <div className="flex flex-wrap items-center gap-2">
        <GlassButton variant="primary" size="sm" onClick={() => navigate(`/patients/${patient.id}/records/new`)}>
          <FileText className="w-4 h-4 mr-1.5" /> Add Record
        </GlassButton>
        <GlassButton variant="ghost" size="sm" onClick={() => navigate('/appointments/new')}>
          <CalendarPlus className="w-4 h-4 mr-1.5" /> New Appointment
        </GlassButton>
        <GlassButton variant="ghost" size="sm" onClick={() => navigate(`/patients/${patient.id}/edit`)}>
          <Pencil className="w-4 h-4 mr-1.5" /> Edit
        </GlassButton>
      </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <OverviewTab
          patient={patientData}
          aiInsight={aiInsight}
          medicalRecords={medicalRecords}
          appointments={patientAppointments}
          careGuideAgent={careGuideAgent}
        />
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white">Medical History</h3>
              <p className="text-white/50 text-sm">{medicalRecords.length} visits recorded</p>
            </div>
            <GlassButton variant="primary" size="sm" onClick={() => navigate(`/patients/${patient.id}/records/new`)}>
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
        <AppointmentsTab appointments={patientAppointments} records={medicalRecords} />
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
  patient: Patient | undefined;
  aiInsight: ReturnType<typeof db.aiInsights.find>;
  medicalRecords: MedicalRecord[];
  appointments: Appointment[];
  careGuideAgent: AIAgent | undefined;
}> = ({ patient, aiInsight, medicalRecords, appointments, careGuideAgent }) => {
  const navigate = useNavigate();
  if (!patient) return null;

  const uniqueMeds = [...new Set(medicalRecords.flatMap(r => r.medications))];
  const conditions = [...new Set(medicalRecords.map(r => r.diagnosis).filter(Boolean))];
  const latestRecord = medicalRecords[0];
  const vitalsSeries = [...medicalRecords].reverse()
    .filter(r => r.vitals?.heartRate)
    .map(r => ({
      date: r.date.slice(5),
      hr: r.vitals?.heartRate ?? 0,
      o2: r.vitals?.oxygenSaturation ?? 0,
      weight: r.vitals?.weight ?? 0
    }));

  return (
    <div className="space-y-6">
      {/* Health Trends — full-width premium chart */}
      {vitalsSeries.length > 1 && (
        <HealthTrends data={vitalsSeries} latest={latestRecord} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Primary column */}
        <div className="lg:col-span-2 space-y-6">
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
                  <GlassBadge variant={aiInsight.severity === 'Critical' ? 'danger' : aiInsight.severity === 'High' ? 'warning' : 'info'} size="sm" className="ml-auto">
                    {aiInsight.severity}
                  </GlassBadge>
                </div>
                <p className="text-white/80 text-sm mb-4 leading-relaxed">{aiInsight.description}</p>
                <div className="flex items-center gap-3 mb-4 p-2.5 rounded-xl bg-white/5">
                  <span className="text-xs text-white/50">AI Confidence</span>
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-400 rounded-full" style={{ width: `${aiInsight.confidence}%` }} />
                  </div>
                  <span className="text-sm font-semibold text-violet-400">{aiInsight.confidence}%</span>
                </div>
                {patient.aiRecommendations && (
                  <div className="grid sm:grid-cols-2 gap-2">
                    {patient.aiRecommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-sm text-white/75 p-2.5 rounded-xl bg-white/5 border border-white/10">
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
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Stethoscope className="w-4 h-4 text-indigo-400" />
                  <span className="font-semibold text-white">{latestRecord.diagnosis}</span>
                  {latestRecord.visitType && (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-white/10 text-white/60">{latestRecord.visitType}</span>
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
                  <span className="text-sm text-white/60">Follow-up scheduled:</span>
                  <span className="text-sm font-medium text-amber-400">{latestRecord.followUpDate}</span>
                </div>
              )}
            </GlassCard>
          )}

          {/* Visit Summary */}
          {medicalRecords.length > 0 && (
            <GlassCard>
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                Visit Summary
                <span className="text-xs text-white/40 font-normal ml-auto">{medicalRecords.length} total visits</span>
              </h3>
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
                {['Emergency', 'Routine', 'Follow-up', 'Specialist', 'Preventive', 'Surgery'].map(type => {
                  const count = medicalRecords.filter(r => r.visitType === type).length;
                  if (count === 0) return null;
                  return (
                    <div key={type} className="flex items-center justify-between gap-3">
                      <span className="text-sm text-white/60 w-24">{type}</span>
                      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-400 rounded-full" style={{ width: `${(count / medicalRecords.length) * 100}%` }} />
                      </div>
                      <span className="text-sm font-semibold text-white w-4 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          )}
        </div>

        {/* Secondary column */}
        <div className="space-y-6">
          {/* Care Guidance */}
          {careGuideAgent && (
            <GlassCard className="bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5 border-violet-500/20">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-3">
                <Sparkles className="w-4 h-4 text-violet-300" />
                Care Guidance
              </div>
              <p className="text-base font-semibold text-white">{careGuideAgent.name}</p>
              <p className="text-sm text-white/50 mb-3">{careGuideAgent.focus}</p>
              <div className="flex items-center gap-2 text-xs text-white/50 mb-3">
                <GlassBadge variant="primary" size="sm">{careGuideAgent.status}</GlassBadge>
                <span className="truncate">{careGuideAgent.statusMessage}</span>
              </div>
              <GlassButton variant="ghost" size="sm" className="w-full" onClick={() => navigate(`/agents/${careGuideAgent.id}`)}>
                <ExternalLink className="w-3 h-3 mr-1" /> Open CareGuide
              </GlassButton>
            </GlassCard>
          )}

          {/* Patient Details */}
          <GlassCard>
            <h3 className="font-semibold text-white mb-4">Patient Details</h3>
            <div className="space-y-3">
              <DetailRow icon={<MapPin className="w-4 h-4 text-white/40" />} label="Address" value={patient.address} />
              <DetailRow icon={<Calendar className="w-4 h-4 text-white/40" />} label="Registered" value={patient.registrationDate} />
              <DetailRow icon={<Clock className="w-4 h-4 text-white/40" />} label="Last Visit" value={patient.lastVisit} />
              <DetailRow icon={<Droplet className="w-4 h-4 text-white/40" />} label="Blood Group" value={patient.bloodGroup} />
            </div>
          </GlassCard>

          {/* Conditions */}
          {conditions.length > 0 && (
            <GlassCard>
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                Conditions
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs ml-auto">{conditions.length}</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {conditions.slice(0, 8).map((c, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200/90 text-xs">{c}</span>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Current Medications */}
          <GlassCard>
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Pill className="w-4 h-4 text-emerald-400" />
              <span>Current Medications</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs ml-auto">{uniqueMeds.length}</span>
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

          {/* Upcoming Appointments */}
          <GlassCard>
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <CalendarPlus className="w-4 h-4 text-indigo-400" />
              Upcoming Appointments
            </h3>
            {appointments.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-white/40 text-sm mb-3">No upcoming appointments</p>
                <GlassButton variant="ghost" size="sm" onClick={() => navigate('/appointments/new')}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Schedule
                </GlassButton>
              </div>
            ) : (
              <div className="space-y-2">
                {appointments.slice(0, 3).map(apt => (
                  <button
                    key={apt.id}
                    onClick={() => navigate(`/appointments/${apt.id}/edit`)}
                    className="w-full text-left flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                      <Stethoscope className="w-4 h-4 text-indigo-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{apt.doctorName}</p>
                      <p className="text-xs text-white/40">{apt.date} · {apt.time}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

// ─── Health Trends chart ──────────────────────────────────────────────────────
const HealthTrends: React.FC<{
  data: { date: string; hr: number; o2: number; weight: number }[];
  latest?: MedicalRecord;
}> = ({ data, latest }) => {
  const v = latest?.vitals;
  const stats = [
    { label: 'Heart Rate', value: v?.heartRate ? `${v.heartRate}` : '—', unit: 'bpm', icon: <Heart className="w-4 h-4 text-rose-400" />, tint: 'bg-rose-500/15' },
    { label: 'Blood Pressure', value: v?.bloodPressure ?? '—', unit: 'mmHg', icon: <Activity className="w-4 h-4 text-indigo-400" />, tint: 'bg-indigo-500/15' },
    { label: 'Temperature', value: v?.temperature ? `${v.temperature}` : '—', unit: '°F', icon: <Thermometer className="w-4 h-4 text-orange-400" />, tint: 'bg-orange-500/15' },
    { label: 'O₂ Saturation', value: v?.oxygenSaturation ? `${v.oxygenSaturation}` : '—', unit: '%', icon: <Wind className="w-4 h-4 text-cyan-400" />, tint: 'bg-cyan-500/15' }
  ];
  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          Health Trends
        </h3>
        <span className="text-xs text-white/40">Heart rate across last {data.length} visits</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stat tiles */}
        <div className="grid grid-cols-2 gap-3 content-start">
          {stats.map(s => (
            <div key={s.label} className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <div className={`w-8 h-8 rounded-lg ${s.tint} flex items-center justify-center mb-2`}>{s.icon}</div>
              <p className="text-xs text-white/40">{s.label}</p>
              <p className="text-lg font-bold text-white leading-tight">{s.value} <span className="text-xs font-normal text-white/40">{s.unit}</span></p>
            </div>
          ))}
        </div>
        {/* Chart */}
        <div className="lg:col-span-2 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} domain={['dataMin - 8', 'dataMax + 8']} />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', fontSize: '12px' }}
                labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
              />
              <Area type="monotone" dataKey="hr" name="Heart rate" stroke="#fb7185" strokeWidth={2.5} fill="url(#hrGrad)" dot={{ r: 3, fill: '#fb7185' }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </GlassCard>
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
const aptStatusVariant = (status: string) =>
  status === 'Completed' ? 'success' : status === 'Cancelled' ? 'danger' : status === 'No-Show' ? 'warning' : 'primary';
const aptStripe = (status: string) =>
  status === 'Scheduled' ? 'bg-indigo-500' : status === 'Completed' ? 'bg-emerald-500' : status === 'Cancelled' ? 'bg-red-500' : 'bg-amber-500';

const AppointmentsTab: React.FC<{
  appointments: Appointment[];
  records: MedicalRecord[];
}> = ({ appointments, records }) => {
  const navigate = useNavigate();
  const [openId, setOpenId] = useState<string | null>(null);

  if (appointments.length === 0) {
    return (
      <GlassCard className="text-center py-12">
        <Calendar className="w-12 h-12 text-app-subtle opacity-50 mx-auto mb-3" />
        <p className="text-app-muted">No appointments found for this patient</p>
        <GlassButton variant="primary" size="sm" className="mt-4" onClick={() => navigate('/appointments/new')}>
          <Plus className="w-4 h-4" /> Schedule appointment
        </GlassButton>
      </GlassCard>
    );
  }

  // Most recent first
  const sorted = [...appointments].sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));

  return (
    <div className="space-y-3">
      {sorted.map((apt, i) => {
        const isOpen = openId === apt.id;
        const linkedRecord = records.find(r => r.date === apt.date);
        const d = new Date(apt.date + 'T00:00:00');
        return (
          <GlassCard
            key={apt.id}
            hover={false}
            padding="none"
            className="reveal overflow-hidden"
            style={{ animationDelay: `${i * 45}ms` }}
          >
            {/* Summary row — click to expand */}
            <button
              onClick={() => setOpenId(isOpen ? null : apt.id)}
              className="w-full text-left flex items-center gap-3 sm:gap-4 p-4 hover:bg-[var(--surface-2)] transition-colors"
            >
              <div className={cn('w-1.5 self-stretch rounded-full flex-shrink-0', aptStripe(apt.status))} />
              <div className="flex flex-col items-center justify-center w-12 flex-shrink-0">
                <span className="text-[10px] font-semibold uppercase text-app-subtle">{d.toLocaleDateString('en-US', { month: 'short' })}</span>
                <span className="text-xl font-bold text-app leading-none">{d.getDate()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-app">{apt.time}</span>
                  <GlassBadge variant={aptStatusVariant(apt.status)} size="sm">{apt.status}</GlassBadge>
                  <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs',
                    apt.type === 'Video' ? 'bg-violet-500/15 text-violet-300' : apt.type === 'Phone' ? 'bg-cyan-500/15 text-cyan-300' : 'bg-indigo-500/15 text-indigo-300')}>
                    {apt.type === 'Video' ? <Video className="w-3 h-3" /> : apt.type === 'Phone' ? <Phone className="w-3 h-3" /> : <UserRound className="w-3 h-3" />}
                    {apt.type}
                  </span>
                </div>
                <p className="text-sm text-app-muted mt-0.5 truncate">{apt.doctorName} · {apt.specialty}</p>
              </div>
              <ChevronDown className={cn('w-5 h-5 text-app-subtle flex-shrink-0 transition-transform', isOpen && 'rotate-180')} />
            </button>

            {/* Expanded details */}
            {isOpen && (
              <div className="px-4 pb-4 pt-1 border-t border-[var(--border)] reveal">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                  <DetailRow icon={<Stethoscope className="w-4 h-4 text-white/40" />} label="Doctor" value={apt.doctorName} />
                  <DetailRow icon={<Activity className="w-4 h-4 text-white/40" />} label="Specialty" value={apt.specialty} />
                  <DetailRow icon={<Calendar className="w-4 h-4 text-white/40" />} label="Date" value={d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} />
                  <DetailRow icon={<Clock className="w-4 h-4 text-white/40" />} label="Reference" value={apt.id} />
                </div>

                {apt.notes && (
                  <div className="mt-3 p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                    <p className="text-xs text-app-subtle mb-1 flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> Notes</p>
                    <p className="text-sm text-app-muted italic">"{apt.notes}"</p>
                  </div>
                )}

                {/* Linked visit outcome (for completed appointments that produced a record) */}
                {linkedRecord && (
                  <div className="mt-3 p-3 rounded-xl bg-emerald-500/[0.07] border border-emerald-500/20">
                    <p className="text-xs text-emerald-300 mb-2 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Visit outcome</p>
                    <p className="text-sm font-medium text-app">{linkedRecord.diagnosis}</p>
                    {linkedRecord.medications.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {linkedRecord.medications.map((m, mi) => (
                          <span key={mi} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-[var(--surface-2)] text-app-muted">
                            <Pill className="w-3 h-3 text-emerald-400" />{m}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mt-3">
                  <GlassButton variant="primary" size="sm" onClick={() => navigate(`/appointments/${apt.id}/edit`)}>
                    <Pencil className="w-3.5 h-3.5" /> Edit appointment
                  </GlassButton>
                  <GlassButton variant="ghost" size="sm" onClick={() => navigate(`/doctors/${apt.doctorId}`)}>
                    <UserRound className="w-3.5 h-3.5" /> View doctor
                  </GlassButton>
                </div>
              </div>
            )}
          </GlassCard>
        );
      })}
    </div>
  );
};
