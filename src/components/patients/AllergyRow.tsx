import React from 'react';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

/**
 * Allergies sit in the header because they are checked before every order.
 * "Not recorded" is shown as a warning, never collapsed into "none".
 */
export const AllergyRow: React.FC<{ allergies?: string[] }> = ({ allergies }) => {
  if (allergies === undefined) {
    return (
      <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-xl border border-amber-500/30 bg-amber-500/10 text-sm">
        <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0" />
        <span className="font-semibold text-app">Allergies not recorded</span>
        <span className="text-app-muted">— confirm with the patient before prescribing</span>
      </div>
    );
  }
  if (allergies.length === 0) {
    return (
      <p className="mt-4 flex items-center gap-2 text-sm text-app-muted">
        <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" /> No known drug allergies
      </p>
    );
  }
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 px-3 py-2 rounded-xl border border-red-500/30 bg-red-500/10 text-sm">
      <ShieldAlert className="w-4 h-4 text-red-500 flex-shrink-0" />
      <span className="font-semibold text-app">Allergies:</span>
      {allergies.map(a => (
        <span key={a} className="px-2 py-0.5 rounded-md bg-red-500/15 font-semibold text-app">{a}</span>
      ))}
    </div>
  );
};
