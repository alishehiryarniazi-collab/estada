/**
 * Property API calls. Keeping all endpoints in one service file (Section: keep
 * API calls in one place) so components never build URLs themselves.
 */
import { api } from '../lib/api';
import type { SearchResponse, PropertyDetail } from '../types/property';

export interface SearchParams {
  q?: string;
  city?: string;
  propertyType?: string;
  listingType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  minArea?: number;
  maxArea?: number;
  areaUnit?: 'marla' | 'sqft';
  verifiedOnly?: boolean;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'area_desc';
  cursor?: string;
  limit?: number;
}

export async function searchProperties(params: SearchParams = {}): Promise<SearchResponse> {
  const { data } = await api.get<SearchResponse>('/properties', { params });
  return data;
}

export async function getProperty(id: string): Promise<PropertyDetail> {
  const { data } = await api.get<{ property: PropertyDetail }>(`/properties/${id}`);
  return data.property;
}

export async function reportProperty(id: string, reason: string): Promise<void> {
  await api.post(`/properties/${id}/report`, { reason });
}

/** A dealer's own listings (including drafts) with counts, for the dashboard. */
export interface MyListing extends PropertyDetailLite {
  isDraft: boolean;
  viewCount: number;
  saveCount: number;
  enquiryCount: number;
  expiresAt: string | null;
}
interface PropertyDetailLite {
  id: string;
  title: string;
  price: string;
  listingType: string;
  propertyType: string;
  city: string;
  areaName: string;
  status: string;
  isDocumentVerified: boolean;
  lastConfirmedAt: string;
  images: { imageUrl: string }[];
}

export async function getMyListings(): Promise<MyListing[]> {
  const { data } = await api.get<{ items: MyListing[] }>('/properties/mine');
  return data.items;
}

export interface ListingPayload {
  title: string;
  description: string;
  propertyType: string;
  listingType: string;
  price: number;
  areaValue: number;
  areaUnit: string;
  bedrooms?: number;
  bathrooms?: number;
  address: string;
  lat: number;
  lng: number;
  city: string;
  areaName: string;
  images?: string[];
  isDraft?: boolean;
}

export async function createListing(payload: ListingPayload): Promise<{ id: string }> {
  const { data } = await api.post<{ property: { id: string } }>('/properties', payload);
  return data.property;
}

export async function updateListing(id: string, payload: Partial<ListingPayload>): Promise<void> {
  await api.patch(`/properties/${id}`, payload);
}

export async function updateListingStatus(id: string, status: string): Promise<void> {
  await api.patch(`/properties/${id}/status`, { status });
}

export async function renewListing(id: string): Promise<void> {
  await api.patch(`/properties/${id}/renew`);
}

export async function confirmAvailability(id: string): Promise<void> {
  await api.patch(`/properties/${id}/confirm`);
}
