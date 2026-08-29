import { Router } from 'express';
import { uploadImages } from '../controllers/uploadController.js';
import { upload } from '../middleware/upload.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// Any logged-in user can upload listing media (buyers can post listings too).
router.post('/', requireAuth, upload.array('images', 15), asyncHandler(uploadImages));

export default router;
