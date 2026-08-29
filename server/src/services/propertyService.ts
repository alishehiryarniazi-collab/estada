/**
 * Property business logic: search/filter, detail, create, update, status.
 *
 * Key rules enforced here:
 *  - Public results only ever expose an APPROXIMATE location + no exact address
 *    (Section 11). The owner and admins see the real values.
 *  - Every price change is logged to price_history (Phase-2 UI, but the data
 *    must be captured from day one).
 *  - Area is stored in the user's unit AND normalised to sqft for filtering.
 */
import type { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { toSqft } from '../utils/area.js';
import { approximateLocation } from '../utils/geo.js';
import { hasEnquired } from './enquiryService.js';
import { notifyMatchingSavedSearches } from './notifyService.js';
import { getRatingSummary, getResponseLabel } from './reviewService.js';
import type {
  CreatePropertyInput,
  UpdatePropertyInput,
  SearchQuery,
} from '../validators/property.js';

const LISTING_DURATION_DAYS = 30;

// Fields shown on listing cards (grid/search results). Exported for reuse by
// the saved-properties and dealer-profile queries.
export const cardSelect = {
  id: true,
  title: true,
  propertyType: true,
  listingType: true,
  price: true,
  areaValue: true,
  areaUnit: true,
  bedrooms: true,
  bathrooms: true,
  city: true,
  areaName: true,
  status: true,
  isDocumentVerified: true,
  isFeatured: true,
  videoUrl: true,
  lat: true,
  lng: true,
  createdAt: true,
  lastConfirmedAt: true,
  images: {
    where: { isPrimary: true },
    take: 1,
    select: { imageUrl: true },
  },
} satisfies Prisma.PropertySelect;

/** Strip exact location from a card and replace with the fuzzed pin. */
export function publicCard<T extends { id: string; lat: number; lng: number }>(p: T) {
  const approx = approximateLocation(p.lat, p.lng, p.id);
  return { ...p, lat: approx.lat, lng: approx.lng, approximate: true };
}

export async function searchProperties(query: SearchQuery) {
  const where: Prisma.PropertyWhereInput = {
    // Public search shows active, published (non-draft) listings only.
    status: 'active',
    isDraft: false,
  };

  if (query.propertyType) where.propertyType = query.propertyType;
  if (query.listingType) where.listingType = query.listingType;
  // Note: MySQL's default collation is case-insensitive, so `contains` already
  // matches regardless of case — no `mode: 'insensitive'` needed (it's Postgres-only).
  if (query.city) where.city = { contains: query.city };

  if (query.q) {
    where.OR = [
      { title: { contains: query.q } },
      { description: { contains: query.q } },
      { city: { contains: query.q } },
      { areaName: { contains: query.q } },
    ];
  }

  if (query.minPrice != null || query.maxPrice != null) {
    where.price = {};
    if (query.minPrice != null) where.price.gte = query.minPrice;
    if (query.maxPrice != null) where.price.lte = query.maxPrice;
  }

  if (query.bedrooms != null) where.bedrooms = { gte: query.bedrooms };
  if (query.bathrooms != null) where.bathrooms = { gte: query.bathrooms };

  // Trust filter: verified-documents listings only.
  if (query.verifiedOnly) where.isDocumentVerified = true;

  // Area filter — convert the requested min/max into sqft to match areaSqft.
  if (query.minArea != null || query.maxArea != null) {
    where.areaSqft = {};
    if (query.minArea != null) where.areaSqft.gte = toSqft(query.minArea, query.areaUnit);
    if (query.maxArea != null) where.areaSqft.lte = toSqft(query.maxArea, query.areaUnit);
  }

  // Map-bounds filter for "search as you move the map" (need all four corners).
  if (
    query.neLat != null &&
    query.neLng != null &&
    query.swLat != null &&
    query.swLng != null
  ) {
    where.lat = { gte: query.swLat, lte: query.neLat };
    where.lng = { gte: query.swLng, lte: query.neLng };
  }

  // Sort — always add id as a tiebreaker so cursor pagination is stable.
  const orderBy: Prisma.PropertyOrderByWithRelationInput[] =
    query.sort === 'price_asc'
      ? [{ price: 'asc' }, { id: 'asc' }]
      : query.sort === 'price_desc'
        ? [{ price: 'desc' }, { id: 'asc' }]
        : query.sort === 'area_desc'
          ? [{ areaSqft: 'desc' }, { id: 'asc' }]
          : [{ createdAt: 'desc' }, { id: 'asc' }];

  const items = await prisma.property.findMany({
    where,
    orderBy,
    take: query.limit + 1, // fetch one extra to know if there's a next page
    ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
    select: cardSelect,
  });

  const hasMore = items.length > query.limit;
  const page = hasMore ? items.slice(0, query.limit) : items;

  return {
    items: page.map(publicCard),
    nextCursor: hasMore ? page[page.length - 1].id : null,
  };
}

export async function getPropertyById(id: string, requesterId?: string, requesterRole?: string) {
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      dealer: {
        select: {
          id: true,
          name: true,
          isVerified: true,
          dealerProfile: {
            select: { businessName: true, profilePhotoUrl: true, verificationStatus: true },
          },
        },
      },
    },
  });

  if (!property) throw ApiError.notFound('This listing was not found or has been removed.');

  // Count a view (fire-and-forget; failure shouldn't break the page).
  prisma.property
    .update({ where: { id }, data: { viewCount: { increment: 1 } } })
    .catch(() => undefined);

  const isOwner = requesterId === property.dealerId;
  const isAdmin = requesterRole === 'admin';
  // A buyer who has already enquired earns the exact address (privacy rule).
  const enquired = requesterId ? await hasEnquired(requesterId, property.id) : false;

  // Owner/admin/enquired-buyer see exact location + address; others get the fuzzed pin.
  if (isOwner || isAdmin || enquired) {
    return { ...property, approximate: false };
  }

  const approx = approximateLocation(property.lat, property.lng, property.id);
  return {
    ...property,
    address: null, // hidden until an enquiry is made (revealed in a later milestone)
    lat: approx.lat,
    lng: approx.lng,
    approximate: true,
  };
}

export async function createProperty(dealerId: string, input: CreatePropertyInput) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + LISTING_DURATION_DAYS);

  const images = input.images ?? [];

  const created = await prisma.property.create({
    data: {
      dealerId,
      title: input.title,
      description: input.description,
      propertyType: input.propertyType,
      listingType: input.listingType,
      price: input.price,
      areaValue: input.areaValue,
      areaUnit: input.areaUnit,
      areaSqft: toSqft(input.areaValue, input.areaUnit),
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      address: input.address,
      lat: input.lat,
      lng: input.lng,
      city: input.city,
      areaName: input.areaName,
      floorPlanUrl: input.floorPlanUrl,
      videoUrl: input.videoUrl || null,
      isDraft: input.isDraft ?? false,
      expiresAt,
      images: {
        create: images.map((url, i) => ({
          imageUrl: url,
          isPrimary: i === 0, // first uploaded photo is the cover
          sortOrder: i,
        })),
      },
    },
    include: { images: true },
  });

  // If it's published straight away, alert matching saved searches.
  if (!created.isDraft) notifyMatchingSavedSearches(created.id).catch(() => undefined);
  return created;
}

/** A dealer's own listings (INCLUDING drafts) for their dashboard. */
export async function getMyListings(dealerId: string) {
  const items = await prisma.property.findMany({
    where: { dealerId },
    orderBy: { createdAt: 'desc' },
    select: {
      ...cardSelect,
      isDraft: true,
      viewCount: true,
      saveCount: true,
      enquiryCount: true,
      expiresAt: true,
    },
  });
  // Owner sees exact coords on their own dashboard, so no fuzzing here.
  return items;
}

/** Public dealer profile: basic info + their active, published listings. */
export async function getDealerProfile(dealerId: string) {
  const dealer = await prisma.user.findUnique({
    where: { id: dealerId },
    select: {
      id: true,
      name: true,
      isVerified: true,
      createdAt: true,
      dealerProfile: {
        select: { businessName: true, bio: true, profilePhotoUrl: true, verificationStatus: true },
      },
    },
  });
  if (!dealer) throw ApiError.notFound('Dealer not found.');

  const [listings, rating, responseLabel] = await Promise.all([
    prisma.property.findMany({
      where: { dealerId, status: 'active', isDraft: false },
      orderBy: { createdAt: 'desc' },
      select: cardSelect,
    }),
    getRatingSummary(dealerId),
    getResponseLabel(dealerId),
  ]);

  return { dealer, listings: listings.map(publicCard), rating, responseLabel };
}

/** Ensures the property exists and belongs to the requester (or they're admin). */
async function assertOwnership(id: string, userId: string, role: string) {
  const property = await prisma.property.findUnique({ where: { id } });
  if (!property) throw ApiError.notFound('This listing was not found.');
  if (property.dealerId !== userId && role !== 'admin') {
    throw ApiError.forbidden('You can only edit your own listings.');
  }
  return property;
}

export async function updateProperty(
  id: string,
  userId: string,
  role: string,
  input: UpdatePropertyInput,
) {
  const existing = await assertOwnership(id, userId, role);

  // Pull out relation/derived fields — the rest are plain scalars we can set.
  const { images, ...scalars } = input;
  const data: Prisma.PropertyUpdateInput = { ...scalars };

  // If new images were provided, replace the whole gallery.
  if (images) {
    data.images = {
      deleteMany: {},
      create: images.map((url, i) => ({ imageUrl: url, isPrimary: i === 0, sortOrder: i })),
    };
  }

  // Recompute normalised area if either area field changed.
  if (input.areaValue != null || input.areaUnit != null) {
    const value = input.areaValue ?? Number(existing.areaValue);
    const unit = input.areaUnit ?? existing.areaUnit;
    data.areaSqft = toSqft(value, unit);
  }

  // If the price changed, log the change to price_history (never backfillable).
  const priceChanged = input.price != null && input.price !== Number(existing.price);

  if (priceChanged) {
    await prisma.priceHistory.create({
      data: { propertyId: id, oldPrice: existing.price, newPrice: input.price! },
    });
  }

  const updated = await prisma.property.update({ where: { id }, data });

  // If this update published a previously-draft listing, alert saved searches.
  if (existing.isDraft && updated.isDraft === false) {
    notifyMatchingSavedSearches(updated.id).catch(() => undefined);
  }
  return updated;
}

/** Renew a listing for another 30 days and set it active again. */
export async function renewListing(id: string, userId: string, role: string) {
  await assertOwnership(id, userId, role);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + LISTING_DURATION_DAYS);
  return prisma.property.update({
    where: { id },
    data: { status: 'active', expiresAt, lastConfirmedAt: new Date() },
  });
}

/** Dealer confirms the listing is still available (freshness / anti-stale). */
export async function confirmAvailability(id: string, userId: string, role: string) {
  await assertOwnership(id, userId, role);
  return prisma.property.update({
    where: { id },
    data: { lastConfirmedAt: new Date() },
  });
}

export async function changeStatus(id: string, userId: string, role: string, status: string) {
  await assertOwnership(id, userId, role);
  return prisma.property.update({
    where: { id },
    data: { status: status as Prisma.PropertyUpdateInput['status'] },
  });
}
