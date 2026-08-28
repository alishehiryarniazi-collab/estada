/**
 * Zod schemas for enquiries and reports (the two write actions on a listing).
 */
import { z } from 'zod';
import { safeText, pkPhone } from './common.js';

export const createEnquirySchema = z.object({
  propertyId: z.string().min(1, 'Missing property reference.'),
  message: safeText(10, 2000),
  // Optional: if the buyer has no phone on file, they can add one here.
  phone: pkPhone.optional(),
});

export const createReportSchema = z.object({
  reason: safeText(5, 1000),
});

export type CreateEnquiryInput = z.infer<typeof createEnquirySchema>;
export type CreateReportInput = z.infer<typeof createReportSchema>;
