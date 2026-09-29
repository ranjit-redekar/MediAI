import { useCallback, useEffect, useState } from 'react';
import { useSession } from '../context/SessionContext';
import { supabase } from '../lib/supabase';

export interface InstructionVersion {
  version: number;
  body: string;
  note: string;
  authorName: string;
  createdAt: string;
}

const DEMO_KEY = 'mediai-ai-instructions';

/** What the demo hospital starts with, so the history shows how the feature is used. */
const DEMO_SEED: InstructionVersion[] = [{
  version: 1,
  body: [
    'Send cardiology consults to Dr. Maria Garcia first; if she has no slot within 48 hours, offer the next available cardiologist.',
    'Write patient outreach messages in the patient’s preferred language (English, Hindi or Marathi), under 60 words, and include the front desk number +91 20 5555 0100.',
    'Handoff notes: situation, background, assessment, recommendation — four short lines.',
  ].join('\n'),
  note: 'Initial setup',
  authorName: 'Dr. Admin',
  createdAt: '2026-01-05T09:30:00.000Z',
}];

function readDemo(): InstructionVersion[] {
  try {
    const raw = localStorage.getItem(DEMO_KEY);
    return raw ? (JSON.parse(raw) as InstructionVersion[]) : DEMO_SEED;
  } catch {
    return DEMO_SEED;
  }
}

interface Row { version: number; body: string; note: string; author_name: string; created_at: string }
const toVersion = (r: Row): InstructionVersion =>
  ({ version: r.version, body: r.body, note: r.note, authorName: r.author_name, createdAt: r.created_at });
const COLUMNS = 'version, body, note, author_name, created_at';

/** Every saved version, newest first. The newest is the one the AI agents use. */
export function useAIInstructions() {
  const { workspaceId, role } = useSession();
  const [versions, setVersions] = useState<InstructionVersion[] | null>(() => (supabase ? null : readDemo()));
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase || !workspaceId) return;
    let cancelled = false;
    supabase
      .from('ai_instructions')
      .select(COLUMNS)
      .eq('workspace_id', workspaceId)
      .order('version', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) setLoadError(error.message);
        else setVersions((data as Row[]).map(toVersion));
      });
    return () => { cancelled = true; };
  }, [workspaceId]);

  /** Saves a new version. Resolves to an error message, or null on success. */
  const save = useCallback(async (body: string, note: string): Promise<string | null> => {
    if (!supabase) {
      const prev = versions ?? [];
      const next = [{
        version: (prev[0]?.version ?? 0) + 1,
        body,
        note,
        authorName: role.demoUser.name,
        createdAt: new Date().toISOString(),
      }, ...prev];
      setVersions(next);
      try { localStorage.setItem(DEMO_KEY, JSON.stringify(next)); } catch { /* storage blocked */ }
      return null;
    }
    if (!workspaceId) return 'You’re signed out.';

    // The database assigns the version number, author and time.
    const { data, error } = await supabase
      .from('ai_instructions')
      .insert({ workspace_id: workspaceId, body, note })
      .select(COLUMNS)
      .single();
    if (error) return error.message;
    setVersions(prev => [toVersion(data as Row), ...(prev ?? [])]);
    return null;
  }, [versions, workspaceId, role]);

  return { versions, loadError, save };
}
