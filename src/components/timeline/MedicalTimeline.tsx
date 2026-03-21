import React, { useState } from 'react';
import {
  Stethoscope, Pill, FlaskConical, FileText, Calendar,
  ChevronRight, ChevronDown, AlertCircle, CheckCircle2,
  Heart, Thermometer, Wind, Weight, Activity, AlertTriangle
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import type { MedicalRecord } from '../../types';

interface MedicalTimelineProps {
  records: MedicalRecord[];
}

const VISIT_TYPE_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  Emergency: { color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/40' },
  Routine: { color: 'text-indigo-400', bg: 'bg-indigo-500/20', border: 'border-indigo-500/30' },
  'Follow-up': { color: 'text-cyan-400', bg: 'bg-cyan-500/20', border: 'border-cyan-500/30' },
  Specialist: { color: 'text-violet-400', bg: 'bg-violet-500/20', border: 'border-violet-500/30' },
  Surgery: { color: 'text-rose-400', bg: 'bg-rose-500/20', border: 'border-rose-500/30' },
  Preventive: { color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' },
};

const getRecordIcon = (diagnosis: string, visitType?: string) => {
  if (visitType === 'Emergency') return <AlertCircle className="w-5 h-5 text-red-400" />;
  if (visitType === 'Surgery') return <Activity className="w-5 h-5 text-rose-400" />;
  if (visitType === 'Preventive') return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
  const lower = diagnosis.toLowerCase();
  if (lower.includes('allerg')) return <AlertCircle className="w-5 h-5 text-amber-400" />;
  if (lower.includes('pregnanc') || lower.includes('prenatal')) return <Calendar className="w-5 h-5 text-pink-400" />;
  if (lower.includes('blood') || lower.includes('lab') || lower.includes('test')) return <FlaskConical className="w-5 h-5 text-cyan-400" />;
  if (lower.includes('pain') || lower.includes('physical')) return <Stethoscope className="w-5 h-5 text-indigo-400" />;
  if (lower.includes('prescription') || lower.includes('medication')) return <Pill className="w-5 h-5 text-emerald-400" />;
  return <FileText className="w-5 h-5 text-white/60" />;
};

const getCardGradient = (visitType?: string, diagnosis?: string) => {
  if (visitType === 'Emergency') return 'from-red-500/15 to-rose-500/10 border-l-red-500/60';
  if (visitType === 'Surgery') return 'from-rose-500/15 to-pink-500/10 border-l-rose-500/60';
  if (visitType === 'Preventive') return 'from-emerald-500/15 to-teal-500/10 border-l-emerald-500/60';
  if (visitType === 'Specialist') return 'from-violet-500/15 to-purple-500/10 border-l-violet-500/60';
  if (visitType === 'Follow-up') return 'from-cyan-500/15 to-blue-500/10 border-l-cyan-500/60';
  const lower = (diagnosis || '').toLowerCase();
  if (lower.includes('allerg')) return 'from-amber-500/15 to-orange-500/10 border-l-amber-500/60';
  if (lower.includes('pregnanc')) return 'from-pink-500/15 to-rose-500/10 border-l-pink-500/60';
  return 'from-indigo-500/15 to-slate-500/10 border-l-indigo-500/60';
};

export const MedicalTimeline: React.FC<MedicalTimelineProps> = ({ records }) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set([records[0]?.id]));

  const toggle = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const sortedRecords = [...records].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      day: date.getDate(),
      month: date.toLocaleString('default', { month: 'short' }),
      year: date.getFullYear(),
      full: date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    };
  };

  if (records.length === 0) {
    return (
      <GlassCard className="text-center py-12">
        <Stethoscope className="w-16 h-16 text-white/20 mx-auto mb-4" />
        <p className="text-white/50">No medical records available</p>
      </GlassCard>
    );
  }

  return (
    <div className="relative">
      {/* Timeline spine */}
      <div className="absolute left-8 top-8 bottom-8 w-px bg-gradient-to-b from-indigo-500/60 via-violet-500/30 to-transparent" />

      <div className="space-y-5">
        {sortedRecords.map((record, index) => {
          const date = formatDate(record.date);
          const isLatest = index === 0;
          const isExpanded = expandedIds.has(record.id);
          const vtConfig = record.visitType ? VISIT_TYPE_CONFIG[record.visitType] : VISIT_TYPE_CONFIG['Routine'];
          const gradient = getCardGradient(record.visitType, record.diagnosis);
          const hasLabs = record.labResults && record.labResults.length > 0;
          const hasVitals = record.vitals && Object.keys(record.vitals).length > 0;
          const criticalLabs = record.labResults?.filter(l => l.status === 'Critical') || [];
          const abnormalLabs = record.labResults?.filter(l => l.status === 'Abnormal') || [];

          return (
            <div key={record.id} className="relative flex gap-5 group">
              {/* Date node */}
              <div className="relative z-10 flex-shrink-0">
                <div className={`
                  w-16 h-16 rounded-2xl flex flex-col items-center justify-center
                  transition-transform duration-300 group-hover:scale-105
                  ${isLatest
                    ? 'bg-gradient-to-br from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/30'
                    : 'bg-white/10 backdrop-blur-md border border-white/20'
                  }
                `}>
                  <span className="text-lg font-bold text-white leading-none">{date.day}</span>
                  <span className="text-xs text-white/80 uppercase tracking-wide">{date.month}</span>
                  <span className="text-[10px] text-white/50">{date.year}</span>
                </div>
                {isLatest && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </div>
                )}
                {criticalLabs.length > 0 && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-pulse shadow-lg">
                    <AlertTriangle className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className={`
                  rounded-2xl border border-l-4 overflow-hidden
                  bg-gradient-to-r ${gradient}
                  transition-all duration-300
                `}>
                  {/* Header — always visible */}
                  <button
                    className="w-full p-4 flex items-start gap-3 text-left hover:bg-white/5 transition-colors"
                    onClick={() => toggle(record.id)}
                  >
                    <div className={`p-2 rounded-xl ${vtConfig.bg} flex-shrink-0`}>
                      {getRecordIcon(record.diagnosis, record.visitType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <h4 className="font-semibold text-white text-base">{record.diagnosis}</h4>
                        {record.visitType && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${vtConfig.bg} ${vtConfig.color} border ${vtConfig.border}`}>
                            {record.visitType}
                          </span>
                        )}
                        {criticalLabs.length > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                            {criticalLabs.length} Critical Lab{criticalLabs.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-white/50">
                        <span>{date.full}</span>
                        {record.doctorId && <span>· Dr. {record.doctorId}</span>}
                        {hasLabs && <span>· {record.labResults!.length} lab test{record.labResults!.length > 1 ? 's' : ''}</span>}
                        {record.followUpDate && (
                          <span className="text-amber-400">· Follow-up {record.followUpDate}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0 p-1 rounded-lg bg-white/5">
                      {isExpanded
                        ? <ChevronDown className="w-4 h-4 text-white/50" />
                        : <ChevronRight className="w-4 h-4 text-white/50" />
                      }
                    </div>
                  </button>

                  {/* Expanded Body */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-white/10 space-y-4 pt-4">

                      {/* Vitals */}
                      {hasVitals && (
                        <div>
                          <p className="text-xs font-medium text-white/50 mb-2 flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5" /> Vitals
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {record.vitals!.bloodPressure && (
                              <MiniVital icon={<Heart className="w-3 h-3 text-red-400" />} label="BP" value={record.vitals!.bloodPressure} unit="mmHg" />
                            )}
                            {record.vitals!.heartRate && (
                              <MiniVital icon={<Activity className="w-3 h-3 text-pink-400" />} label="HR" value={record.vitals!.heartRate.toString()} unit="bpm" />
                            )}
                            {record.vitals!.temperature && (
                              <MiniVital icon={<Thermometer className="w-3 h-3 text-orange-400" />} label="Temp" value={record.vitals!.temperature.toString()} unit="°F" />
                            )}
                            {record.vitals!.oxygenSaturation && (
                              <MiniVital icon={<Wind className="w-3 h-3 text-cyan-400" />} label="SpO₂" value={record.vitals!.oxygenSaturation.toString()} unit="%" highlight={record.vitals!.oxygenSaturation < 95} />
                            )}
                            {record.vitals!.weight && (
                              <MiniVital icon={<Weight className="w-3 h-3 text-indigo-400" />} label="Weight" value={record.vitals!.weight.toString()} unit="kg" />
                            )}
                            {record.vitals!.bmi && (
                              <MiniVital icon={<Activity className="w-3 h-3 text-teal-400" />} label="BMI" value={record.vitals!.bmi.toString()} unit="" highlight={record.vitals!.bmi >= 30} />
                            )}
                          </div>
                        </div>
                      )}

                      {/* Symptoms + Medications side by side */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {record.symptoms.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-white/50 mb-2">Symptoms</p>
                            <div className="flex flex-wrap gap-1.5">
                              {record.symptoms.map((s, i) => (
                                <span key={i} className="px-2.5 py-1 rounded-full bg-white/10 text-white/70 text-xs">{s}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {record.medications.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-white/50 mb-2">Medications</p>
                            <div className="flex flex-col gap-1.5">
                              {record.medications.map((m, i) => (
                                <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                  <Pill className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                                  <span className="text-xs text-emerald-300">{m}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Lab Results mini table */}
                      {hasLabs && (
                        <div>
                          <p className="text-xs font-medium text-white/50 mb-2 flex items-center gap-1.5">
                            <FlaskConical className="w-3.5 h-3.5" />
                            Lab Results
                            {criticalLabs.length > 0 && (
                              <span className="px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs">{criticalLabs.length} critical</span>
                            )}
                            {abnormalLabs.length > 0 && (
                              <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs">{abnormalLabs.length} abnormal</span>
                            )}
                          </p>
                          <div className="rounded-xl overflow-hidden border border-white/10">
                            <table className="w-full text-xs">
                              <thead className="bg-white/5">
                                <tr>
                                  <th className="text-left text-white/40 px-3 py-2 font-medium">Parameter</th>
                                  <th className="text-left text-white/40 px-3 py-2 font-medium">Value</th>
                                  <th className="text-left text-white/40 px-3 py-2 font-medium hidden sm:table-cell">Reference</th>
                                  <th className="text-left text-white/40 px-3 py-2 font-medium">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                {record.labResults!.map((lab, i) => (
                                  <tr key={i} className={
                                    lab.status === 'Critical' ? 'bg-red-500/10' :
                                    lab.status === 'Abnormal' ? 'bg-amber-500/5' : ''
                                  }>
                                    <td className="px-3 py-2 font-medium text-white/80">{lab.parameter}</td>
                                    <td className={`px-3 py-2 font-bold ${
                                      lab.status === 'Critical' ? 'text-red-400' :
                                      lab.status === 'Abnormal' ? 'text-amber-400' : 'text-emerald-400'
                                    }`}>
                                      {lab.value} <span className="text-white/30 font-normal">{lab.unit}</span>
                                    </td>
                                    <td className="px-3 py-2 text-white/40 hidden sm:table-cell">{lab.referenceRange}</td>
                                    <td className="px-3 py-2">
                                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                                        lab.status === 'Critical' ? 'bg-red-500/20 text-red-400' :
                                        lab.status === 'Abnormal' ? 'bg-amber-500/20 text-amber-400' :
                                        'bg-emerald-500/20 text-emerald-400'
                                      }`}>
                                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                        {lab.status}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {record.notes && (
                        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                          <p className="text-xs text-white/40 mb-1">Clinical Notes</p>
                          <p className="text-sm text-white/70 italic leading-relaxed">"{record.notes}"</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const MiniVital: React.FC<{ icon: React.ReactNode; label: string; value: string; unit: string; highlight?: boolean }> = ({
  icon, label, value, unit, highlight = false
}) => (
  <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${highlight ? 'bg-amber-500/15 border border-amber-500/30' : 'bg-white/5 border border-white/10'}`}>
    <div className="flex-shrink-0">{icon}</div>
    <div className="min-w-0">
      <p className="text-[10px] text-white/40 leading-none">{label}</p>
      <p className={`text-xs font-semibold leading-none mt-0.5 ${highlight ? 'text-amber-400' : 'text-white'}`}>
        {value} <span className="text-white/40 font-normal text-[10px]">{unit}</span>
      </p>
    </div>
  </div>
);
