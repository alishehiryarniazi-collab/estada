/**
 * Rate limiters to prevent spam/abuse (Section 8).
 * Enquiry + report endpoints are the main spam targets; auth is limited to
 * slow down brute-force login attempts.
 */
import rateLimit from 'express-rate-limit';

const message = { error: 'Too many requests. Please wait a moment and try again.' };

// Enquiries & reports: a real user won't send dozens per minute.
export const writeActionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message,
});

// Auth: guard against credential brute-forcing.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message,
});
