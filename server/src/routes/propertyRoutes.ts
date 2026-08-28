import { Router } from 'express';
import * as controller from '../controllers/propertyController.js';
import { validate } from '../middleware/validate.js';
import {
  createPropertySchema,
  updatePropertySchema,
  statusSchema,
  searchQuerySchema,
} from '../validators/property.js';
import { requireAuth, optionalAuth, requireRole } from '../middleware/auth.js';
import { writeActionLimiter } from '../middleware/rateLimit.js';
import { createReportSchema } from '../validators/enquiry.js';
import { reportProperty } from '../controllers/enquiryController.js';
import { uploadDocument, listDocuments } from '../controllers/documentController.js';
import { upload } from '../middleware/upload.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// Public search + detail. optionalAuth lets owners/admins see exact location.
router.get('/', optionalAuth, validate({ query: searchQuerySchema }), asyncHandler(controller.list));
// The dealer's own listings — MUST be declared before "/:id" so it isn't
// treated as a property id.
router.get(
  '/mine',
  requireAuth,
  requireRole('dealer', 'owner', 'admin'),
  asyncHandler(controller.myListings),
);
router.get('/:id', optionalAuth, asyncHandler(controller.detail));

// Listing management — dealers, owners (and admins) only.
router.post(
  '/',
  requireAuth,
  requireRole('dealer', 'owner', 'admin'),
  validate({ body: createPropertySchema }),
  asyncHandler(controller.create),
);

router.patch(
  '/:id',
  requireAuth,
  validate({ body: updatePropertySchema }),
  asyncHandler(controller.update),
);

router.patch(
  '/:id/status',
  requireAuth,
  validate({ body: statusSchema }),
  asyncHandler(controller.updateStatus),
);

// Renew a listing for another 30 days.
router.patch('/:id/renew', requireAuth, asyncHandler(controller.renew));

// Confirm a listing is still available (freshness signal).
router.patch('/:id/confirm', requireAuth, asyncHandler(controller.confirmAvailable));

// Report a listing (auth + rate-limited to curb abuse).
router.post(
  '/:id/report',
  requireAuth,
  writeActionLimiter,
  validate({ body: createReportSchema }),
  asyncHandler(reportProperty),
);

// Ownership documents — dealer uploads (single file), admin reviews later.
router.post(
  '/:id/documents',
  requireAuth,
  requireRole('dealer', 'owner', 'admin'),
  upload.single('document'),
  asyncHandler(uploadDocument),
);
router.get(
  '/:id/documents',
  requireAuth,
  requireRole('dealer', 'owner', 'admin'),
  asyncHandler(listDocuments),
);

export default router;
