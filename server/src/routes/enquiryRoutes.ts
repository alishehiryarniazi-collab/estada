import { Router } from 'express';
import { submitEnquiry } from '../controllers/enquiryController.js';
import * as chat from '../controllers/chatController.js';
import { validate } from '../middleware/validate.js';
import { createEnquirySchema } from '../validators/enquiry.js';
import { requireAuth } from '../middleware/auth.js';
import { writeActionLimiter } from '../middleware/rateLimit.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// Enquiries require login (we store the buyer id) and are rate-limited (anti-spam).
router.post(
  '/',
  requireAuth,
  writeActionLimiter,
  validate({ body: createEnquirySchema }),
  asyncHandler(submitEnquiry),
);

// Chat: threads list + per-thread messages + phone sharing (all require login).
router.get('/', requireAuth, asyncHandler(chat.myThreads));
router.get('/:id/messages', requireAuth, asyncHandler(chat.threadMessages));
router.post('/:id/messages', requireAuth, writeActionLimiter, asyncHandler(chat.postMessage));
router.post('/:id/share-phone', requireAuth, asyncHandler(chat.sharePhone));

export default router;
