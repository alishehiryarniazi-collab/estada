/**
 * Small UI store for app-wide overlays. Right now it drives the auth modal,
 * which can be opened from the navbar or from any action that needs login
 * (e.g. sending an enquiry).
 */
import { create } from 'zustand';

interface UiState {
  authModal: { open: boolean; mode: 'login' | 'register' };
  openAuth: (mode?: 'login' | 'register') => void;
  closeAuth: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  authModal: { open: false, mode: 'login' },
  openAuth: (mode = 'login') => set({ authModal: { open: true, mode } }),
  closeAuth: () => set({ authModal: { open: false, mode: 'login' } }),
}));
