/** Shortlist (saved properties) + saved searches API calls. */
import { api } from '../lib/api';
import type { PropertyCard, SearchResponse } from '../types/property';

export async function toggleSaved(id: string): Promise<boolean> {
  const { data } = await api.post<{ saved: boolean }>(`/saved/properties/${id}`);
  return data.saved;
}

export async function getSavedIds(): Promise<string[]> {
  const { data } = await api.get<{ ids: string[] }>('/saved/properties/ids');
  return data.ids;
}

export async function getSavedList(): Promise<PropertyCard[]> {
  const { data } = await api.get<SearchResponse>('/saved/properties');
  return data.items;
}

export interface SavedSearch {
  id: string;
  searchParams: Record<string, unknown>;
  alertFrequency: string;
  createdAt: string;
}

export async function createSavedSearch(
  params: Record<string, unknown>,
  alertFrequency = 'daily',
): Promise<void> {
  await api.post('/saved/searches', { params, alertFrequency });
}

export async function listSavedSearches(): Promise<SavedSearch[]> {
  const { data } = await api.get<{ searches: SavedSearch[] }>('/saved/searches');
  return data.searches;
}

export async function deleteSavedSearch(id: string): Promise<void> {
  await api.delete(`/saved/searches/${id}`);
}
