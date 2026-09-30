// Proves the tenancy rules against a running Supabase:
//   npx supabase start && node supabase/tests/tenancy.check.mjs
// Uses the local stack's URL and publishable key unless overridden by env.
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { createClient } from '@supabase/supabase-js';

const status = JSON.parse(execSync('npx supabase status -o json', { encoding: 'utf8' }));
const url = process.env.VITE_SUPABASE_URL ?? status.API_URL;
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? status.PUBLISHABLE_KEY;
const client = () => createClient(url, key, { auth: { persistSession: false } });
const run = Date.now();

async function signUpHospital(name, slug, extra = {}) {
  const c = client();
  const email = `admin-${name.toLowerCase().replace(/\W+/g, "-")}-${run}@example.com`;
  const { data, error } = await c.auth.signUp({
    email,
    password: 'correct-horse-9',
    options: { data: { full_name: `Admin ${name}`, workspace_name: name, workspace_slug: slug, plan_id: 'starter', ...extra } },
  });
  assert.ifError(error);
  assert.ok(data.session, 'local config has email confirmation off, so sign-up returns a session');
  return c;
}

const a = await signUpHospital('Alpha Hospital', `alpha-${run}`, {
  invites: [{ email: 'Nurse@Alpha.test', role: 'nurse' }, { email: '', role: 'doctor' }],
});
const b = await signUpHospital('Beta Clinic', `beta-${run}`);
const b2 = await signUpHospital('Alpha Twin', `alpha-${run}`); // same slug as Alpha

// Trigger created workspace + admin membership + only the non-blank invite, lowercased.
const { data: aMember } = await a.from('workspace_members').select('role, workspace:workspaces(id, slug, plan_id, trial_ends_at)').single();
assert.equal(aMember.role, 'admin');
assert.equal(aMember.workspace.plan_id, 'starter');
assert.ok(new Date(aMember.workspace.trial_ends_at) > new Date(), 'trial set by the database');
const { data: aInvites } = await a.from('invites').select('email, role');
assert.deepEqual(aInvites, [{ email: 'nurse@alpha.test', role: 'nurse' }]);
const alphaId = aMember.workspace.id;

// Duplicate slug got a suffix instead of failing the sign-up.
const { data: twin } = await b2.from('workspaces').select('slug').single();
assert.match(twin.slug, new RegExp(`^alpha-${run}-[0-9a-f]{5}$`));

// Isolation: Beta sees only its own rows and cannot touch Alpha's.
const { data: bWorkspaces } = await b.from('workspaces').select('id');
assert.equal(bWorkspaces.length, 1);
assert.notEqual(bWorkspaces[0].id, alphaId);
assert.deepEqual((await b.from('invites').select('*').eq('workspace_id', alphaId)).data, []);
const bInvite = await b.from('invites').insert({ workspace_id: alphaId, email: 'x@evil.test', role: 'doctor' });
assert.ok(bInvite.error, 'cannot invite into another hospital');
const bRename = await b.from('workspaces').update({ name: 'Hijacked' }).eq('id', alphaId).select();
assert.deepEqual(bRename.data, [], 'cannot rename another hospital');

// Signed-out visitors read nothing.
assert.ok((await client().from('workspaces').select('id')).error, 'anon has no table access');

// Admins edit descriptive columns but not the plan or trial.
assert.ifError((await a.from('workspaces').update({ name: 'Alpha Renamed' }).eq('id', alphaId)).error);
assert.ok((await a.from('workspaces').update({ plan_id: 'enterprise' }).eq('id', alphaId)).error, 'plan is billing-only');
assert.ok((await a.from('workspaces').update({ trial_ends_at: null }).eq('id', alphaId)).error, 'trial is billing-only');
assert.ok((await a.from('workspace_members').update({ role: 'doctor' }).eq('workspace_id', alphaId)).error, 'membership is read-only');

// Invites: send, reject duplicates, reject admin role, revoke.
assert.ifError((await a.from('invites').insert({ workspace_id: alphaId, email: 'doc@alpha.test', role: 'doctor' })).error);
assert.equal((await a.from('invites').insert({ workspace_id: alphaId, email: 'doc@alpha.test', role: 'doctor' })).error?.code, '23505');
assert.ok((await a.from('invites').insert({ workspace_id: alphaId, email: 'boss@alpha.test', role: 'admin' })).error, 'cannot invite admins');
assert.ifError((await a.from('invites').delete().eq('workspace_id', alphaId).eq('email', 'doc@alpha.test')).error);
assert.equal((await a.from('invites').select('email')).data.length, 1);

// A plain sign-up with no hospital gets no workspace.
const loner = client();
await loner.auth.signUp({ email: `loner-${run}@example.com`, password: 'correct-horse-9' });
assert.deepEqual((await loner.from('workspace_members').select('*')).data, []);

// AI instructions: versioned by the database, append-only, admin-only, per hospital.
const saveInstr = (c, fields) => c.from('ai_instructions').insert({ workspace_id: alphaId, ...fields })
  .select('version, author_name, author_id').single();
const v1 = await saveInstr(a, { body: 'Cardiology consults go to Dr. Garcia first.', note: 'first' });
assert.ifError(v1.error);
assert.equal(v1.data.version, 1);
assert.equal(v1.data.author_name, 'Admin Alpha Hospital', 'author comes from membership, not the client');
const forged = await saveInstr(a, { body: 'Second.', version: 99, author_name: 'Someone Else', author_id: null });
assert.ifError(forged.error);
assert.equal(forged.data.version, 2, 'client-supplied version is ignored');
assert.equal(forged.data.author_name, 'Admin Alpha Hospital', 'client-supplied author is ignored');
assert.ok(forged.data.author_id, 'author id comes from the session');
assert.ok((await saveInstr(a, { body: 'x'.repeat(4001) })).error, 'body length is capped');
assert.ok((await a.from('ai_instructions').update({ body: 'rewritten' }).eq('workspace_id', alphaId)).error, 'history cannot be edited');
assert.ok((await a.from('ai_instructions').delete().eq('workspace_id', alphaId)).error, 'history cannot be deleted');
assert.equal((await a.from('ai_instructions').select('id').eq('workspace_id', alphaId)).data.length, 2);
assert.deepEqual((await b.from('ai_instructions').select('*').eq('workspace_id', alphaId)).data, [], 'other hospitals cannot read them');
assert.ok((await saveInstr(b, { body: 'Hijack' })).error, 'other hospitals cannot write them');
assert.ok((await client().from('ai_instructions').select('id')).error, 'anon has no access');

// Invited staff join through accept_invites(): confirmed email only, invite spent, role from the invite.
const joinEmail = `join-${run}@example.com`;
assert.ifError((await a.from('invites').insert({ workspace_id: alphaId, email: joinEmail, role: 'pharmacist' })).error);
const joiner = client();
const { data: joinData, error: joinErr } = await joiner.auth.signUp({ email: joinEmail, password: 'correct-horse-9', options: { data: { full_name: 'Jo Iner' } } });
assert.ifError(joinErr);
assert.deepEqual((await joiner.from('workspace_members').select('*')).data, [], 'no membership before claiming');
const claimed = await joiner.rpc('accept_invites');
assert.ifError(claimed.error);
assert.equal(claimed.data, 1);
// After joining they see their colleagues too, so pick out their own row.
const { data: joinedRow } = await joiner.from('workspace_members').select('role, full_name, workspace_id').eq('user_id', joinData.user.id).single();
assert.deepEqual(joinedRow, { role: 'pharmacist', full_name: 'Jo Iner', workspace_id: alphaId });
assert.equal((await a.from('invites').select('email').eq('email', joinEmail)).data.length, 0, 'invite is spent');
assert.equal((await joiner.rpc('accept_invites')).data, 0, 'claiming twice does nothing');
assert.equal((await loner.rpc('accept_invites')).data, 0, 'no invite, no hospital');
assert.ok((await client().rpc('accept_invites')).error, 'signed-out callers cannot claim');

// An unconfirmed address cannot claim, even with a matching invite.
assert.ifError((await a.from('invites').insert({ workspace_id: alphaId, email: `unconfirmed-${run}@example.com`, role: 'doctor' })).error);
const psql = sql => execSync(`docker exec -i supabase_db_MediAI-new psql -U postgres -tA -v ON_ERROR_STOP=1`, { input: sql, encoding: 'utf8' }).trim();
const ghostId = psql(`insert into auth.users (id, email, email_confirmed_at, aud, role, instance_id)
  values (gen_random_uuid(), 'unconfirmed-${run}@example.com', null, 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000') returning id;`).split('\n')[0];
const ghostClaim = psql(`begin; set local role authenticated; set local request.jwt.claims = '{"sub":"${ghostId}","role":"authenticated"}';
  select public.accept_invites(); rollback;`);
assert.match(ghostClaim, /^(BEGIN\n)?(SET\n)*0/m, 'unconfirmed user joins nothing');
assert.equal(psql(`select count(*) from public.invites where email = 'unconfirmed-${run}@example.com';`), '1', 'and the invite is left for the real owner');

// AI drafts: written by the server, decided through decide_action(), role-checked by the database.
const service = createClient(url, status.SECRET_KEY, { auth: { persistSession: false } });
const draft = async (kind, fields = {}) => {
  const { data, error } = await service.from('ai_actions')
    .insert({ workspace_id: alphaId, kind, label: `${kind} draft`, detail: `${kind} detail`, ...fields })
    .select('id, requires_clinician').single();
  assert.ifError(error);
  return data;
};
const med = await draft('medication', { requires_clinician: false }).catch(() => null)
  ?? await draft('medication');
assert.equal(med.requires_clinician, true, 'clinical flag comes from the kind, not the writer');
const outreach = await draft('outreach');
const stock = await draft('stock');

assert.ok((await a.from('ai_actions').insert({ workspace_id: alphaId, kind: 'outreach', label: 'x', detail: 'x' })).error, 'browsers cannot write drafts');
assert.ok((await a.from('ai_actions').update({ status: 'approved' }).eq('id', outreach.id).select()).data?.length !== 1, 'no direct status updates');

const decide = (c, id, decision, final_detail) => c.rpc('decide_action', { action_id: id, decision, final_detail });
const adminOut = await decide(a, outreach.id, 'approved', 'Edited by admin');
assert.ifError(adminOut.error);
assert.equal(adminOut.data.status, 'approved');
assert.equal(adminOut.data.detail, 'Edited by admin');
assert.equal(adminOut.data.decided_by_name, 'Admin Alpha Hospital');
assert.equal((await decide(a, med.id, 'approved')).error?.code, '42501', 'admins cannot sign medication');
assert.equal((await decide(joiner, med.id, 'approved')).error?.code, '42501', 'pharmacists cannot sign medication');
assert.ifError((await decide(joiner, stock.id, 'approved')).error, 'pharmacists handle stock');
assert.equal((await decide(b, outreach.id, 'dismissed')).error?.code, 'P0002', 'other hospitals cannot see or decide');
assert.deepEqual((await b.from('ai_actions').select('id').eq('workspace_id', alphaId)).data, []);

// A doctor joins through an invite and signs the medication draft.
const docEmail = `doc2-${run}@example.com`;
assert.ifError((await a.from('invites').insert({ workspace_id: alphaId, email: docEmail, role: 'doctor' })).error);
const doc = client();
assert.ifError((await doc.auth.signUp({ email: docEmail, password: 'correct-horse-9', options: { data: { full_name: 'Dr Doc' } } })).error);
assert.equal((await doc.rpc('accept_invites')).data, 1);
const signed = await decide(doc, med.id, 'approved');
assert.ifError(signed.error);
assert.equal(signed.data.decided_by_name, 'Dr Doc');

// Undo returns it to pending and clears the decider; the log keeps every step.
const undone = await decide(a, outreach.id, 'pending');
assert.equal(undone.data.status, 'pending');
assert.equal(undone.data.decided_by, null);
const { data: log } = await a.from('ai_action_log').select('status, actor_role, actor_name').eq('action_id', outreach.id).order('id');
assert.deepEqual(log.map(l => [l.status, l.actor_role]), [['approved', 'admin'], ['pending', 'admin']]);
assert.ok((await a.from('ai_action_log').delete().eq('action_id', outreach.id)).error || true);
assert.equal((await a.from('ai_action_log').select('id').eq('action_id', outreach.id)).data.length, 2, 'the log cannot be deleted');

// The database's role rules match the app's role table (src/data/accessRoles.ts).
const { createServer } = await import('vite');
// No dependency scan: it only matters for serving a browser and keeps running after close.
const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error', optimizeDeps: { noDiscovery: true } });
try {
  const { ACCESS_ROLES, ownsAction } = await vite.ssrLoadModule('/src/data/accessRoles.ts');
  const kinds = ['appointment', 'referral', 'lab', 'medication', 'monitoring', 'outreach', 'education', 'stock'];
  const sqlRules = psql(`select string_agg(r::text || ':' || k::text || '=' || private.can_decide(r, k)::text, ',' order by r, k)
    from unnest(enum_range(null::public.app_role)) r, unnest(enum_range(null::public.ai_action_kind)) k;`).split(',');
  const sqlMap = Object.fromEntries(sqlRules.map(x => x.split('=')));
  for (const role of ACCESS_ROLES) for (const kind of kinds) {
    const app = ownsAction(role, { kind, requiresClinician: kind === 'medication' || kind === 'monitoring' });
    assert.equal(String(app), sqlMap[`${role.id}:${kind}`], `${role.id} × ${kind}: app says ${app}, database says ${sqlMap[`${role.id}:${kind}`]}`);
  }
} finally {
  await vite.close();
}

console.log('tenancy checks passed');
