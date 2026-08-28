import { Router } from 'express';
import { dealerProfile } from '../controllers/propertyController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// Public dealer profile (info + their active listings).
router.get('/:id', asyncHandler(dealerProfile));

export default router;
