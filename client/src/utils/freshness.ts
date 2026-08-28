/**
 * Listing freshness — how recently the dealer confirmed it's still available.
 * A core anti-stale / trust signal: buyers can see at a glance whether a listing
 * is fresh or possibly outdated (the #1 complaint about other portals).
 */
const DAY = 86_400_000;
const STALE_DAYS = 14; // not confirmed in 2+ weeks → flagged as possibly outdated

export function getFreshness(lastConfirmedAt: string): {
  days: number;
  label: string;
  stale: boolean;
} {
  const days = Math.max(0, Math.floor((Date.now() - new Date(lastConfirmedAt).getTime()) / DAY));
  const stale = days >= STALE_DAYS;

  let label: string;
  if (stale) label = `Not confirmed in ${days} days`;
  else if (days === 0) label = 'Availability confirmed today';
  else if (days === 1) label = 'Confirmed available yesterday';
  else label = `Confirmed available ${days} days ago`;

  return { days, label, stale };
}
