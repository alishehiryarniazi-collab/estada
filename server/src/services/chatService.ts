/**
 * In-app chat between a buyer and a dealer, scoped to an enquiry thread.
 *
 * Privacy rule (Section 5): phone numbers are hidden until BOTH parties opt to
 * share within the chat. Each side flips their own flag; only when both are set
 * do we reveal the numbers.
 */
import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';

/** Loads an enquiry and verifies the user is a participant (buyer or dealer). */
export async function loadParticipant(enquiryId: string, userId: string) {
  const enquiry = await prisma.enquiry.findUnique({
    where: { id: enquiryId },
    include: {
      buyer: { select: { id: true, name: true, phone: true } },
      property: {
        select: {
          id: true,
          title: true,
          dealerId: true,
          dealer: { select: { id: true, name: true, phone: true } },
          images: { where: { isPrimary: true }, take: 1, select: { imageUrl: true } },
        },
      },
    },
  });
  if (!enquiry) throw ApiError.notFound('Conversation not found.');

  const isBuyer = enquiry.buyerId === userId;
  const isDealer = enquiry.property.dealerId === userId;
  if (!isBuyer && !isDealer) throw ApiError.forbidden('You are not part of this conversation.');

  return { enquiry, isBuyer, isDealer };
}

function phoneState(enquiry: { phoneSharedByBuyer: boolean; phoneSharedByDealer: boolean }) {
  return {
    sharedByBuyer: enquiry.phoneSharedByBuyer,
    sharedByDealer: enquiry.phoneSharedByDealer,
    revealed: enquiry.phoneSharedByBuyer && enquiry.phoneSharedByDealer,
  };
}

/** All conversations the user is in (as buyer or as the listing's dealer). */
export async function listThreads(userId: string) {
  const enquiries = await prisma.enquiry.findMany({
    where: { OR: [{ buyerId: userId }, { property: { dealerId: userId } }] },
    orderBy: { createdAt: 'desc' },
    include: {
      buyer: { select: { id: true, name: true } },
      property: {
        select: {
          id: true,
          title: true,
          dealerId: true,
          dealer: { select: { id: true, name: true } },
          images: { where: { isPrimary: true }, take: 1, select: { imageUrl: true } },
        },
      },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });

  return enquiries.map((e) => {
    const isBuyer = e.buyerId === userId;
    return {
      id: e.id,
      propertyId: e.property.id,
      propertyTitle: e.property.title,
      propertyImage: e.property.images[0]?.imageUrl || null,
      counterpartName: isBuyer ? e.property.dealer.name : e.buyer.name,
      isBuyer,
      lastMessage: e.messages[0]?.content || e.message,
      lastAt: e.messages[0]?.createdAt || e.createdAt,
      phone: phoneState(e),
    };
  });
}

export async function getMessages(enquiryId: string, userId: string) {
  const { isBuyer } = await loadParticipant(enquiryId, userId);

  const messages = await prisma.message.findMany({
    where: { enquiryId },
    orderBy: { createdAt: 'asc' },
    select: { id: true, senderId: true, content: true, createdAt: true },
  });

  // Mark messages from the other party as read.
  await prisma.message.updateMany({
    where: { enquiryId, senderId: { not: userId }, isRead: false },
    data: { isRead: true },
  });

  return { messages, isBuyer, currentUserId: userId };
}

export async function createMessage(enquiryId: string, userId: string, content: string) {
  await loadParticipant(enquiryId, userId);
  const text = content.trim();
  if (!text) throw ApiError.badRequest('Message cannot be empty.');
  if (text.length > 2000) throw ApiError.badRequest('Message is too long.');

  return prisma.message.create({
    data: { enquiryId, senderId: userId, content: text },
    select: { id: true, senderId: true, content: true, createdAt: true },
  });
}

/** Flip the caller's phone-share flag; reveal both numbers once both agree. */
export async function sharePhone(enquiryId: string, userId: string) {
  const { enquiry, isBuyer } = await loadParticipant(enquiryId, userId);

  const updated = await prisma.enquiry.update({
    where: { id: enquiryId },
    data: isBuyer ? { phoneSharedByBuyer: true } : { phoneSharedByDealer: true },
  });

  const state = phoneState(updated);
  return {
    phone: state,
    // Only send the actual numbers when both have opted in.
    buyerPhone: state.revealed ? enquiry.buyer.phone : null,
    dealerPhone: state.revealed ? enquiry.property.dealer.phone : null,
  };
}
