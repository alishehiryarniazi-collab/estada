/**
 * Auth API calls. The token lives in an httpOnly cookie, so there's nothing to
 * store client-side — we just call these and read the returned user.
 */
import { api } from '../lib/api';
import type { User } from '../types/property';

interface AuthResponse {
  user: User;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: 'buyer' | 'dealer' | 'owner';
  cnicNumber?: string;
}

export async function register(payload: RegisterPayload): Promise<User> {
  const { data } = await api.post<AuthResponse>('/auth/register', payload);
  return data.user;
}

export async function login(email: string, password: string): Promise<User> {
  const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
  return data.user;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}

/** Returns the current user, or null if not logged in. */
export async function fetchMe(): Promise<User | null> {
  try {
    const { data } = await api.get<AuthResponse>('/auth/me');
    return data.user;
  } catch {
    return null;
  }
}
