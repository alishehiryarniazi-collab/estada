/**
 * Property controllers — thin HTTP layer over propertyService.
 */
import type { Request, Response } from 'express';
import * as propertyService from '../services/propertyService.js';
import { getPriceInsight } from '../services/priceInsightService.js';

export async function list(req: Request, res: Response) {
  // req.query has already been validated/coerced by the search schema.
  const result = await propertyService.searchProperties(req.query as never);
  res.json(result);
}

export async function detail(req: Request, res: Response) {
  const property = await propertyService.getPropertyById(
    req.params.id,
    req.user?.userId,
    req.user?.role,
  );
  res.json({ property });
}

export async function create(req: Request, res: Response) {
  const property = await propertyService.createProperty(req.user!.userId, req.body);
  res.status(201).json({ property });
}

export async function update(req: Request, res: Response) {
  const property = await propertyService.updateProperty(
    req.params.id,
    req.user!.userId,
    req.user!.role,
    req.body,
  );
  res.json({ property });
}

export async function updateStatus(req: Request, res: Response) {
  const property = await propertyService.changeStatus(
    req.params.id,
    req.user!.userId,
    req.user!.role,
    req.body.status,
  );
  res.json({ property });
}

export async function renew(req: Request, res: Response) {
  const property = await propertyService.renewListing(
    req.params.id,
    req.user!.userId,
    req.user!.role,
  );
  res.json({ property });
}

export async function priceInsight(req: Request, res: Response) {
  const data = await getPriceInsight(req.params.id);
  res.json(data);
}

export async function confirmAvailable(req: Request, res: Response) {
  const property = await propertyService.confirmAvailability(
    req.params.id,
    req.user!.userId,
    req.user!.role,
  );
  res.json({ property });
}

/** The logged-in dealer's own listings (including drafts) for their dashboard. */
export async function myListings(req: Request, res: Response) {
  const items = await propertyService.getMyListings(req.user!.userId);
  res.json({ items });
}

/** Public dealer profile + their active listings. */
export async function dealerProfile(req: Request, res: Response) {
  const data = await propertyService.getDealerProfile(req.params.id);
  res.json(data);
}
