/**
 * Zod schemas for auth endpoints. Server-side validation is the source of
 * truth — the client validates too (better UX), but we never trust the client.
 */
import { z } from 'zod';
import { pkPhone, cnic, safeText } from './common.js';

export const registerSchema = z
  .object({
    name: safeText(2, 80),
    email: z.string().email('Enter a valid email address.').toLowerCase(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .max(100, 'Password is too long.'),
    phone: pkPhone.optional(),
    // Buyers just browse; dealers/owners list property and must verify identity.
    role: z.enum(['buyer', 'dealer', 'owner']).default('buyer'),
    // Required for dealers/owners (checked below), optional for buyers.
    cnicNumber: cnic.optional(),
  })
  .refine((data) => data.role === 'buyer' || !!data.cnicNumber, {
    message: 'CNIC is required for dealers and owners (identity verification).',
    path: ['cnicNumber'],
  });

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address.').toLowerCase(),
  password: z.string().min(1, 'Password is required.'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
