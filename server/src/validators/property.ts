/**
 * Zod schemas for property endpoints: create, update, status change, and the
 * search/filter query. Enums mirror the Prisma schema exactly.
 */
import { z } from 'zod';
import { safeText, positiveNumber } from './common.js';

const propertyType = z.enum(['house', 'plot', 'flat', 'commercial', 'agricultural']);
const listingType = z.enum(['sale', 'rent']);
const areaUnit = z.enum(['marla', 'sqft']);
const propertyStatus = z.enum(['active', 'under_offer', 'sold', 'expired']);

export const createPropertySchema = z.object({
  title: safeText(5, 120),
  description: safeText(20, 5000),
  propertyType,
  listingType,
  price: positiveNumber.max(100_000_000_000, 'Price looks too large.'),
  areaValue: positiveNumber,
  areaUnit,
  bedrooms: z.coerce.number().int().min(0).max(50).optional(),
  bathrooms: z.coerce.number().int().min(0).max(50).optional(),
  address: safeText(5, 200),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  city: safeText(2, 60),
  areaName: safeText(2, 80),
  floorPlanUrl: z.string().url().optional(),
  // Image URLs from our upload endpoint (Cloudinary https or local /uploads path).
  images: z
    .array(z.string().regex(/^(https?:\/\/|\/uploads\/)/, 'Invalid image URL.'))
    .max(15)
    .optional(),
  // Save without publishing (hidden from public search until published).
  isDraft: z.boolean().optional(),
});

// Update: same fields but all optional (PATCH — send only what changed).
export const updatePropertySchema = createPropertySchema.partial();

export const statusSchema = z.object({
  status: propertyStatus,
});

// Search query params (all optional). Coerced from strings since they arrive in the URL.
export const searchQuerySchema = z.object({
  q: z.string().trim().max(120).optional(), // keyword
  city: z.string().trim().max(60).optional(),
  propertyType: propertyType.optional(),
  listingType: listingType.optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  bedrooms: z.coerce.number().int().min(0).optional(), // minimum beds
  bathrooms: z.coerce.number().int().min(0).optional(), // minimum baths
  minArea: z.coerce.number().nonnegative().optional(), // in areaUnit below
  maxArea: z.coerce.number().nonnegative().optional(),
  areaUnit: areaUnit.default('sqft'), // unit that min/maxArea are expressed in

  // Trust filter: only show listings with verified ownership documents.
  verifiedOnly: z.coerce.boolean().optional(),

  // Map bounds for "search as you move the map" (all four required together).
  neLat: z.coerce.number().optional(),
  neLng: z.coerce.number().optional(),
  swLat: z.coerce.number().optional(),
  swLng: z.coerce.number().optional(),

  sort: z.enum(['newest', 'price_asc', 'price_desc', 'area_desc']).default('newest'),

  // Cursor pagination for infinite scroll (20 per batch, Section 8).
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;
