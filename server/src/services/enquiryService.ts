/**
 * Enquiry + report business logic.
 *
 * Creating an enquiry:
 *  - the buyer must be logged in (we store their id)
 *  - it opens a chat thread (we drop the first Message in too, ready for M5 chat)
 *  - it bumps the listing's enquiryCount
 *  - AFTER this, the buyer is allowed to see the exact address (privacy rule)
 */
import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { notifyDealerOfEnquiry } from './notifyService.js';
import type { CreateEnquiryInput } from '../validators/enquiry.js';

export async function createEnquiry(buyerId: string, input: CreateEnquiryInput) {
  const property = await prisma.property.findUnique({
    where: { id: input.propertyId },
    select: { id: true, dealerId: true, status: true },
  });
  if (!property) throw ApiError.notFound('This listing was not found.');
  if (property.dealerId === buyerId) {
    throw ApiError.badRequest('You cannot enquire about your own listing.');
  }

  // If the buyer supplied a phone and has none saved, store it for convenience.
  if (input.phone) {
    await prisma.user.updateMany({
      where: { id: buyerId, phone: null },
      data: { phone: input.phone },
    });
  }

  // Create the enquiry + its first chat message + bump the counter together.
  const [enquiry] = await prisma.$transaction([
    prisma.enquiry.create({
      data: {
        propertyId: property.id,
        buyerId,
        message: input.message,
        messages: { create: { senderId: buyerId, content: input.message } },
      },
    }),
    prisma.property.update({
      where: { id: property.id },
      data: { enquiryCount: { increment: 1 } },
    }),
  ]);

  // Email the dealer (best-effort, non-blocking).
  notifyDealerOfEnquiry(property.id, buyerId, input.message).catch(() => undefined);

  return enquiry;
}

/** True if this user has already enquired about this property (unlocks address). */
export async function hasEnquired(userId: string, propertyId: string): Promise<boolean> {
  const found = await prisma.enquiry.findFirst({
    where: { buyerId: userId, propertyId },
    select: { id: true },
  });
  return !!found;
}

export async function createReport(reporterId: string, propertyId: string, reason: string) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { id: true },
  });
  if (!property) throw ApiError.notFound('This listing was not found.');

  return prisma.report.create({
    data: { propertyId, reportedById: reporterId, reason },
  });
}
