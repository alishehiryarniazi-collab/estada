import { z } from 'zod';
import { safeText } from './common.js';

export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1, 'Pick 1–5 stars.').max(5),
  comment: safeText(1, 1000).optional(),
});
