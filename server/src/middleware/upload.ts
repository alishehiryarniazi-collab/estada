/**
 * Multer setup for image uploads — memory storage (we forward the buffer to
 * Cloudinary/disk ourselves), 5MB per file, images only. Client-side compression
 * happens before upload, so 5MB is a safe ceiling.
 */
import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 15 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(ApiError.badRequest('Only image files are allowed.'));
  },
});
