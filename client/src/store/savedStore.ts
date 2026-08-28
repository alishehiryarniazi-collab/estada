/**
 * Shortlist state — the set of property ids the current user has saved.
 * Loaded once after login; toggling is optimistic (updates the heart instantly,
 * reverts if the request fails).
 */
import { create } from 'zustand';
import * as savedService from '../services/savedService';

interface SavedState {
  ids: Set<string>;
  load: () => Promise<void>;
  toggle: (id: string) => Promise<void>;
  isSaved: (id: string) => boolean;
  clear: () => void;
}

export const useSavedStore = create<SavedState>((set, get) => ({
  ids: new Set(),
  load: async () => {
    try {
      const ids = await savedService.getSavedIds();
      set({ ids: new Set(ids) });
    } catch {
      // Not logged in / failed — keep it empty.
    }
  },
  isSaved: (id) => get().ids.has(id),
  toggle: async (id) => {
    const wasSaved = get().ids.has(id);
    // Optimistic update.
    set((s) => {
      const next = new Set(s.ids);
      wasSaved ? next.delete(id) : next.add(id);
      return { ids: next };
    });
    try {
      await savedService.toggleSaved(id);
    } catch {
      // Revert on failure.
      set((s) => {
        const next = new Set(s.ids);
        wasSaved ? next.add(id) : next.delete(id);
        return { ids: next };
      });
    }
  },
  clear: () => set({ ids: new Set() }),
}));
