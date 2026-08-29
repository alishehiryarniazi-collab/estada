import { Router } from 'express';
import { z } from 'zod';
import { env } from '../config/env.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { saveSubscription, removeSubscription, pushConfigured } from '../services/pushService.js';

const router = Router();

const subscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({ p256dh: z.string(), auth: z.string() }),
});

// Public VAPID key the browser needs to subscribe (null if push isn't enabled).
router.get('/public-key', (_req, res) => {
  res.json({ key: pushConfigured ? env.VAPID_PUBLIC_KEY : null });
});

router.post(
  '/subscribe',
  requireAuth,
  validate({ body: subscriptionSchema }),
  asyncHandler(async (req, res) => {
    await saveSubscription(req.user!.userId, req.body);
    res.status(201).json({ ok: true });
  }),
);

router.post(
  '/unsubscribe',
  requireAuth,
  asyncHandler(async (req, res) => {
    if (req.body?.endpoint) await removeSubscription(req.body.endpoint);
    res.json({ ok: true });
  }),
);

export default router;
