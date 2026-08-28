import type { Request, Response } from 'express';
import * as savedService from '../services/savedService.js';

export async function toggleSaved(req: Request, res: Response) {
  const result = await savedService.toggleSavedProperty(req.user!.userId, req.params.id);
  res.json(result);
}

export async function savedIds(req: Request, res: Response) {
  const ids = await savedService.getSavedIds(req.user!.userId);
  res.json({ ids });
}

export async function savedList(req: Request, res: Response) {
  const items = await savedService.listSavedProperties(req.user!.userId);
  res.json({ items });
}

export async function createSearch(req: Request, res: Response) {
  const search = await savedService.createSavedSearch(req.user!.userId, req.body);
  res.status(201).json({ search });
}

export async function listSearches(req: Request, res: Response) {
  const searches = await savedService.listSavedSearches(req.user!.userId);
  res.json({ searches });
}

export async function deleteSearch(req: Request, res: Response) {
  await savedService.deleteSavedSearch(req.user!.userId, req.params.id);
  res.json({ message: 'Removed.' });
}
