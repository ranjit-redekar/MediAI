import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  User, Bell, Shield, Palette, Save, Check, Sun, Moon, LogOut, Building2, Globe, Mail, Send, X, CreditCard,
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassInput } from '../components/ui/GlassInput';
import { GlassSelect } from '../components/ui/GlassSelect';
import { GlassButton } from '../components/ui/GlassButton';
import { useTheme } from '../context/ThemeContext';
import { useSession } from '../context/SessionContext';
import { useStaff } from '../context/StaffContext';
import { useToast } from '../context/ToastContext';
import { FACILITY_TYPES, INVITABLE_ROLES, PLANS, getPlan, trialDaysLeft } from '../data/workspace';
import type { Invite } from '../data/workspace';
import { cn } from '../utils/cn';

export const Settings: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const { theme, themes, setTheme } = useTheme();
  const { role, signOut } = useSession();

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    // Plan, billing and invites belong to whoever runs the hospital.
    ...(role.id === 'admin' ? [{ id: 'workspace', label: 'Workspace & billing', icon: Building2 }] : []),
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  // The tab lives in the URL so the header's plan badge can deep-link here.
  const requested = params.get('tab');
  const activeTab = tabs.some(t => t.id === requested) ? requested! : 'profile';
  const setActiveTab = (id: string) => setParams({ tab: id }, { replace: true });

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-[28px] font-bold text-app tracking-tight">Settings</h1>
        <p className="text-white/60">Manage your account preferences</p>
      </div>
      <GlassCard className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <img
            src={role.demoUser.avatar}
            alt="Profile"
            className="w-14 h-14 rounded-2xl border-2 border-[var(--border)]"
          />
          <div>
            <p className="text-lg font-semibold text-app">{role.demoUser.name}</p>
            <p className="text-sm text-app-muted">{role.name} · {role.demoUser.email}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <GlassButton variant="ghost" className="flex items-center gap-2 px-4">
            <User className="w-4 h-4" />
            View profile
          </GlassButton>
          <GlassButton
            variant="ghost"
            className="flex items-center gap-2 px-4 text-red-200 border border-red-500/30"
            onClick={signOut}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </GlassButton>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Account Role', value: role.name, icon: User },
          { label: 'Notifications', value: 'Enabled', icon: Bell },
          { label: 'Security Score', value: 'Strong', icon: Shield }
        ].map((item, i) => (
          <GlassCard key={item.label} hover={false} className="reveal hover-lift flex items-center gap-3" style={{ animationDelay: `${i * 70}ms` }}>
            <div className="p-3 rounded-2xl bg-white/10">
              <item.icon className="w-5 h-5 text-white/70" />
            </div>
            <div>
              <p className="text-xs text-white/50">{item.label}</p>
              <p className="text-lg font-semibold text-white">{item.value}</p>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <GlassCard className="lg:h-fit">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-primary/20 to-accent/20 text-white border border-primary/30'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </GlassCard>

        {/* Content */}
        <div key={activeTab} className="lg:col-span-3 reveal">
          {activeTab === 'profile' && (
            <GlassCard>
              <h2 className="text-xl font-semibold text-white mb-6">Profile Settings</h2>
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <img
                    src={role.demoUser.avatar}
                    alt="Profile"
                    className="w-24 h-24 rounded-2xl border-4 border-white/10"
                  />
                  <div>
                    <GlassButton variant="primary" size="sm">Change Avatar</GlassButton>
                    <p className="text-sm text-white/50 mt-2">JPG, PNG or GIF. Max size 2MB.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <GlassInput label="Full Name" defaultValue={role.demoUser.name} />
                  <GlassInput label="Email" defaultValue={role.demoUser.email} />
                  <GlassInput label="Phone" defaultValue="+1 (555) 000-0000" />
                  <GlassInput label="Department" defaultValue="Administration" />
                </div>

                <div className="flex justify-end">
                  <GlassButton variant="primary">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </GlassButton>
                </div>
              </div>
            </GlassCard>
          )}

          {activeTab === 'workspace' && <WorkspaceSettings />}

          {activeTab === 'notifications' && (
            <GlassCard>
              <h2 className="text-xl font-semibold text-white mb-6">Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { label: 'Email Notifications', desc: 'Receive email updates about appointments' },
                  { label: 'AI Alerts', desc: 'Get notified about critical AI predictions' },
                  { label: 'Lab Results', desc: 'Notification when lab results are ready' },
                  { label: 'Billing Updates', desc: 'Payment and invoice notifications' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                    <div>
                      <p className="font-medium text-white">{item.label}</p>
                      <p className="text-sm text-white/50">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {activeTab === 'security' && (
            <GlassCard>
              <h2 className="text-xl font-semibold text-white mb-6">Security Settings</h2>
              <div className="space-y-6">
                <GlassInput label="Current Password" type="password" />
                <GlassInput label="New Password" type="password" />
                <GlassInput label="Confirm New Password" type="password" />
                <div className="flex justify-end">
                  <GlassButton variant="primary">Update Password</GlassButton>
                </div>
              </div>
            </GlassCard>
          )}

          {activeTab === 'appearance' && (
            <GlassCard>
              <h2 className="text-xl font-semibold text-app mb-1">Appearance</h2>
              <p className="text-sm text-app-subtle mb-6">Choose a theme — it applies instantly across the app.</p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {themes.map((t) => {
                  const active = theme === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={cn(
                        'relative rounded-2xl border p-3 text-left transition-all hover-lift',
                        active ? 'border-[color:var(--primary)] ring-2 ring-[color:var(--ring)]' : 'border-[var(--border)] hover:border-[var(--border-strong)]'
                      )}
                    >
                      {/* Theme preview swatch */}
                      <div className="rounded-xl overflow-hidden border border-[var(--border)] h-20 flex" style={{ background: t.swatch[0] }}>
                        <div className="w-1/3 h-full" style={{ background: 'rgba(255,255,255,0.04)' }} />
                        <div className="flex-1 p-2 flex flex-col justify-between">
                          <div className="h-2 w-10 rounded-full" style={{ background: t.swatch[1] }} />
                          <div className="flex gap-1.5">
                            <div className="h-5 w-5 rounded-md" style={{ background: t.swatch[1] }} />
                            <div className="h-5 w-5 rounded-md" style={{ background: t.swatch[2] }} />
                            <div className="h-5 flex-1 rounded-md" style={{ background: 'rgba(255,255,255,0.06)' }} />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2.5">
                        <span className="text-sm font-medium text-app flex items-center gap-1.5">
                          {t.isDark ? <Moon className="w-3.5 h-3.5 text-app-subtle" /> : <Sun className="w-3.5 h-3.5 text-app-subtle" />}
                          {t.name}
                        </span>
                        {active && (
                          <span className="w-5 h-5 rounded-full bg-[color:var(--primary)] flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center justify-between p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                <div>
                  <p className="font-medium text-app">Reduced motion</p>
                  <p className="text-sm text-app-subtle">Honors your system setting automatically</p>
                </div>
                <span className="text-xs text-app-subtle px-2.5 py-1 rounded-full bg-[var(--surface-3)]">System</span>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
};

const WorkspaceSettings: React.FC = () => {
  const { workspace, updateWorkspace, addInvite, revokeInvite } = useSession();
  const { staff } = useStaff();
  const { toast } = useToast();

  const [name, setName] = useState(workspace.name);
  const [facilityType, setFacilityType] = useState(workspace.facilityType);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Invite['roleId']>('doctor');

  const plan = getPlan(workspace.planId);
  const daysLeft = trialDaysLeft(workspace.trialEndsAt);
  const seatsUsed = staff.length + workspace.invites.length;

  const saveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = await updateWorkspace({ name: name.trim(), facilityType });
    toast(error ? 'Couldn’t save workspace' : 'Workspace updated', { description: error ?? undefined, variant: error ? 'error' : 'success' });
  };

  const switchPlan = async (planId: string) => {
    const error = await updateWorkspace({ planId });
    if (error) {
      toast('Plan not changed', { description: error, variant: 'warning' });
      return;
    }
    toast(`Switched to ${getPlan(planId).name}`, {
      description: daysLeft === null ? 'The change applies from your next invoice.' : 'Your trial continues on the new plan.',
      variant: 'success',
    });
  };

  const sendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = inviteEmail.trim().toLowerCase();
    const error = await addInvite({ email, roleId: inviteRole });
    if (error) {
      toast('Invite not sent', { description: error, variant: 'warning' });
      return;
    }
    setInviteEmail('');
    toast('Invite sent', { description: email, variant: 'success' });
  };

  const onRevoke = async (email: string) => {
    const error = await revokeInvite(email);
    if (error) toast('Couldn’t revoke invite', { description: error, variant: 'error' });
  };

  return (
    <div className="space-y-6">
      <GlassCard>
        <h2 className="text-xl font-semibold text-app mb-1">Workspace</h2>
        <p className="text-sm text-app-subtle mb-6 flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5" /> {workspace.slug}.mediai.app
        </p>
        <form onSubmit={saveDetails} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GlassInput label="Hospital name" value={name} onChange={e => setName(e.target.value)} required />
            <GlassSelect label="Facility type" options={FACILITY_TYPES} value={facilityType} onChange={e => setFacilityType(e.target.value)} />
          </div>
          <div className="flex justify-end">
            <GlassButton type="submit" variant="primary">
              <Save className="w-4 h-4 mr-2" /> Save changes
            </GlassButton>
          </div>
        </form>
      </GlassCard>

      <GlassCard>
        <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-app mb-1">Plan & billing</h2>
            <p className="text-sm text-app-subtle">
              {daysLeft === null
                ? `${plan.name} · ${plan.price}${plan.per}`
                : `${plan.name} trial · ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left`}
            </p>
          </div>
          {daysLeft !== null && (
            <GlassButton
              variant="outline"
              onClick={() => toast('Billing isn’t connected yet', { description: 'Payments arrive with the backend integration.', variant: 'info' })}
            >
              <CreditCard className="w-4 h-4" /> Add payment method
            </GlassButton>
          )}
        </div>

        {/* Seats */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-app-muted">Staff seats</span>
            <span className="font-medium text-app">
              {seatsUsed}{plan.seats ? ` / ${plan.seats}` : ' · unlimited'}
            </span>
          </div>
          {plan.seats && (
            <div className="h-2 rounded-full bg-[var(--surface-3)] overflow-hidden">
              <div
                className={cn('h-full rounded-full', seatsUsed > plan.seats ? 'bg-[color:var(--danger)]' : 'bg-primary')}
                style={{ width: `${Math.min(100, (seatsUsed / plan.seats) * 100)}%` }}
              />
            </div>
          )}
          {plan.seats && seatsUsed > plan.seats && (
            <p className="mt-1.5 text-xs text-[color:var(--danger)]">
              You're over this plan's seat limit — move up a plan to add more staff.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {PLANS.map(p => {
            const current = p.id === plan.id;
            return (
              <div
                key={p.id}
                className={cn(
                  'p-4 rounded-xl border flex flex-col',
                  current ? 'border-transparent ring-2 ring-primary bg-primary/10' : 'bg-[var(--surface-2)] border-[var(--border)]'
                )}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-semibold text-app">{p.name}</span>
                  <span className="text-sm font-semibold text-app">
                    {p.price}<span className="text-app-subtle font-normal">{p.per}</span>
                  </span>
                </div>
                <p className="mt-1 mb-4 text-xs text-app-muted leading-relaxed flex-1">{p.blurb}</p>
                {current ? (
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                    <Check className="w-4 h-4" /> Current plan
                  </span>
                ) : (
                  <GlassButton size="sm" variant="outline" onClick={() => switchPlan(p.id)}>
                    {p.seats === null ? 'Contact sales' : `Switch to ${p.name}`}
                  </GlassButton>
                )}
              </div>
            );
          })}
        </div>
      </GlassCard>

      <GlassCard>
        <h2 className="text-xl font-semibold text-app mb-1">Invite your team</h2>
        <p className="text-sm text-app-subtle mb-6">Each person signs in to the workspace for their role.</p>

        <form onSubmit={sendInvite} className="flex flex-col sm:flex-row sm:items-end gap-3">
          <GlassInput
            label="Email"
            type="email"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            placeholder={`colleague@${workspace.slug}.com`}
            icon={<Mail className="w-4 h-4" />}
            required
          />
          <div className="sm:w-48 flex-shrink-0">
            <GlassSelect label="Role" options={INVITABLE_ROLES} value={inviteRole} onChange={e => setInviteRole(e.target.value as Invite['roleId'])} />
          </div>
          <GlassButton type="submit" variant="outline" className="h-11 flex-shrink-0">
            <Send className="w-4 h-4" /> Send invite
          </GlassButton>
        </form>

        {workspace.invites.length > 0 && (
          <ul className="mt-5 divide-y divide-[var(--border)] border-t border-[var(--border)]">
            {workspace.invites.map(inv => (
              <li key={inv.email} className="flex items-center gap-3 py-3">
                <Mail className="w-4 h-4 text-app-subtle flex-shrink-0" />
                <span className="text-sm text-app truncate flex-1">{inv.email}</span>
                <span className="text-xs text-app-muted">{INVITABLE_ROLES.find(r => r.value === inv.roleId)?.label}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400">Pending</span>
                <button
                  type="button"
                  onClick={() => onRevoke(inv.email)}
                  aria-label={`Revoke invite for ${inv.email}`}
                  className="p-1 rounded-md text-app-subtle hover:text-app focus-ring"
                >
                  <X className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </div>
  );
};
