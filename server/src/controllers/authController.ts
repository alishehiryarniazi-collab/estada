/**
 * Auth controllers — thin HTTP layer over authService.
 * On register/login we issue the JWT as an httpOnly cookie and return the
 * public user object (never the token in the body).
 */
import type { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import {
  registerUser,
  loginUser,
  toPublicUser,
  requestPasswordReset,
  resetPassword as resetPasswordService,
} from '../services/authService.js';
import { signToken } from '../utils/jwt.js';
import { setAuthCookie, clearAuthCookie } from '../utils/cookies.js';
import { ApiError } from '../utils/ApiError.js';

export async function register(req: Request, res: Response) {
  const user = await registerUser(req.body);
  const token = signToken({ userId: user.id, role: user.role });
  setAuthCookie(res, token);
  res.status(201).json({ user });
}

export async function login(req: Request, res: Response) {
  const user = await loginUser(req.body);
  const token = signToken({ userId: user.id, role: user.role });
  setAuthCookie(res, token);
  res.json({ user });
}

export async function logout(_req: Request, res: Response) {
  clearAuthCookie(res);
  res.json({ message: 'Logged out.' });
}

export async function forgotPassword(req: Request, res: Response) {
  await requestPasswordReset(req.body.email);
  // Always the same response — never reveal whether the email exists.
  res.json({ message: "If an account exists for that email, we've sent a reset link." });
}

export async function resetPassword(req: Request, res: Response) {
  await resetPasswordService(req.body.token, req.body.password);
  res.json({ message: 'Password updated. You can now log in.' });
}

/** Returns the currently logged-in user (used by the frontend to restore session). */
export async function me(req: Request, res: Response) {
  const found = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!found) throw ApiError.unauthorized('Session expired. Please log in again.');
  res.json({ user: toPublicUser(found) });
}
