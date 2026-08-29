/** Public dealer profile API call. */
import { api } from '../lib/api';
import type { PropertyCard } from '../types/property';

export interface DealerProfile {
  dealer: {
    id: string;
    name: string;
    isVerified: boolean;
    createdAt: string;
    dealerProfile: {
      businessName: string;
      bio: string | null;
      profilePhotoUrl: string | null;
      verificationStatus: string;
    } | null;
  };
  listings: PropertyCard[];
  rating: { avg: number | null; count: number };
  responseLabel: string | null;
}

export interface DealerReview {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  author: { name: string };
}

export async function getDealerProfile(id: string): Promise<DealerProfile> {
  const { data } = await api.get<DealerProfile>(`/dealers/${id}`);
  return data;
}

export async function getDealerReviews(
  id: string,
): Promise<{ reviews: DealerReview[]; rating: { avg: number | null; count: number } }> {
  const { data } = await api.get(`/dealers/${id}/reviews`);
  return data;
}

export async function submitReview(id: string, rating: number, comment?: string): Promise<void> {
  await api.post(`/dealers/${id}/reviews`, { rating, comment });
}
