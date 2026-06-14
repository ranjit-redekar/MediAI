import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Brain, Eye } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { GlassBadge } from '../../components/ui/GlassBadge';
import { PageHeader } from '../../components/ui/PageHeader';
import { SearchInput } from '../../components/ui/SearchInput';
import { DeleteConfirmModal } from '../../components/ui/DeleteConfirmModal';
import { usePatients } from '../../context/PatientsContext';
import type { Patient } from '../../types';
import { cn } from '../../utils/cn';

export const PatientList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { patients, removePatient } = usePatients();

  // Delete confirmation state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const statusTabs = useMemo(() => {
    const active = patients.filter(p => p.status === 'Active').length;
    const inactive = patients.filter(p => p.status === 'Inactive').length;
    const critical = patients.filter(p => p.status === 'Critical').length;
    return [
      { label: 'All Patients', value: 'all', count: patients.length },
      { label: 'Active', value: 'Active', count: active },
      { label: 'Inactive', value: 'Inactive', count: inactive },
      { label: 'Critical', value: 'Critical', count: critical }
    ];
  }, [patients]);

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getRiskBadge = (score?: number) => {
    if (!score) return <span className="text-white/30 text-sm">—</span>;
    const color = score >= 70 ? 'bg-red-500' : score >= 40 ? 'bg-amber-500' : 'bg-emerald-500';
    const textColor = score >= 70 ? 'text-red-400' : score >= 40 ? 'text-amber-400' : 'text-emerald-400';
    const label = score >= 70 ? 'High' : score >= 40 ? 'Med' : 'Low';
    return (
      <div className="flex flex-col gap-1 min-w-[80px]">
        <div className="flex items-center justify-between">
          <span className={`text-xs font-semibold ${textColor}`}>{label} · {score}</span>
        </div>
        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
        </div>
      </div>
    );
  };

  const handleDelete = () => {
    if (selectedPatient) {
      removePatient(selectedPatient.id);
      setIsDeleteModalOpen(false);
      setSelectedPatient(null);
    }
  };

  const openEditModal = (patient: Patient, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/patients/${patient.id}/edit`);
  };

  const openDeleteModal = (patient: Patient, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPatient(patient);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patients"
        subtitle="Manage patient records and view AI insights"
        actions={
          <>
            <GlassButton variant="ghost" onClick={() => navigate('/ai-insights')}>
              <Brain className="w-4 h-4" />
              AI triage
            </GlassButton>
            <GlassButton variant="primary" onClick={() => navigate('/patients/new')}>
              <Plus className="w-4 h-4" />
              Add Patient
            </GlassButton>
          </>
        }
      />

      {/* Filter bar */}
      <GlassCard padding="sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SearchInput
            width="lg"
            placeholder="Search patients by name or ID…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            {statusTabs.map(tab => {
              const isActiveTab = statusFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  className={cn(
                    'h-9 px-3.5 rounded-lg border text-xs font-semibold inline-flex items-center gap-2 transition-all',
                    isActiveTab
                      ? 'bg-primary/15 border-primary/40 text-app'
                      : 'bg-[var(--surface-2)] border-[var(--border)] text-app-muted hover:text-app hover:border-[var(--border-strong)]'
                  )}
                >
                  <span>{tab.label}</span>
                  <span className={cn('text-[11px] px-1.5 rounded-full', isActiveTab ? 'bg-primary/20 text-app' : 'bg-[var(--surface-3)] text-app-subtle')}>{tab.count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </GlassCard>

      {/* Patients Table */}
      <GlassCard padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="text-left text-sm font-medium text-white/70 px-6 py-4">Patient</th>
                <th className="text-left text-sm font-medium text-white/70 px-6 py-4">ID</th>
                <th className="text-left text-sm font-medium text-white/70 px-6 py-4">Contact</th>
                <th className="text-left text-sm font-medium text-white/70 px-6 py-4">Status</th>
                <th className="text-left text-sm font-medium text-white/70 px-6 py-4">
                  <div className="flex items-center gap-1">
                    <Brain className="w-4 h-4 text-accent" />
                    AI Risk
                  </div>
                </th>
                <th className="text-left text-sm font-medium text-white/70 px-6 py-4">Last Visit</th>
                <th className="text-right text-sm font-medium text-white/70 px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredPatients.map((patient) => (
                <tr
                  key={patient.id}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={patient.avatar}
                        alt={patient.name}
                        className="w-10 h-10 rounded-full border-2 border-white/10"
                      />
                      <div>
                        <p className="font-medium text-white">{patient.name}</p>
                        <p className="text-sm text-white/50">{patient.age} yrs • {patient.gender}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white/70">{patient.id}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white/70">{patient.phone}</div>
                    <div className="text-sm text-white/50">{patient.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <GlassBadge
                      variant={
                        patient.status === 'Active' ? 'success' :
                        patient.status === 'Critical' ? 'danger' : 'default'
                      }
                    >
                      {patient.status}
                    </GlassBadge>
                  </td>
                  <td className="px-6 py-4">{getRiskBadge(patient.aiRiskScore)}</td>
                  <td className="px-6 py-4 text-white/70">{patient.lastVisit}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        onClick={() => navigate(`/patients/${patient.id}`)}
                        title="View"
                      >
                        <Eye className="w-4 h-4 text-white/50" />
                      </button>
                      <button
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        onClick={(e) => openEditModal(patient, e)}
                        title="Edit"
                      >
                        <Edit className="w-4 h-4 text-white/50" />
                      </button>
                      <button
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                        onClick={(e) => openDeleteModal(patient, e)}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredPatients.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/50">No patients found matching your criteria</p>
          </div>
        )}
      </GlassCard>

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedPatient(null);
        }}
        onConfirm={handleDelete}
        title="Delete Patient"
        message="Are you sure you want to delete this patient? This action cannot be undone."
        itemName={selectedPatient?.name}
      />
    </div>
  );
};
