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
}

export async function getDealerProfile(id: string): Promise<DealerProfile> {
  const { data } = await api.get<DealerProfile>(`/dealers/${id}`);
  return data;
}
