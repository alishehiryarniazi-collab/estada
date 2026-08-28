/**
 * Fair-Price insight — Estada's signature trust feature.
 *
 * We estimate a listing's fair market price from COMPARABLE active listings
 * (same city + type + purpose, similar area) using the MEDIAN price-per-sqft
 * (median resists outliers/bait listings). Then we compare and label it:
 *   above      → priced above the market (mehnga)
 *   fair       → in line with the market
 *   below      → a good price, below market
 *   suspicious → priced FAR below market — a classic bait/scam signal, so we
 *                tell the buyer to verify documents before paying anything
 *
 * Also returns this listing's own price history (drops/rises over time).
 */
import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';

const AREA_TOLERANCE = 0.35; // comparables within ±35% of this listing's area
const MIN_COMPARABLES = 3; // need at least this many to trust the estimate

export type PriceVerdict = 'above' | 'fair' | 'below' | 'suspicious';

function median(nums: number[]): number {
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export async function getPriceInsight(id: string) {
  const property = await prisma.property.findUnique({
    where: { id },
    select: { id: true, price: true, areaSqft: true, city: true, propertyType: true, listingType: true },
  });
  if (!property) throw ApiError.notFound('Listing not found.');

  const history = await prisma.priceHistory.findMany({
    where: { propertyId: id },
    orderBy: { changedAt: 'asc' },
    select: { oldPrice: true, newPrice: true, changedAt: true },
  });

  const area = property.areaSqft;
  const comps = await prisma.property.findMany({
    where: {
      id: { not: id },
      city: property.city,
      propertyType: property.propertyType,
      listingType: property.listingType,
      status: 'active',
      isDraft: false,
      areaSqft: { gte: area * (1 - AREA_TOLERANCE), lte: area * (1 + AREA_TOLERANCE) },
    },
    select: { price: true, areaSqft: true },
  });

  if (comps.length < MIN_COMPARABLES) {
    return { insight: { enoughData: false, comparablesCount: comps.length }, history };
  }

  const perSqft = comps.map((c) => Number(c.price) / c.areaSqft);
  const medianPerSqft = median(perSqft);
  const estimate = medianPerSqft * area;
  const price = Number(property.price);
  const delta = (price - estimate) / estimate; // + = above market

  let verdict: PriceVerdict;
  if (delta > 0.15) verdict = 'above';
  else if (delta < -0.3) verdict = 'suspicious';
  else if (delta < -0.15) verdict = 'below';
  else verdict = 'fair';

  return {
    insight: {
      enoughData: true,
      comparablesCount: comps.length,
      estimate: Math.round(estimate),
      deltaPercent: Math.round(delta * 100),
      verdict,
    },
    history,
  };
}
