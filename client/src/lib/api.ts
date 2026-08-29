/**
 * Central Axios instance. `withCredentials` makes the browser send/receive the
 * httpOnly auth cookie automatically. Base URL comes from env (defaults to the
 * Vite-proxied /api in dev).
 */
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
});

/**
 * Pull a clean, user-friendly message out of an Axios error.
 * If the server returned per-field validation errors, surface the first
 * specific one (e.g. "Password must be at least 8 characters.") instead of the
 * generic "check the highlighted fields" message.
 */
export function apiErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: string; fields?: Record<string, string[]> } | undefined;
    if (data?.fields) {
      const first = Object.values(data.fields).flat().find(Boolean);
      if (first) return first;
    }
    return data?.error || fallback;
  }
  return fallback;
}
