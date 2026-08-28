/**
 * Image upload. Uses Cloudinary when configured (free tier, no card); otherwise
 * falls back to saving on local disk under /uploads so the app works out of the
 * box during development. Either way it returns a URL to store on the listing.
 */
import { v2 as cloudinary } from 'cloudinary';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { env } from '../config/env.js';

export const cloudinaryConfigured = Boolean(
  env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET,
);

if (cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
}

export const LOCAL_UPLOAD_DIR = path.resolve('uploads');

export async function uploadImage(buffer: Buffer, originalName: string): Promise<string> {
  if (cloudinaryConfigured) {
    return new Promise<string>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'estada', resource_type: 'image' },
        (err, result) => {
          if (err || !result) return reject(err || new Error('Upload failed'));
          resolve(result.secure_url);
        },
      );
      stream.end(buffer);
    });
  }

  // Local fallback (dev): write to /uploads and return a relative URL. In dev the
  // Vite server proxies /uploads to this API (see vite.config.ts).
  await fs.mkdir(LOCAL_UPLOAD_DIR, { recursive: true });
  const ext = (path.extname(originalName) || '.jpg').toLowerCase();
  const name = `${crypto.randomBytes(10).toString('hex')}${ext}`;
  await fs.writeFile(path.join(LOCAL_UPLOAD_DIR, name), buffer);
  return `/uploads/${name}`;
}
