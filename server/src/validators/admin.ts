import { z } from 'zod';

export const verificationReviewSchema = z.object({
  status: z.enum(['verified', 'rejected']),
});

export const reportReviewSchema = z.object({
  status: z.enum(['reviewed', 'dismissed']),
  takeDown: z.boolean().optional(),
});
