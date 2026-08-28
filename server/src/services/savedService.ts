/**
 * Shortlist (saved properties) + saved searches.
 * Toggling a shortlist also keeps the listing's saveCount roughly in sync
 * (Phase-2 analytics).
 */
import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { cardSelect, publicCard } from './propertyService.js';
import type { SavedSearchInput } from '../validators/saved.js';

export async function toggleSavedProperty(userId: string, propertyId: string) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { id: true },
  });
  if (!property) throw ApiError.notFound('This listing was not found.');

  const existing = await prisma.savedProperty.findUnique({
    where: { userId_propertyId: { userId, propertyId } },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.savedProperty.delete({ where: { id: existing.id } }),
      prisma.property.update({
        where: { id: propertyId },
        data: { saveCount: { decrement: 1 } },
      }),
    ]);
    return { saved: false };
  }

  await prisma.$transaction([
    prisma.savedProperty.create({ data: { userId, propertyId } }),
    prisma.property.update({ where: { id: propertyId }, data: { saveCount: { increment: 1 } } }),
  ]);
  return { saved: true };
}

/** Just the ids — used by the client to render heart states quickly. */
export async function getSavedIds(userId: string): Promise<string[]> {
  const rows = await prisma.savedProperty.findMany({
    where: { userId },
    select: { propertyId: true },
  });
  return rows.map((r) => r.propertyId);
}

/** Full cards for the shortlist page. */
export async function listSavedProperties(userId: string) {
  const rows = await prisma.savedProperty.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: { property: { select: cardSelect } },
  });
  return rows.map((r) => publicCard(r.property));
}

export async function createSavedSearch(userId: string, input: SavedSearchInput) {
  return prisma.savedSearch.create({
    data: { userId, searchParams: input.params, alertFrequency: input.alertFrequency },
  });
}

export async function listSavedSearches(userId: string) {
  return prisma.savedSearch.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function deleteSavedSearch(userId: string, id: string) {
  // deleteMany scoped by userId so a user can only delete their own.
  const result = await prisma.savedSearch.deleteMany({ where: { id, userId } });
  if (result.count === 0) throw ApiError.notFound('Saved search not found.');
}
