import { Router } from 'express';
import { register, login, logout, me, forgotPassword, resetPassword } from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/auth.js';
import { requireAuth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post('/register', authLimiter, validate({ body: registerSchema }), asyncHandler(register));
router.post('/login', authLimiter, validate({ body: loginSchema }), asyncHandler(login));
router.post('/logout', asyncHandler(logout));
router.get('/me', requireAuth, asyncHandler(me));

// Password recovery (rate-limited to curb abuse).
router.post('/forgot-password', authLimiter, validate({ body: forgotPasswordSchema }), asyncHandler(forgotPassword));
router.post('/reset-password', authLimiter, validate({ body: resetPasswordSchema }), asyncHandler(resetPassword));

// POST /google — Google OAuth is wired in a later milestone.

export default router;
