import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import { config } from './config/env.js';
import { requestIdMiddleware, notFoundHandler, globalErrorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import farmRoutes from './routes/farmRoutes.js';
import fieldRoutes from './routes/fieldRoutes.js';
import soilRoutes from './routes/soilRoutes.js';
import diseaseRoutes from './routes/diseaseRoutes.js';
import weatherRoutes from './routes/weatherRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import assistantRoutes from './routes/assistantRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import accountRoutes from './routes/accountRoutes.js';
import healthRoutes from './routes/healthRoutes.js';

export function createApp(): express.Application {
  const app = express();

  // Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
          connectSrc: ["'self'", 'https://api.open-meteo.com'],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
        },
      },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // CORS
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, or same origin)
        if (!origin) return callback(null, true);
        if (config.ALLOWED_ORIGINS.includes(origin) || config.NODE_ENV === 'development') {
          return callback(null, true);
        }
        callback(new Error('Origin not allowed by CORS policy.'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    })
  );

  // Body Parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // Request ID Tracking
  app.use(requestIdMiddleware);

  // Mount API Routes under /api/v1
  const apiV1 = express.Router();
  apiV1.use('/', healthRoutes);
  apiV1.use('/auth', authRoutes);
  apiV1.use('/farms', farmRoutes);
  apiV1.use('/fields', fieldRoutes);
  apiV1.use('/', soilRoutes);
  apiV1.use('/disease-assessments', diseaseRoutes);
  apiV1.use('/farms', weatherRoutes);
  apiV1.use('/weather', weatherRoutes);
  apiV1.use('/', recommendationRoutes);
  apiV1.use('/conversations', assistantRoutes);
  apiV1.use('/history', historyRoutes);
  apiV1.use('/settings', settingsRoutes);
  apiV1.use('/account', accountRoutes);

  app.use('/api/v1', apiV1);

  // 404 & Error Handlers
  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
}
