/** Upload a property ownership document for verification. */
import { api } from '../lib/api';

export async function uploadDocument(propertyId: string, file: File): Promise<void> {
  const form = new FormData();
  form.append('document', file);
  await api.post(`/properties/${propertyId}/documents`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}
