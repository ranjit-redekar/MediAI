import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Brain, Eye, Users } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { GlassBadge } from '../../components/ui/GlassBadge';
import { PageHeader } from '../../components/ui/PageHeader';
import { SearchInput } from '../../components/ui/SearchInput';
import { FilterTabs } from '../../components/ui/FilterTabs';
import { EmptyState } from '../../components/ui/EmptyState';
import { SortableHeader, TableHeader, useSort } from '../../components/ui/DataTable';
import { DeleteConfirmModal } from '../../components/ui/DeleteConfirmModal';
import { usePatients } from '../../context/PatientsContext';
import { useToast } from '../../context/ToastContext';
import type { Patient } from '../../types';
import { cn } from '../../utils/cn';

const RiskMeter: React.FC<{ score?: number }> = ({ score }) => {
  if (score === undefined) return <span className="text-app-subtle text-sm">—</span>;
  const bar = score >= 70 ? 'bg-red-500' : score >= 40 ? 'bg-amber-500' : 'bg-emerald-500';
  const text = score >= 70 ? 'text-red-400' : score >= 40 ? 'text-amber-400' : 'text-emerald-400';
  const label = score >= 70 ? 'High' : score >= 40 ? 'Med' : 'Low';
  return (
    <div className="flex flex-col gap-1 min-w-[80px]">
      <span className={cn('text-xs font-semibold', text)}>{label} · {score}</span>
      <div
        className="h-1.5 w-full bg-[var(--surface-3)] rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`AI risk score ${score} out of 100`}
      >
        <div className={cn('h-full rounded-full transition-all duration-700', bar)} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
};

export const PatientList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { patients, removePatient } = usePatients();
  const { toast } = useToast();
  const { sortKey, direction, onSort, sortRows } = useSort<Patient>('name', 'asc');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const statusTabs = useMemo(() => [
    { label: 'All Patients', value: 'all', count: patients.length },
    { label: 'Active', value: 'Active', count: patients.filter(p => p.status === 'Active').length },
    { label: 'Critical', value: 'Critical', count: patients.filter(p => p.status === 'Critical').length },
    { label: 'Inactive', value: 'Inactive', count: patients.filter(p => p.status === 'Inactive').length },
  ], [patients]);

  const query = searchTerm.trim().toLowerCase();
  const filteredPatients = useMemo(() => {
    const rows = patients.filter(patient => {
      const matchesSearch =
        !query ||
        patient.name.toLowerCase().includes(query) ||
        patient.id.toLowerCase().includes(query);
      const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    return sortRows(rows, {
      name: p => p.name,
      id: p => p.id,
      status: p => p.status,
      aiRiskScore: p => p.aiRiskScore ?? -1,
      lastVisit: p => p.lastVisit,
    });
  }, [patients, query, statusFilter, sortRows]);

  const criticalCount = patients.filter(p => p.status === 'Critical').length;
  const isFiltered = query !== '' || statusFilter !== 'all';
  const resetFilters = () => { setSearchTerm(''); setStatusFilter('all'); };

  const handleDelete = () => {
    if (!selectedPatient) return;
    removePatient(selectedPatient.id);
    toast('Patient removed', {
      description: `${selectedPatient.name} was deleted from the roster.`,
      variant: 'warning',
    });
    setIsDeleteModalOpen(false);
    setSelectedPatient(null);
  };

  const openEdit = (patient: Patient, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/patients/${patient.id}/edit`);
  };

  const openDelete = (patient: Patient, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPatient(patient);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patients"
        subtitle="Manage patient records and review AI risk scoring"
        actions={
          <>
            <GlassButton variant="ghost" onClick={() => navigate('/ai-insights')}>
              <Brain className="w-4 h-4" /> AI triage
            </GlassButton>
            <GlassButton variant="primary" onClick={() => navigate('/patients/new')}>
              <Plus className="w-4 h-4" /> Add Patient
            </GlassButton>
          </>
        }
      />

      {criticalCount > 0 && statusFilter !== 'Critical' && (
        <div className="reveal flex items-center gap-3 p-4 rounded-2xl bg-red-500/[0.07] border border-red-500/20">
          <Brain className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="flex-1 text-sm text-app">
            <span className="font-semibold">{criticalCount} patient{criticalCount === 1 ? '' : 's'}</span>
            <span className="text-app-muted"> flagged critical by AI triage.</span>
          </p>
          <GlassButton variant="ghost" size="sm" onClick={() => setStatusFilter('Critical')}>
            Show only these
          </GlassButton>
        </div>
      )}

      <GlassCard padding="sm" hover={false}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SearchInput
            width="lg"
            placeholder="Search patients by name or ID…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            aria-label="Search patients"
          />
          <FilterTabs
            tabs={statusTabs}
            value={statusFilter}
            onChange={setStatusFilter}
            label="Filter patients by status"
          />
        </div>
      </GlassCard>

      <GlassCard padding="none" hover={false} className="overflow-hidden">
        {filteredPatients.length === 0 ? (
          <EmptyState
            icon={Users}
            title={isFiltered ? 'No patients match your filters' : 'No patients yet'}
            description={
              isFiltered
                ? 'Try a different name or ID, or clear the status filter to see the full roster.'
                : 'Add your first patient to start tracking visits, vitals, and AI risk scores.'
            }
            action={
              isFiltered
                ? { label: 'Clear filters', onClick: resetFilters }
                : { label: 'Add Patient', onClick: () => navigate('/patients/new'), icon: Plus }
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <caption className="sr-only">Patient roster, sortable by name, ID, status, AI risk, and last visit</caption>
                <thead className="bg-[var(--surface-2)] border-b border-[var(--border)]">
                  <tr>
                    <SortableHeader label="Patient" columnKey="name" activeKey={sortKey} direction={direction} onSort={onSort} />
                    <SortableHeader label="ID" columnKey="id" activeKey={sortKey} direction={direction} onSort={onSort} />
                    <TableHeader>Contact</TableHeader>
                    <SortableHeader label="Status" columnKey="status" activeKey={sortKey} direction={direction} onSort={onSort} />
                    <SortableHeader label="AI Risk" columnKey="aiRiskScore" activeKey={sortKey} direction={direction} onSort={onSort} />
                    <SortableHeader label="Last Visit" columnKey="lastVisit" activeKey={sortKey} direction={direction} onSort={onSort} />
                    <TableHeader align="right">Actions</TableHeader>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filteredPatients.map(patient => (
                    <tr
                      key={patient.id}
                      onClick={() => navigate(`/patients/${patient.id}`)}
                      className="hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={patient.avatar}
                            alt=""
                            className="w-10 h-10 rounded-full border-2 border-[var(--border)] flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-medium text-app truncate">{patient.name}</p>
                            <p className="text-sm text-app-subtle">{patient.age} yrs • {patient.gender}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-app-muted font-mono text-sm">{patient.id}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-app-muted">{patient.phone}</div>
                        <div className="text-sm text-app-subtle truncate max-w-[180px]">{patient.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <GlassBadge
                          size="sm"
                          variant={
                            patient.status === 'Active' ? 'success'
                            : patient.status === 'Critical' ? 'danger'
                            : 'default'
                          }
                        >
                          {patient.status}
                        </GlassBadge>
                      </td>
                      <td className="px-6 py-4"><RiskMeter score={patient.aiRiskScore} /></td>
                      <td className="px-6 py-4 text-app-muted text-sm">{patient.lastVisit}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            className="p-2 rounded-lg text-app-subtle hover:text-app hover:bg-[var(--surface-3)] transition-colors focus-ring"
                            onClick={e => { e.stopPropagation(); navigate(`/patients/${patient.id}`); }}
                            aria-label={`View ${patient.name}`}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 rounded-lg text-app-subtle hover:text-app hover:bg-[var(--surface-3)] transition-colors focus-ring"
                            onClick={e => openEdit(patient, e)}
                            aria-label={`Edit ${patient.name}`}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 rounded-lg text-red-400 hover:bg-red-500/15 transition-colors focus-ring"
                            onClick={e => openDelete(patient, e)}
                            aria-label={`Delete ${patient.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-3 border-t border-[var(--border)] text-xs text-app-subtle">
              Showing {filteredPatients.length} of {patients.length} patients
            </div>
          </>
        )}
      </GlassCard>

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setSelectedPatient(null); }}
        onConfirm={handleDelete}
        title="Delete Patient"
        message="This removes the patient and their records from the roster."
        itemName={selectedPatient?.name}
      />
    </div>
  );
};
