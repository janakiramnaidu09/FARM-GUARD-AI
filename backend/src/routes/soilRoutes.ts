import { Router } from 'express';
import { CreateSoilReadingSchema, SensorIngestPayloadSchema } from '@farmguard/shared';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { dataRepository } from '../db/repositories/dataRepository.js';
import { createRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

const sensorLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 60,
  message: 'Sensor ingestion rate limit exceeded.',
});

// Authenticated sensor telemetry ingestion endpoint
router.post(['/sensors/ingest', '/sensors/telemetry'], sensorLimiter, async (req, res, next) => {
  try {
    const tokenHeader = (req.headers['x-device-token'] as string) || '';
    const bodyToken = typeof req.body === 'object' && req.body ? req.body.deviceToken : '';
    const activeToken = tokenHeader || bodyToken;

    // Validate sensor device token
    if (
      activeToken !== 'dev-sensor-token-secret-valid-key-farmguard' &&
      activeToken !== 'your_secret_device_token'
    ) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED_DEVICE', message: 'Invalid sensor device authentication token.' },
      });
      return;
    }

    const payload = SensorIngestPayloadSchema.parse({
      ...req.body,
      deviceToken: activeToken,
    });

    // Default to the demo farmer user id for development ingestion
    const defaultOwnerId = '00000000-0000-0000-0000-000000000001';

    const reading = await dataRepository.createSoilReading(defaultOwnerId, payload.fieldId, {
      observedAt: payload.timestamp || new Date().toISOString(),
      moisturePct: payload.readings.moisturePct ?? null,
      temperatureC: payload.readings.temperatureC ?? null,
      ph: payload.readings.ph ?? null,
      nitrogenValue: payload.readings.nitrogenValue ?? null,
      phosphorusValue: payload.readings.phosphorusValue ?? null,
      potassiumValue: payload.readings.potassiumValue ?? null,
      npkUnit: payload.readings.npkUnit || 'kg_per_ha',
      source: 'sensor',
      notes: payload.batteryPct !== undefined ? `Battery level: ${payload.batteryPct}%` : undefined,
    });

    res.status(201).json({
      success: true,
      data: {
        status: 'ingested',
        readingId: reading.id,
        timestamp: reading.observedAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

// User-protected field soil readings
router.get('/fields/:fieldId/soil-readings', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const field = await dataRepository.getFieldById(req.user!.id, req.params.fieldId);
    if (!field) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Field not found.' },
      });
      return;
    }
    const readings = await dataRepository.getSoilReadings(req.user!.id, field.id);
    res.json({ success: true, data: readings });
  } catch (error) {
    next(error);
  }
});

router.post('/fields/:fieldId/soil-readings', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = CreateSoilReadingSchema.parse(req.body);
    const reading = await dataRepository.createSoilReading(req.user!.id, req.params.fieldId, data);
    res.status(201).json({ success: true, data: reading });
  } catch (error) {
    next(error);
  }
});

router.delete('/soil-readings/:readingId', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const success = await dataRepository.deleteSoilReading(req.user!.id, req.params.readingId);
    if (!success) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Soil reading not found.' },
      });
      return;
    }
    res.json({ success: true, data: { message: 'Soil observation removed.' } });
  } catch (error) {
    next(error);
  }
});

export default router;
