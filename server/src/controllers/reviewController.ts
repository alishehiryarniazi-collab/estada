import type { Request, Response } from 'express';
import { upsertReview, getReviews } from '../services/reviewService.js';

export async function createReview(req: Request, res: Response) {
  const review = await upsertReview(
    req.user!.userId,
    req.params.id,
    req.body.rating,
    req.body.comment,
  );
  res.status(201).json({ review });
}

export async function listReviews(req: Request, res: Response) {
  res.json(await getReviews(req.params.id));
}
