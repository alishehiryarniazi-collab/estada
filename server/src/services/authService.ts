/**
 * Auth business logic: registration and login.
 * Controllers stay thin; all DB work + rules live here.
 */
import crypto from 'node:crypto';
import type { User } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { ApiError } from '../utils/ApiError.js';
import { sendMail } from './mailService.js';
import { env } from '../config/env.js';
import type { RegisterInput, LoginInput } from '../validators/auth.js';

const RESET_TTL_MIN = 60; // reset link valid for 1 hour
const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex');

/** Shape safe to send to the client — never leaks the password hash. */
export function toPublicUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
  };
}

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw ApiError.badRequest('An account with this email already exists.');
  }

  const passwordHash = await hashPassword(input.password);

  // Create the user, and for dealers also spin up an (unverified) dealer profile.
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      phone: input.phone,
      role: input.role,
      cnicNumber: input.cnicNumber,
      // Dealers get a profile with a sensible default business name (edited later).
      ...(input.role === 'dealer'
        ? { dealerProfile: { create: { businessName: input.name } } }
        : {}),
    },
  });

  return toPublicUser(user);
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  // Same generic error whether the email or password is wrong — don't reveal
  // which accounts exist.
  const invalid = ApiError.unauthorized('Incorrect email or password.');
  if (!user || !user.passwordHash) throw invalid;

  const ok = await verifyPassword(input.password, user.passwordHash);
  if (!ok) throw invalid;

  return toPublicUser(user);
}

/**
 * Start a password reset. We ALWAYS return quietly (never reveal whether an
 * email exists). If it does, we store a hashed token + expiry and email a link.
 */
export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return; // silent — no account enumeration

  const rawToken = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + RESET_TTL_MIN * 60_000);
  await prisma.user.update({
    where: { id: user.id },
    data: { resetTokenHash: sha256(rawToken), resetTokenExpiresAt: expires },
  });

  const origin = env.CLIENT_URL.split(',')[0].trim();
  const link = `${origin}/reset-password?token=${rawToken}`;
  const body = `
    <p>Hi ${user.name.split(' ')[0]},</p>
    <p>We received a request to reset your Estada password. Click below to choose a new one — this link expires in ${RESET_TTL_MIN} minutes.</p>
    <p><a href="${link}" style="display:inline-block;background:#0F2A47;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">Reset my password</a></p>
    <p style="font-size:12px;color:#6B6B66">If you didn't request this, you can safely ignore this email — your password won't change.</p>`;
  sendMail(user.email, 'Reset your Estada password', 'Password reset', body);
}

/** Complete a reset with the emailed token + a new password. */
export async function resetPassword(token: string, newPassword: string) {
  const user = await prisma.user.findFirst({
    where: { resetTokenHash: sha256(token), resetTokenExpiresAt: { gt: new Date() } },
  });
  if (!user) throw ApiError.badRequest('This reset link is invalid or has expired. Please request a new one.');

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await hashPassword(newPassword),
      resetTokenHash: null,
      resetTokenExpiresAt: null,
    },
  });
}
