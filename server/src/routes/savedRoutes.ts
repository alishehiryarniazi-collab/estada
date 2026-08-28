import { Router } from 'express';
import * as controller from '../controllers/savedController.js';
import { validate } from '../middleware/validate.js';
import { savedSearchSchema } from '../validators/saved.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// All shortlist / saved-search actions require login.
router.use(requireAuth);

// Shortlist (saved properties)
router.get('/properties', asyncHandler(controller.savedList));
router.get('/properties/ids', asyncHandler(controller.savedIds));
router.post('/properties/:id', asyncHandler(controller.toggleSaved));
router.delete('/properties/:id', asyncHandler(controller.toggleSaved));

// Saved searches
router.get('/searches', asyncHandler(controller.listSearches));
router.post('/searches', validate({ body: savedSearchSchema }), asyncHandler(controller.createSearch));
router.delete('/searches/:id', asyncHandler(controller.deleteSearch));

export default router;
