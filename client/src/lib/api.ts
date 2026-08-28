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

/** Pull a clean, user-friendly message out of an Axios error. */
export function apiErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.error || fallback;
  }
  return fallback;
}
