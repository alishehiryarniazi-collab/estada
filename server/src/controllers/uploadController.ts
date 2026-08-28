import type { Request, Response } from 'express';
import { uploadImage } from '../services/uploadService.js';
import { ApiError } from '../utils/ApiError.js';

/** Accepts one or more images (field name "images") and returns their URLs. */
export async function uploadImages(req: Request, res: Response) {
  const files = (req.files as Express.Multer.File[]) || [];
  if (files.length === 0) throw ApiError.badRequest('No images were provided.');

  const urls = await Promise.all(files.map((f) => uploadImage(f.buffer, f.originalname)));
  res.status(201).json({ urls });
}
