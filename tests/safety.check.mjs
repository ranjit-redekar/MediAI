// Safety rules the UI must never regress on. Run: node tests/safety.check.mjs
// Loads the real TypeScript modules through Vite, so there is nothing to install.
import assert from 'node:assert/strict';
import { createServer } from 'vite';

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
const load = path => vite.ssrLoadModule(path);

try {
  const { ACCESS_ROLES, ownsAction } = await load('/src/data/accessRoles.ts');
  const { buildAIActions } = await load('/src/data/aiActions.ts');
  const { medicines, stockStatus, daysUntilExpiry } = await load('/src/data/pharmacy.ts');
  const { initialVisits, recommendMedicines, allergyConflict } = await load('/src/data/journeyMock.ts');
  const { appointments } = await load('/src/data/appointments.ts');
  const { shiftDemoDates, todayKey, addDays } = await load('/src/utils/date.ts');

  // 1. Clinical drafts are signable only by doctors (medication) and assistant doctors (monitoring).
  const actions = buildAIActions();
  const clinical = actions.filter(a => a.requiresClinician);
  assert.ok(clinical.length > 0, 'fixture should contain clinical drafts');
  for (const role of ACCESS_ROLES) {
    const signs = clinical.filter(a => ownsAction(role, a));
    if (!['doctor', 'assistant-doctor'].includes(role.id)) {
      assert.equal(signs.length, 0, `${role.id} must not be able to sign clinical drafts`);
    }
  }
  const assistant = ACCESS_ROLES.find(r => r.id === 'assistant-doctor');
  assert.ok(clinical.filter(a => a.kind === 'medication').every(a => !ownsAction(assistant, a)), 'assistant doctors never sign medication');
  // Backstop holds even if someone adds a clinical kind to a non-clinical role.
  const admin = { ...ACCESS_ROLES.find(r => r.id === 'admin'), actionKinds: ['medication', 'monitoring'] };
  assert.ok(clinical.every(a => !ownsAction(admin, a)), 'backstop: admin with clinical kinds still cannot sign');

  // 2. Expired stock outranks every other status, and gets a quarantine draft first.
  const expired = medicines.filter(m => stockStatus(m) === 'Expired');
  assert.ok(expired.length > 0 && expired.every(m => daysUntilExpiry(m) <= 0 && m.stock > 0));
  const stock = actions.filter(a => a.kind === 'stock');
  assert.equal(stock[0].label, 'Quarantine expired batch');
  assert.ok(stock.every(a => !a.requiresClinician));

  // 3. Journey is today's in-person appointments — same patients, same times.
  const today = todayKey();
  const booked = appointments.filter(a => a.date === today && a.type === 'In-Person' && ['Scheduled', 'Completed'].includes(a.status));
  assert.equal(initialVisits.length, booked.length);
  assert.ok(initialVisits.every(v => booked.some(a => a.patientId === v.patientId)), 'no journey visit without an appointment');
  assert.ok(initialVisits.every(v => v.stage !== 'Pharmacy' || v.prescription.length > 0), 'nobody waits at the store for nothing');

  // 4. Allergies block drugs by name and by class; AI suggestions never include them.
  assert.equal(allergyConflict('Amoxicillin 500mg', ['Penicillin']), 'Penicillin');
  assert.equal(allergyConflict('Metformin 1000mg', ['Penicillin']), undefined);
  const infection = recommendMedicines('bacterial infection', ['fever'], ['Penicillin']);
  assert.ok(infection.every(s => !allergyConflict(s.name, ['Penicillin'])), 'no penicillin-class suggestion for an allergic patient');

  // 5. Demo dates move with the calendar, including ISO datetimes.
  const shifted = shiftDemoDates({ a: [{ when: addDays(today, -400) }], at: '2024-03-06T10:30:00Z' }, addDays(today, -400), ['when', 'at']);
  assert.equal(shifted.a[0].when, today);
  assert.match(shifted.at, /T10:30:00Z$/);

  console.log('safety checks passed');
} finally {
  await vite.close();
}
