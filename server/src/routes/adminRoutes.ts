import { Router } from 'express';
import * as controller from '../controllers/adminController.js';
import { validate } from '../middleware/validate.js';
import { verificationReviewSchema, reportReviewSchema } from '../validators/admin.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// Everything here is admin-only.
router.use(requireAuth, requireRole('admin'));

router.get('/verifications', asyncHandler(controller.verifications));
router.patch(
  '/verifications/:id',
  validate({ body: verificationReviewSchema }),
  asyncHandler(controller.reviewVerification),
);

router.get('/reports', asyncHandler(controller.reports));
router.patch('/reports/:id', validate({ body: reportReviewSchema }), asyncHandler(controller.reviewReport));

router.get('/users', asyncHandler(controller.users));
router.patch(
  '/dealers/:id/verify',
  validate({ body: verificationReviewSchema }),
  asyncHandler(controller.verifyDealer),
);

export default router;
