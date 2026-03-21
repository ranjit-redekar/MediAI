import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, UsersRound, Filter, ChevronRight } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassBadge } from '../../components/ui/GlassBadge';
import { GlassButton } from '../../components/ui/GlassButton';
import { db } from '../../data';

export const RoleDirectory: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const filteredRoles = useMemo(() => {
    if (!query.trim()) return db.roles;
    return db.roles.filter((role) => {
      const normalized = query.toLowerCase();
      return (
        role.name.toLowerCase().includes(normalized) ||
        role.persona.toLowerCase().includes(normalized) ||
        role.summary.toLowerCase().includes(normalized)
      );
    });
  }, [query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-white/40">Role Workspaces</p>
          <h1 className="text-3xl font-bold text-white mt-1">Hospital Roles & Permissions</h1>
          <p className="text-white/60 mt-2 max-w-2xl">
            Spin up glassmorphic workspaces for every persona—front desk, clinicians, and operations—so each
            team sees KPIs, queues, and AI nudges tuned to their day.
          </p>
        </div>
        <GlassBadge variant="primary">
          <Sparkles className="w-4 h-4 mr-1" />
          {db.roles.length} live roles
        </GlassBadge>
      </div>

      <GlassCard className="bg-white/5 border-white/10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3 text-white/70">
            <UsersRound className="w-5 h-5 text-primary-light" />
            <div>
              <p className="text-sm">Need another persona?</p>
              <p className="text-white/40 text-xs">Duplicate an existing role and tweak KPIs + workflows.</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <label className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search roles..."
                className="w-full rounded-xl bg-white/5 border border-white/10 py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-primary"
              />
            </label>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {filteredRoles.map((role, index) => (
          <GlassCard
            key={role.id}
            className="bg-white/5 border-white/10 animate-slide-up"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-semibold text-white">{role.name}</h2>
                  <GlassBadge variant="info">{role.shift}</GlassBadge>
                  <GlassBadge variant="success">{role.status}</GlassBadge>
                </div>
                <p className="text-white/70 text-sm mt-2">{role.persona}</p>
              </div>
              <GlassButton
                variant="primary"
                size="sm"
                className="self-start"
                onClick={() => navigate(`/roles/${role.id}`)}
              >
                Open workspace
                <ChevronRight className="w-4 h-4 ml-1" />
              </GlassButton>
            </div>

            <p className="text-white/60 text-sm mt-4">{role.summary}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
              {role.metrics.slice(0, 4).map((metric) => (
                <div key={metric.label} className="flex flex-col rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-wide text-white/40">{metric.label}</p>
                  <p className="text-xl font-semibold text-white mt-1">{metric.value}</p>
                  {metric.change && (
                    <p className={`text-sm ${metric.trend === 'down' ? 'text-emerald-300' : 'text-amber-300'}`}>
                      {metric.change}
                    </p>
                  )}
                  {metric.helper && <p className="text-xs text-white/40 mt-1">{metric.helper}</p>}
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {role.focusAreas.map((focus) => (
                <GlassBadge
                  key={focus.title}
                  variant={
                    focus.status === 'Healthy' ? 'success' : focus.status === 'Watch' ? 'warning' : 'danger'
                  }
                  size="sm"
                >
                  {focus.title}
                </GlassBadge>
              ))}
            </div>
          </GlassCard>
        ))}

        {filteredRoles.length === 0 && (
          <GlassCard className="bg-red-500/10 border-red-500/20 text-red-100">
            No roles match “{query}”. Try searching for receptionist, doctor, or pharmacy leads.
          </GlassCard>
        )}
      </div>
    </div>
  );
};

export default RoleDirectory;
