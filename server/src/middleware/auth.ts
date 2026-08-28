/**
 * Authentication + authorization middleware.
 *
 * - requireAuth: rejects the request (401) if there's no valid token cookie.
 * - optionalAuth: attaches req.user IF logged in, but never blocks (used on
 *   public endpoints that behave slightly differently for logged-in users).
 * - requireRole: gate an endpoint to specific roles (e.g. admin only).
 */
import type { Request, Response, NextFunction } from 'express';
import type { Role } from '@prisma/client';
import { verifyToken } from '../utils/jwt.js';
import { AUTH_COOKIE } from '../utils/cookies.js';
import { ApiError } from '../utils/ApiError.js';

function readUser(req: Request) {
  const token = req.cookies?.[AUTH_COOKIE];
  if (!token) return null;
  try {
    return verifyToken(token);
  } catch {
    return null; // expired/tampered token -> treat as logged out
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const user = readUser(req);
  if (!user) return next(ApiError.unauthorized('Please log in to continue.'));
  req.user = user;
  next();
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const user = readUser(req);
  if (user) req.user = user;
  next();
}

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.unauthorized('Please log in to continue.'));
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have permission to do that.'));
    }
    next();
  };
}
