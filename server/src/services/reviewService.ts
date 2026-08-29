/**
 * Dealer reviews + response-time stats (trust signals on the dealer profile).
 */
import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';

export async function upsertReview(
  authorId: string,
  dealerId: string,
  rating: number,
  comment?: string,
) {
  if (authorId === dealerId) throw ApiError.badRequest('You cannot review yourself.');
  const dealer = await prisma.user.findUnique({ where: { id: dealerId }, select: { id: true } });
  if (!dealer) throw ApiError.notFound('Dealer not found.');

  return prisma.review.upsert({
    where: { dealerId_authorId: { dealerId, authorId } },
    create: { dealerId, authorId, rating, comment },
    update: { rating, comment },
  });
}

/** Reviews list + aggregate rating for a dealer. */
export async function getReviews(dealerId: string) {
  const [reviews, agg] = await Promise.all([
    prisma.review.findMany({
      where: { dealerId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        author: { select: { name: true } },
      },
    }),
    prisma.review.aggregate({
      where: { dealerId },
      _avg: { rating: true },
      _count: true,
    }),
  ]);

  return {
    reviews,
    rating: { avg: agg._avg.rating ? Number(agg._avg.rating.toFixed(1)) : null, count: agg._count },
  };
}

/** Just the aggregate — used when embedding in the dealer profile/listing. */
export async function getRatingSummary(dealerId: string) {
  const agg = await prisma.review.aggregate({
    where: { dealerId },
    _avg: { rating: true },
    _count: true,
  });
  return { avg: agg._avg.rating ? Number(agg._avg.rating.toFixed(1)) : null, count: agg._count };
}

/**
 * Rough "usually replies in ..." label from how quickly the dealer sent their
 * first message on past enquiries. Returns null if there's not enough data.
 */
export async function getResponseLabel(dealerId: string): Promise<string | null> {
  const enquiries = await prisma.enquiry.findMany({
    where: { property: { dealerId } },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: {
      createdAt: true,
      messages: {
        where: { senderId: dealerId },
        orderBy: { createdAt: 'asc' },
        take: 1,
        select: { createdAt: true },
      },
    },
  });

  const gaps = enquiries
    .filter((e) => e.messages.length > 0)
    .map((e) => e.messages[0].createdAt.getTime() - e.createdAt.getTime())
    .filter((ms) => ms >= 0);

  if (gaps.length < 2) return null;
  const avgHours = gaps.reduce((a, b) => a + b, 0) / gaps.length / 3_600_000;

  if (avgHours <= 2) return 'Usually replies within a couple of hours';
  if (avgHours <= 8) return 'Usually replies within a few hours';
  if (avgHours <= 24) return 'Usually replies within a day';
  return 'Usually replies within a few days';
}
