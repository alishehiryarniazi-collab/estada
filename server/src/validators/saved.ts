import { z } from 'zod';

/** A saved search stores the filter params (JSON) + how often to alert. */
export const savedSearchSchema = z.object({
  params: z.record(z.string(), z.any()).default({}),
  alertFrequency: z.enum(['instant', 'daily', 'weekly']).default('daily'),
});

export type SavedSearchInput = z.infer<typeof savedSearchSchema>;
