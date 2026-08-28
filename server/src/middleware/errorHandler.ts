/**
 * Global error + 404 handlers.
 *
 * Every failure funnels through here so the client always receives a
 * consistent { error: string } shape with a friendly message, never a raw
 * stack trace (Section 8: "never fail silently / no technical errors to user").
 */
import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError.js';
import { isProd } from '../config/env.js';

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

// Express identifies error handlers by their 4-argument signature.
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  // Zod validation errors → 400 with field-level details.
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Please check the highlighted fields and try again.',
      fields: err.flatten().fieldErrors,
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  // Anything else is unexpected — log it server-side, hide internals from the user.
  console.error('Unhandled error:', err);
  return res.status(500).json({
    error: 'Something went wrong on our end. Please try again in a moment.',
    ...(isProd ? {} : { debug: err instanceof Error ? err.message : String(err) }),
  });
}
