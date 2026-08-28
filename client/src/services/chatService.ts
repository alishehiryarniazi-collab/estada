/** Chat / enquiry-thread API calls (message sending goes over Socket.IO). */
import { api } from '../lib/api';

export interface PhoneState {
  sharedByBuyer: boolean;
  sharedByDealer: boolean;
  revealed: boolean;
}

export interface Thread {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage: string | null;
  counterpartName: string;
  isBuyer: boolean;
  lastMessage: string;
  lastAt: string;
  phone: PhoneState;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export async function getThreads(): Promise<Thread[]> {
  const { data } = await api.get<{ threads: Thread[] }>('/enquiries');
  return data.threads;
}

export async function getMessages(
  enquiryId: string,
): Promise<{ messages: ChatMessage[]; isBuyer: boolean; currentUserId: string }> {
  const { data } = await api.get(`/enquiries/${enquiryId}/messages`);
  return data;
}

export async function sharePhone(
  enquiryId: string,
): Promise<{ phone: PhoneState; buyerPhone: string | null; dealerPhone: string | null }> {
  const { data } = await api.post(`/enquiries/${enquiryId}/share-phone`);
  return data;
}
