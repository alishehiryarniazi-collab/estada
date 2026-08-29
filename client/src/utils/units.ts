/**
 * Pakistani area unit conversions (all relative to square feet).
 * Standard values: 1 marla = 272.25 sqft, 1 kanal = 20 marla, 1 acre = 8 kanal.
 */
export const AREA_IN_SQFT: Record<string, number> = {
  sqft: 1,
  sqyd: 9,
  sqm: 10.7639,
  marla: 272.25,
  kanal: 5445,
  acre: 43560,
};

export const UNIT_LABELS: Record<string, string> = {
  sqft: 'Square feet',
  sqyd: 'Square yards',
  sqm: 'Square meters',
  marla: 'Marla',
  kanal: 'Kanal',
  acre: 'Acre',
};

/** Convert a value in `from` unit into every supported unit. */
export function convertArea(value: number, from: string): Record<string, number> {
  const sqft = value * (AREA_IN_SQFT[from] ?? 1);
  const out: Record<string, number> = {};
  for (const unit of Object.keys(AREA_IN_SQFT)) {
    out[unit] = sqft / AREA_IN_SQFT[unit];
  }
  return out;
}

/** Trim to a readable number (up to 4 sig decimals, no trailing zeros). */
export function tidy(n: number): string {
  if (!Number.isFinite(n)) return '—';
  return parseFloat(n.toFixed(4)).toLocaleString('en-PK');
}
