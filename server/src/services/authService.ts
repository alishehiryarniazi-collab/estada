/**
 * Auth business logic: registration and login.
 * Controllers stay thin; all DB work + rules live here.
 */
import type { User } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { ApiError } from '../utils/ApiError.js';
import type { RegisterInput, LoginInput } from '../validators/auth.js';

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
