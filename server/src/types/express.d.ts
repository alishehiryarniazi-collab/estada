/**
 * Augment Express's Request so authenticated handlers can read req.user
 * with full typing (set by the auth middleware).
 */
import type { Role } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: { userId: string; role: Role };
    }
  }
}

export {};
