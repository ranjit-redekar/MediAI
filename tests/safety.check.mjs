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

  // 4b. Suggestions come from diagnoses, never from symptoms or screenings (they draft automatically).
  assert.deepEqual(recommendMedicines('New referral — fatigue workup', []), [], 'a symptom workup gets no drug');
  assert.deepEqual(recommendMedicines('Gestational glucose screening', []), [], 'a screening gets no drug');
  assert.deepEqual(recommendMedicines('Chest pain walk-in', ['fever', 'cough']), [], 'symptoms alone get no drug');
  assert.equal(recommendMedicines('Hypertension review', [])[0]?.category, 'Antihypertensive');
  assert.deepEqual(recommendMedicines('CBP count', []), [], 'no substring matches ("bp" in "CBP")');

  // 5. Demo dates move with the calendar, including ISO datetimes.
  const shifted = shiftDemoDates({ a: [{ when: addDays(today, -400) }], at: '2024-03-06T10:30:00Z' }, addDays(today, -400), ['when', 'at']);
  assert.equal(shifted.a[0].when, today);
  assert.match(shifted.at, /T10:30:00Z$/);

  // 6. Booking: next free slot skips taken slots and past times; booking drafts carry a slot.
  const { nextFreeSlot } = await load('/src/data/slots.ts');
  const { doctors } = await load('/src/data/doctors.ts');
  const doc = doctors[0];
  const monday = new Date(2030, 0, 7, 8, 0); // a Monday, before hours
  const first = nextFreeSlot(doc, [], monday);
  assert.equal(first.date, '2030-01-07');
  const taken = [{ doctorId: doc.id, date: first.date, time: first.time, status: 'Scheduled' }];
  const second = nextFreeSlot(doc, taken, monday);
  assert.notDeepEqual(second, first, 'a booked slot is never offered again');
  const late = nextFreeSlot(doc, [], new Date(2030, 0, 7, 23, 0));
  assert.notEqual(late.date, '2030-01-07', 'no slots in the past');
  assert.ok(actions.filter(a => a.kind === 'referral').every(a => a.booking?.date && a.booking?.time), 'referrals carry a bookable slot');

  // 7. Today board follows the book: new bookings join, undone ones leave, started ones stay.
  const { mergeWithBook } = await load('/src/data/journeyMock.ts');
  const extra = { id: 'A999', patientId: 'P001', patientName: 'Sarah Johnson', doctorId: 'D001', doctorName: 'Dr. James Wilson', specialty: 'Internal Medicine', date: today, time: '17:30', status: 'Scheduled', type: 'In-Person', notes: 'Booked from draft' };
  const withExtra = mergeWithBook(initialVisits, [...appointments, extra]);
  assert.equal(withExtra.find(v => v.id === 'V-A999')?.stage, 'Scheduled', 'a booking for today joins the board');
  assert.equal(mergeWithBook(withExtra, appointments).some(v => v.id === 'V-A999'), false, 'undoing it takes it off');
  const started = withExtra.map(v => v.id === 'V-A999' ? { ...v, stage: 'Consultation' } : v);
  assert.ok(mergeWithBook(started, appointments).some(v => v.id === 'V-A999'), 'a visit under way is never dropped');
  assert.equal(mergeWithBook(initialVisits, appointments).length, initialVisits.length, 'seed is stable');

  // 8. A no-show booking leaves the board; the visit carries its booked doctor for reception.
  const scheduled = initialVisits.find(v => v.stage === 'Scheduled' && v.id.startsWith('V-A'));
  assert.ok(scheduled.bookedDoctor?.name, 'visits know their booked doctor');
  const noShowBook = appointments.map(a => (`V-${a.id}` === scheduled.id ? { ...a, status: 'No-Show' } : a));
  assert.equal(mergeWithBook(initialVisits, noShowBook).some(v => v.id === scheduled.id), false, 'no-show leaves the board');

  // 9. Lab flags come from the catalogue: boundaries, critical beats abnormal, wording maps to tests.
  const { LAB_CATALOG, flagValue, matchTest, rangeLabel } = await load('/src/data/labCatalog.ts');
  const { labTests } = await load('/src/data/laboratory.ts');
  const k = LAB_CATALOG.find(t => t.name === 'Basic Metabolic Panel').params.find(p => p.name === 'Potassium');
  assert.equal(flagValue(k, 4.2), 'Normal');
  assert.equal(flagValue(k, 3.5), 'Normal', 'range is inclusive');
  assert.equal(flagValue(k, 5.5), 'Abnormal');
  assert.equal(flagValue(k, 6.5), 'Critical', 'critical beats abnormal');
  assert.equal(flagValue(k, 2.5), 'Critical');
  assert.equal(rangeLabel(LAB_CATALOG.find(t => t.name === 'Lipid Panel').params.find(p => p.name === 'HDL')), '> 40');
  assert.equal(matchTest('6-week follow-up for lipid recheck')?.name, 'Lipid Panel');
  assert.equal(matchTest('Schedule glucose screening at 24 weeks')?.name, 'Glucose Challenge Test');
  assert.equal(matchTest('Spinal MRI'), undefined, 'no guessing a test that is not in the catalogue');
  const critical = labTests.filter(t => t.results?.some(r => r.status === 'Critical'));
  assert.deepEqual(critical.map(t => `${t.patientName} ${t.testName}`), ['Robert Williams INR'], 'the demo day has exactly one planned critical');
  assert.ok(actions.filter(a => a.kind === 'lab').every(a => a.labOrder?.testName && a.labOrder?.collectOn), 'lab drafts carry an order');

  console.log('safety checks passed');
} finally {
  await vite.close();
}
