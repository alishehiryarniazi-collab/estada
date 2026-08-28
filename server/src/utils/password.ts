/**
 * Password hashing helpers (bcrypt). Kept in one place so the cost factor is
 * consistent everywhere. 10 rounds is a good speed/security balance for now.
 */
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
