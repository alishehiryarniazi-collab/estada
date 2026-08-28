// Shared domain types for the client. These mirror what the API returns.
// NOTE: Prisma Decimal fields (price, areaValue) arrive as STRINGS in JSON.

export type PropertyType = 'house' | 'plot' | 'flat' | 'commercial' | 'agricultural';
export type ListingType = 'sale' | 'rent';
export type AreaUnit = 'marla' | 'sqft';
export type PropertyStatus = 'active' | 'under_offer' | 'sold' | 'expired';

export interface PropertyImage {
  imageUrl: string;
}

/** The card shape returned by GET /api/properties (search results). */
export interface PropertyCard {
  id: string;
  title: string;
  propertyType: PropertyType;
  listingType: ListingType;
  price: string;
  areaValue: string;
  areaUnit: AreaUnit;
  bedrooms: number | null;
  bathrooms: number | null;
  city: string;
  areaName: string;
  status: PropertyStatus;
  isDocumentVerified: boolean;
  isFeatured: boolean;
  lat: number;
  lng: number;
  createdAt: string;
  lastConfirmedAt: string;
  approximate: boolean;
  images: PropertyImage[];
}

export interface SearchResponse {
  items: PropertyCard[];
  nextCursor: string | null;
}

export interface DealerInfo {
  id: string;
  name: string;
  isVerified: boolean;
  dealerProfile: {
    businessName: string;
    profilePhotoUrl: string | null;
    verificationStatus: 'pending' | 'verified' | 'rejected';
  } | null;
}

/** Full listing shape from GET /api/properties/:id. `address` is null until the
 *  viewer is allowed to see it (owner/admin/enquired buyer). */
export interface PropertyDetail {
  id: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  listingType: ListingType;
  price: string;
  areaValue: string;
  areaUnit: AreaUnit;
  bedrooms: number | null;
  bathrooms: number | null;
  address: string | null;
  lat: number;
  lng: number;
  city: string;
  areaName: string;
  status: PropertyStatus;
  isDocumentVerified: boolean;
  isFeatured: boolean;
  floorPlanUrl: string | null;
  viewCount: number;
  createdAt: string;
  lastConfirmedAt: string;
  approximate: boolean;
  images: { imageUrl: string; isPrimary: boolean; sortOrder: number }[];
  dealer: DealerInfo;
}

export type UserRole = 'buyer' | 'dealer' | 'owner' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  isVerified: boolean;
  createdAt: string;
}
