/**
 * Reusable Zod pieces shared across validators — especially Pakistan-specific
 * formats (phone, CNIC) so the rules live in exactly one place.
 */
import { z } from 'zod';
import { cleanText } from '../utils/sanitize.js';

// Pakistani mobile: 03XXXXXXXXX (11 digits) or +923XXXXXXXXX. Spaces/dashes allowed on input.
const PK_PHONE = /^(?:\+92|0)3\d{9}$/;

// CNIC: 13 digits, optionally dashed as XXXXX-XXXXXXX-X.
const CNIC = /^\d{5}-?\d{7}-?\d$/;

/** Normalises a phone by removing spaces/dashes, then validates PK mobile format. */
export const pkPhone = z
  .string()
  .transform((v) => v.replace(/[\s-]/g, ''))
  .refine((v) => PK_PHONE.test(v), {
    message: 'Enter a valid Pakistani mobile number (e.g. 03001234567).',
  });

export const cnic = z
  .string()
  .refine((v) => CNIC.test(v), { message: 'Enter a valid 13-digit CNIC.' });

/** Plain-text string that is trimmed + HTML-sanitised, with a length range. */
export const safeText = (min: number, max: number) =>
  z
    .string()
    .transform((v) => cleanText(v))
    .refine((v) => v.length >= min && v.length <= max, {
      message: `Must be between ${min} and ${max} characters.`,
    });

/** A strictly-positive number (prices, area). Accepts numeric strings from forms. */
export const positiveNumber = z.coerce
  .number({ invalid_type_error: 'Must be a number.' })
  .positive('Must be greater than 0.');
