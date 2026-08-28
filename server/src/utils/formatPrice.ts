/**
 * PKR price formatting — Pakistani lakh/crore convention.
 *
 * WHY one shared util (Section 8): prices appear in many places (cards, detail
 * pages, emails). Repeating the logic invites inconsistency. This is the single
 * source of truth; the frontend has a matching copy in client/src/utils.
 *
 * Rules:
 *   >= 1 crore (10,000,000) -> "X.XX crore"
 *   >= 1 lakh  (100,000)     -> "X.XX lakh"
 *   otherwise                -> grouped with commas (e.g. rent "65,000")
 * Trailing ".00" / ".0" is trimmed so we show "45 lakh" not "45.00 lakh".
 */
const CRORE = 10_000_000;
const LAKH = 100_000;

function trim(value: number): string {
  // Keep up to 2 decimals but drop trailing zeros: 1.85 -> "1.85", 45.0 -> "45".
  return parseFloat(value.toFixed(2)).toString();
}

export function formatPricePKR(rawPrice: number | string): string {
  const price = typeof rawPrice === 'string' ? Number(rawPrice) : rawPrice;

  if (!Number.isFinite(price) || price < 0) return 'Price on request';

  if (price >= CRORE) return `${trim(price / CRORE)} crore`;
  if (price >= LAKH) return `${trim(price / LAKH)} lakh`;

  // Smaller figures (typical rents): group with commas, no decimals.
  return Math.round(price).toLocaleString('en-PK');
}

/** Same value prefixed with the currency label, e.g. "PKR 1.85 crore". */
export function formatPricePKRLabeled(rawPrice: number | string): string {
  return `PKR ${formatPricePKR(rawPrice)}`;
}
