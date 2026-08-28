import { Router } from 'express';
import { uploadImages } from '../controllers/uploadController.js';
import { upload } from '../middleware/upload.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// Only dealers/owners/admins upload listing media.
router.post(
  '/',
  requireAuth,
  requireRole('dealer', 'owner', 'admin'),
  upload.array('images', 15),
  asyncHandler(uploadImages),
);

export default router;
