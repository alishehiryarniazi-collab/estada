/** Admin panel API calls. */
import { api } from '../lib/api';

export interface Verification {
  id: string;
  documentUrl: string;
  documentType: string | null;
  createdAt: string;
  property: { id: string; title: string; city: string; dealer: { name: string } };
}

export interface Report {
  id: string;
  reason: string;
  createdAt: string;
  property: { id: string; title: string; status: string };
  reportedBy: { name: string; email: string };
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  cnicNumber: string | null;
  createdAt: string;
  dealerProfile: { businessName: string; verificationStatus: string } | null;
  _count: { properties: number };
}

export const getVerifications = () => api.get<{ items: Verification[] }>('/admin/verifications').then((r) => r.data.items);
export const reviewVerification = (id: string, status: 'verified' | 'rejected') =>
  api.patch(`/admin/verifications/${id}`, { status });

export const getReports = () => api.get<{ items: Report[] }>('/admin/reports').then((r) => r.data.items);
export const reviewReport = (id: string, status: 'reviewed' | 'dismissed', takeDown = false) =>
  api.patch(`/admin/reports/${id}`, { status, takeDown });

export const getUsers = () => api.get<{ items: AdminUser[] }>('/admin/users').then((r) => r.data.items);
export const verifyDealer = (id: string, status: 'verified' | 'rejected') =>
  api.patch(`/admin/dealers/${id}/verify`, { status });
