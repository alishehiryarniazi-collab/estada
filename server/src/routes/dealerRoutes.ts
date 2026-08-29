import { Router } from 'express';
import { dealerProfile } from '../controllers/propertyController.js';
import { createReview, listReviews } from '../controllers/reviewController.js';
import { validate } from '../middleware/validate.js';
import { reviewSchema } from '../validators/review.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// Public dealer profile (info + their active listings + rating summary).
router.get('/:id', asyncHandler(dealerProfile));

// Reviews.
router.get('/:id/reviews', asyncHandler(listReviews));
router.post('/:id/reviews', requireAuth, validate({ body: reviewSchema }), asyncHandler(createReview));

export default router;
