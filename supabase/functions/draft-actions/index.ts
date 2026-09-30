// Drafts follow-up work for one patient with Claude and files it as pending
// ai_actions for staff to approve. The caller must be signed in and a member of
// the hospital; drafts are written with the secret key because browsers may
// not write them (see supabase/migrations/*_ai_actions.sql).
//
// ponytail: the patient summary comes from the request body because clinical
// tables aren't in the database yet. Drafts still need a human approval and the
// database decides who may sign each kind, but read the patient from a
// `patients` table here before real patient data flows through this.

import Anthropic from 'npm:@anthropic-ai/sdk@0.129.0';
import { createClient } from 'npm:@supabase/supabase-js@2.117.2';
import { systemPromptBlocks } from '../_shared/system-prompt.ts';
import { DRAFTS_SCHEMA, patientMessage, validDrafts, type PatientSummary } from '../_shared/drafts.ts';

const MODEL = 'claude-opus-5-5';
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

// Reads ANTHROPIC_API_KEY (and ANTHROPIC_BASE_URL, which tests point at a stub).
const anthropic = new Anthropic();

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);

  const url = Deno.env.get('SUPABASE_URL')!;
  const authHeader = req.headers.get('Authorization') ?? '';
  // As the caller: who they are and which hospital they belong to, under RLS.
  const asCaller = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });
  const { data: userData } = await asCaller.auth.getUser(authHeader.replace(/^Bearer\s+/i, ''));
  if (!userData?.user) return json({ error: 'Sign in first.' }, 401);

  let body: { workspaceId?: string; patient?: PatientSummary };
  try { body = await req.json(); } catch { return json({ error: 'Body must be JSON.' }, 400); }
  const { workspaceId, patient } = body;
  if (!workspaceId || !patient?.ref || !patient?.name) return json({ error: 'workspaceId and patient {ref, name} are required.' }, 400);

  const { data: member } = await asCaller.from('workspace_members')
    .select('role').eq('workspace_id', workspaceId).eq('user_id', userData.user.id).maybeSingle();
  if (!member) return json({ error: 'Not a member of this hospital.' }, 403);

  // With the secret key: the hospital's AI instructions (admin-only to read
  // directly) and the draft writes.
  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
  const { data: instructions } = await admin.from('ai_instructions')
    .select('body').eq('workspace_id', workspaceId).order('version', { ascending: false }).limit(1).maybeSingle();
  const [base, hospital] = systemPromptBlocks(instructions?.body ?? '');

  let message;
  try {
    message = await anthropic.beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      // The base prompt is identical for every hospital, so it stays cached.
      system: [
        { type: 'text', text: base, cache_control: { type: 'ephemeral' } },
        ...(hospital ? [{ type: 'text' as const, text: hospital }] : []),
      ],
      messages: [{ role: 'user', content: patientMessage(patient, new Date().toISOString().slice(0, 10)) }],
      thinking: { type: 'adaptive' },
      // Opus 5.5 defaults to medium; drafting clinical follow-ups earns high.
      output_config: { effort: 'high', format: { type: 'json_schema', schema: DRAFTS_SCHEMA } },
      // A safety decline is retried server-side on Anthropic's recommended model.
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
    } as Anthropic.Beta.MessageCreateParamsNonStreaming);
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) return json({ error: 'The AI is busy; try again in a minute.' }, 429);
    if (err instanceof Anthropic.APIError) return json({ error: `AI request failed (${err.status}).` }, 502);
    throw err;
  }

  if (message.stop_reason === 'refusal') return json({ error: 'The AI declined to draft for this record.', drafts: [] }, 422);
  if (message.stop_reason === 'max_tokens') return json({ error: 'The AI ran out of room; try again.' }, 502);
  const text = message.content.find(b => b.type === 'text');
  let parsed: unknown = null;
  try { parsed = text && 'text' in text ? JSON.parse(text.text) : null; } catch { /* handled below */ }
  const drafts = validDrafts(parsed);

  // Re-drafting replaces this patient's still-pending drafts; decided ones are history.
  await admin.from('ai_actions').delete()
    .eq('workspace_id', workspaceId).eq('patient_ref', patient.ref).eq('status', 'pending');
  if (drafts.length === 0) return json({ drafts: [] });

  const { data: rows, error } = await admin.from('ai_actions')
    .insert(drafts.map(d => ({ ...d, workspace_id: workspaceId, patient_ref: patient.ref, patient_name: patient.name })))
    .select('*');
  if (error) return json({ error: error.message }, 500);
  return json({ drafts: rows });
});
