/**
 * Admin operations: review document verifications, moderate reported listings,
 * manage users, and verify dealer identities.
 */
import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';

// ---- Document verifications ----

export function listPendingVerifications() {
  return prisma.propertyDocument.findMany({
    where: { verificationStatus: 'pending' },
    orderBy: { createdAt: 'asc' },
    include: {
      property: { select: { id: true, title: true, city: true, dealer: { select: { name: true } } } },
    },
  });
}

export async function reviewVerification(docId: string, status: 'verified' | 'rejected') {
  const doc = await prisma.propertyDocument.findUnique({ where: { id: docId } });
  if (!doc) throw ApiError.notFound('Document not found.');

  await prisma.propertyDocument.update({ where: { id: docId }, data: { verificationStatus: status } });

  // The listing is "documents verified" if it has at least one verified doc.
  const verifiedCount = await prisma.propertyDocument.count({
    where: { propertyId: doc.propertyId, verificationStatus: 'verified' },
  });
  await prisma.property.update({
    where: { id: doc.propertyId },
    data: { isDocumentVerified: verifiedCount > 0 },
  });

  return { ok: true };
}

// ---- Reports moderation ----

export function listReports() {
  return prisma.report.findMany({
    where: { status: 'pending' },
    orderBy: { createdAt: 'asc' },
    include: {
      property: { select: { id: true, title: true, status: true } },
      reportedBy: { select: { name: true, email: true } },
    },
  });
}

export async function reviewReport(
  id: string,
  status: 'reviewed' | 'dismissed',
  takeDown = false,
) {
  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) throw ApiError.notFound('Report not found.');

  await prisma.report.update({ where: { id }, data: { status } });

  // Optionally take the listing down (mark expired = hidden from search).
  if (takeDown) {
    await prisma.property.update({ where: { id: report.propertyId }, data: { status: 'expired' } });
  }
  return { ok: true };
}

// ---- Users ----

export function listUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isVerified: true,
      cnicNumber: true,
      createdAt: true,
      dealerProfile: { select: { businessName: true, verificationStatus: true } },
      _count: { select: { properties: true } },
    },
  });
}

/** Approve/reject a dealer's identity (CNIC review) — updates their profile. */
export async function verifyDealer(userId: string, status: 'verified' | 'rejected') {
  const profile = await prisma.dealerProfile.findUnique({ where: { userId } });
  if (!profile) throw ApiError.notFound('This user is not a dealer.');

  await prisma.$transaction([
    prisma.dealerProfile.update({ where: { userId }, data: { verificationStatus: status } }),
    prisma.user.update({ where: { id: userId }, data: { isVerified: status === 'verified' } }),
  ]);
  return { ok: true };
}
