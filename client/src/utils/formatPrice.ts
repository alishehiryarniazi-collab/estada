/**
 * PKR price formatting — lakh/crore convention. Mirrors the server util so the
 * SAME rules apply everywhere (Section 8: one reusable formatter).
 *
 *   >= 1 crore -> "1.85 crore"
 *   >= 1 lakh  -> "45 lakh"
 *   otherwise  -> "65,000"  (typical rent)
 */
const CRORE = 10_000_000;
const LAKH = 100_000;

const trim = (n: number) => parseFloat(n.toFixed(2)).toString();

export function formatPricePKR(raw: number | string): string {
  const price = typeof raw === 'string' ? Number(raw) : raw;
  if (!Number.isFinite(price) || price < 0) return 'Price on request';
  if (price >= CRORE) return `${trim(price / CRORE)} crore`;
  if (price >= LAKH) return `${trim(price / LAKH)} lakh`;
  return Math.round(price).toLocaleString('en-PK');
}

/** "PKR 1.85 crore" — with currency label. */
export function formatPricePKRLabeled(raw: number | string): string {
  return `PKR ${formatPricePKR(raw)}`;
}

/** Compact price for map pins, e.g. "1.85cr", "45L", "65k". */
export function formatPriceShort(raw: number | string): string {
  const price = typeof raw === 'string' ? Number(raw) : raw;
  if (!Number.isFinite(price) || price < 0) return '—';
  if (price >= CRORE) return `${trim(price / CRORE)}cr`;
  if (price >= LAKH) return `${trim(price / LAKH)}L`;
  if (price >= 1000) return `${Math.round(price / 1000)}k`;
  return String(Math.round(price));
}

/** Human area label, e.g. "10 marla" / "2200 sq ft". */
export function formatArea(value: number | string, unit: 'marla' | 'sqft'): string {
  const v = typeof value === 'string' ? Number(value) : value;
  const n = parseFloat(v.toFixed(2)).toString();
  return unit === 'marla' ? `${n} marla` : `${n} sq ft`;
}
