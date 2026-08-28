/**
 * Central place for the auth cookie name + options so login, logout and the
 * auth middleware all agree. httpOnly + sameSite defend the token from XSS/CSRF.
 */
import type { CookieOptions, Response } from 'express';
import { isProd } from '../config/env.js';

export const AUTH_COOKIE = 'estada_token';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const baseOptions: CookieOptions = {
  httpOnly: true, // JS cannot read it -> mitigates XSS token theft
  sameSite: 'lax', // sent on top-level navigations, blocks most CSRF
  secure: isProd, // HTTPS-only in production
  path: '/',
};

export function setAuthCookie(res: Response, token: string): void {
  res.cookie(AUTH_COOKIE, token, { ...baseOptions, maxAge: SEVEN_DAYS_MS });
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(AUTH_COOKIE, baseOptions);
}
