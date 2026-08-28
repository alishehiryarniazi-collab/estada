/** Uploads images to the API (which forwards to Cloudinary or local disk). */
import { api } from '../lib/api';

export async function uploadImages(files: (File | Blob)[]): Promise<string[]> {
  const form = new FormData();
  files.forEach((f, i) => form.append('images', f, `photo-${i}.jpg`));
  const { data } = await api.post<{ urls: string[] }>('/uploads', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.urls;
}
