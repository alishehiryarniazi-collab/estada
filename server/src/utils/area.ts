/**
 * Area unit helpers.
 *
 * Pakistani listings quote area in either marla or square feet. We store the
 * user's chosen unit AND a normalised square-foot value so search can compare
 * across units. Using the standard 1 marla = 272.25 sqft (Punjab/most common).
 */
import type { AreaUnit } from '@prisma/client';

export const SQFT_PER_MARLA = 272.25;

export function toSqft(value: number, unit: AreaUnit): number {
  return unit === 'marla' ? value * SQFT_PER_MARLA : value;
}
