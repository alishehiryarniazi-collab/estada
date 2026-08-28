/**
 * Wraps an async route handler so any thrown error / rejected promise is
 * forwarded to Express's error middleware instead of crashing the process.
 *
 * WHY: avoids repeating try/catch in every controller — cleaner, safer code.
 */
import type { Request, Response, NextFunction, RequestHandler } from 'express';

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
