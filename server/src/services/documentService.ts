/**
 * Property ownership documents (registry / allotment letter). A dealer uploads;
 * an admin reviews (see adminService) and, on approval, the listing shows the
 * "Documents Verified" badge.
 */
import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';

export async function addDocument(
  propertyId: string,
  userId: string,
  role: string,
  documentUrl: string,
  documentType?: string,
) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { dealerId: true },
  });
  if (!property) throw ApiError.notFound('Listing not found.');
  if (property.dealerId !== userId && role !== 'admin') {
    throw ApiError.forbidden('You can only add documents to your own listing.');
  }

  return prisma.propertyDocument.create({
    data: { propertyId, documentUrl, documentType, verificationStatus: 'pending' },
  });
}

export async function listDocumentsForProperty(propertyId: string) {
  return prisma.propertyDocument.findMany({
    where: { propertyId },
    orderBy: { createdAt: 'desc' },
  });
}
