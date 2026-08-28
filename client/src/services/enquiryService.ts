/** Enquiry API calls. */
import { api } from '../lib/api';

export interface EnquiryPayload {
  propertyId: string;
  message: string;
  phone?: string;
}

export async function submitEnquiry(payload: EnquiryPayload): Promise<void> {
  await api.post('/enquiries', payload);
}
