/**
 * JWT sign/verify helpers.
 *
 * The token carries only what we need for authorization (user id + role) —
 * never sensitive data, since a JWT payload is readable by anyone who has it.
 * The token is delivered to the browser in an httpOnly cookie (see cookies.ts),
 * so client-side JS can't read it — a defence against XSS token theft.
 */
import jwt from 'jsonwebtoken';
import type { Role } from '@prisma/client';
import { env } from '../config/env.js';

export interface JwtPayload {
  userId: string;
  role: Role;
}

export function signToken(payload: JwtPayload): string {
  // Cast keeps us compatible with jsonwebtoken v9's strict `expiresIn` type,
  // which expects a number or a specific string-literal union (e.g. "7d").
  const options: jwt.SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  };
  return jwt.sign(payload, env.JWT_SECRET, options);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}
