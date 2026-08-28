/**
 * Email notifications triggered by app events:
 *  - a buyer enquires  -> notify the dealer
 *  - a new listing is published -> alert users whose saved search matches
 *
 * All sends are best-effort (fire-and-forget) so they never block or fail the
 * request that triggered them.
 */
import { prisma } from '../config/prisma.js';
import { sendMail } from './mailService.js';
import { formatPricePKR } from '../utils/formatPrice.js';

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] || c,
  );
}

export async function notifyDealerOfEnquiry(propertyId: string, buyerId: string, message: string) {
  const [property, buyer] = await Promise.all([
    prisma.property.findUnique({
      where: { id: propertyId },
      select: { title: true, dealer: { select: { email: true } } },
    }),
    prisma.user.findUnique({ where: { id: buyerId }, select: { name: true } }),
  ]);
  if (!property || !buyer) return;

  const body = `
    <p><strong>${escapeHtml(buyer.name)}</strong> is interested in your listing
    <strong>${escapeHtml(property.title)}</strong>.</p>
    <p style="background:#fff;border:1px solid #E5E4DE;border-radius:8px;padding:12px">${escapeHtml(message)}</p>
    <p>Open your Estada messages to reply.</p>`;
  sendMail(property.dealer.email, `New enquiry: ${property.title}`, 'You have a new enquiry', body);
}

interface MatchableProperty {
  title: string;
  city: string;
  listingType: string;
  propertyType: string;
  price: unknown;
  bedrooms: number | null;
}

function matches(params: Record<string, unknown>, p: MatchableProperty): boolean {
  const price = Number(p.price);
  if (params.city && !p.city.toLowerCase().includes(String(params.city).toLowerCase())) return false;
  if (params.listingType && p.listingType !== params.listingType) return false;
  if (params.propertyType && p.propertyType !== params.propertyType) return false;
  if (params.minPrice && price < Number(params.minPrice)) return false;
  if (params.maxPrice && price > Number(params.maxPrice)) return false;
  if (params.bedrooms && (p.bedrooms ?? 0) < Number(params.bedrooms)) return false;
  return true;
}

export async function notifyMatchingSavedSearches(propertyId: string) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: {
      title: true, city: true, areaName: true, listingType: true,
      propertyType: true, price: true, bedrooms: true,
    },
  });
  if (!property) return;

  const searches = await prisma.savedSearch.findMany({
    include: { user: { select: { email: true } } },
  });

  const body = `
    <p>A new listing matches one of your saved searches:</p>
    <p><strong>${escapeHtml(property.title)}</strong><br/>
    ${escapeHtml(property.areaName)}, ${escapeHtml(property.city)} — PKR ${formatPricePKR(Number(property.price))}</p>
    <p>Log in to Estada to view it.</p>`;

  for (const s of searches) {
    if (matches(s.searchParams as Record<string, unknown>, property)) {
      sendMail(s.user.email, `New match: ${property.title}`, 'New listing for your saved search', body);
    }
  }
}
