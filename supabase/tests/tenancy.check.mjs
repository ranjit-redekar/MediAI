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

console.log('tenancy checks passed');
