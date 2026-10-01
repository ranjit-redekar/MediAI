/**
 * Deterministic 0..1 from a string (FNV-1a), so generated mock data is the same
 * on every load and in every test.
 */
export function seeded(key: string): number {
  let h = 2166136261;
  for (const c of key) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return ((h >>> 0) % 10_000) / 10_000;
}
