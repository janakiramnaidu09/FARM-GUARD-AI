import { Router } from 'express';
import crypto from 'crypto';
import { CropRecommendationRequestSchema } from '@farmguard/shared';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { cropRankingService } from '../services/crops/cropRankingService.js';
import { weatherService } from '../services/weather/weatherService.js';
import { dataRepository } from '../db/repositories/dataRepository.js';

const router = Router();

// Generate crop recommendations for farm/field
router.post('/farms/:farmId/recommendations/crops', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const farm = await dataRepository.getFarmById(req.user!.id, req.params.farmId);
    if (!farm) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Farm not found.' },
      });
      return;
    }

    const request = CropRecommendationRequestSchema.parse(req.body);

    // Get latest soil reading if fieldId provided
    let latestSoilReading = null;
    if (request.fieldId) {
      const readings = await dataRepository.getSoilReadings(req.user!.id, request.fieldId);
      if (readings.length > 0) {
        latestSoilReading = readings[0];
      }
    }

    // Get weather data for farm to inform temperature scoring
    let avgTemp: number | null = null;
    try {
      const lat = farm.latitude || 17.8524;
      const lon = farm.longitude || 78.6833;
      const w = await weatherService.getForecast(farm.id, lat, lon, false);
      avgTemp = w.forecast.current.temperatureC;
    } catch {
      avgTemp = null;
    }

    const result = await cropRankingService.rankCrops({
      request,
      soilReading: latestSoilReading,
      forecastAvgTempC: avgTemp,
      language: req.user!.preferredLanguage,
    });

    const recId = crypto.randomUUID();
    const saved = await dataRepository.saveRecommendation(req.user!.id, {
      id: recId,
      ownerId: req.user!.id,
      farmId: farm.id,
      fieldId: request.fieldId || null,
      recommendationType: 'crop',
      inputSnapshot: {
        request,
        latestSoilReading,
        avgTemp,
      },
      rankedCrops: result.rankedCrops,
      explanation: result.explanation,
      dataSources: result.dataSources,
      engineVersion: '2024.1-hybrid',
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      data: saved,
    });
  } catch (error) {
    next(error);
  }
});

// List past recommendations
router.get('/recommendations', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const list = await dataRepository.getRecommendations(req.user!.id);
    res.json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
});

export default router;
