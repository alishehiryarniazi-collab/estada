/**
 * Global auth state (Zustand). Holds the current user + a loading flag while we
 * check the session on first load. Components read `user` to show the right nav.
 */
import { create } from 'zustand';
import type { User } from '../types/property';
import * as authService from '../services/authService';

interface AuthState {
  user: User | null;
  loading: boolean;
  loadSession: () => Promise<void>;
  setUser: (user: User | null) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  // Called once on app start to restore the session from the cookie.
  loadSession: async () => {
    const user = await authService.fetchMe();
    set({ user, loading: false });
  },
  setUser: (user) => set({ user }),
  signOut: async () => {
    await authService.logout();
    set({ user: null });
  },
}));
