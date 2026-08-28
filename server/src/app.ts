/**
 * Express application setup: security middleware, parsers, routes, and the
 * global error handlers. Kept separate from server.ts so it can be imported
 * in tests without actually opening a network port.
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import authRouter from './routes/authRoutes.js';
import propertyRouter from './routes/propertyRoutes.js';
import enquiryRouter from './routes/enquiryRoutes.js';
import savedRouter from './routes/savedRoutes.js';
import uploadRouter from './routes/uploadRoutes.js';
import dealerRouter from './routes/dealerRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import { LOCAL_UPLOAD_DIR } from './services/uploadService.js';

export function createApp() {
  const app = express();

  // Security headers.
  app.use(helmet());

  // Allow the React frontend to call the API and send/receive httpOnly cookies.
  app.use(
    cors({
      origin: env.CLIENT_URL.split(',').map((o) => o.trim()),
      credentials: true,
    }),
  );

  // Body + cookie parsing.
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Health check — quick way to confirm the server + config booted correctly.
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'estada-api', time: new Date().toISOString() });
  });

  // Feature routes.
  app.use('/api/auth', authRouter);
  app.use('/api/properties', propertyRouter);
  app.use('/api/enquiries', enquiryRouter);
  app.use('/api/saved', savedRouter);
  app.use('/api/uploads', uploadRouter);
  app.use('/api/dealers', dealerRouter);
  app.use('/api/admin', adminRouter);

  // Serve locally-stored uploads (dev fallback when Cloudinary isn't configured).
  app.use('/uploads', express.static(LOCAL_UPLOAD_DIR));

  // 404 + error handling must be registered LAST.
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
