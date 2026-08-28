import type { Request, Response } from 'express';
import { uploadImage } from '../services/uploadService.js';
import { addDocument, listDocumentsForProperty } from '../services/documentService.js';
import { ApiError } from '../utils/ApiError.js';

export async function uploadDocument(req: Request, res: Response) {
  const file = req.file;
  if (!file) throw ApiError.badRequest('No document file was provided.');

  const url = await uploadImage(file.buffer, file.originalname);
  const doc = await addDocument(
    req.params.id,
    req.user!.userId,
    req.user!.role,
    url,
    req.body?.documentType,
  );
  res.status(201).json({ document: doc });
}

export async function listDocuments(req: Request, res: Response) {
  const documents = await listDocumentsForProperty(req.params.id);
  res.json({ documents });
}
