import { Router } from 'express';
import { UpdateAlertPreferencesSchema } from '@farmguard/shared';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { weatherService } from '../services/weather/weatherService.js';
import { geminiService } from '../services/gemini/geminiService.js';
import { dataRepository } from '../db/repositories/dataRepository.js';

const router = Router();
router.use(authenticate);

// Get farm weather forecast
router.get('/:farmId/weather', async (req: AuthenticatedRequest, res, next) => {
  try {
    const farm = await dataRepository.getFarmById(req.user!.id, req.params.farmId);
    if (!farm) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Farm not found.' },
      });
      return;
    }

    const lat = farm.latitude || 17.8524; // Default to Telangana lat/lon if coordinates unset
    const lon = farm.longitude || 78.6833;

    const weatherData = await weatherService.getForecast(farm.id, lat, lon, false);
    const prefs = await dataRepository.getAlertPreferences(req.user!.id, farm.id);
    const alerts = weatherService.evaluateAlerts(weatherData.forecast, prefs.thresholds);

    res.json({
      success: true,
      data: {
        farmId: farm.id,
        farmName: farm.name,
        latitude: lat,
        longitude: lon,
        forecast: weatherData.forecast,
        alerts,
        fetchedAt: weatherData.fetchedAt,
        provider: weatherData.source,
        cached: weatherData.cached,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Force refresh weather forecast
router.post('/:farmId/weather/refresh', async (req: AuthenticatedRequest, res, next) => {
  try {
    const farm = await dataRepository.getFarmById(req.user!.id, req.params.farmId);
    if (!farm) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Farm not found.' },
      });
      return;
    }

    const lat = farm.latitude || 17.8524;
    const lon = farm.longitude || 78.6833;

    const weatherData = await weatherService.getForecast(farm.id, lat, lon, true);
    const prefs = await dataRepository.getAlertPreferences(req.user!.id, farm.id);
    const alerts = weatherService.evaluateAlerts(weatherData.forecast, prefs.thresholds);

    res.json({
      success: true,
      data: {
        farmId: farm.id,
        farmName: farm.name,
        forecast: weatherData.forecast,
        alerts,
        fetchedAt: weatherData.fetchedAt,
        provider: weatherData.source,
        cached: false,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get farm alerts and AI explanation
router.get('/:farmId/alerts', async (req: AuthenticatedRequest, res, next) => {
  try {
    const farm = await dataRepository.getFarmById(req.user!.id, req.params.farmId);
    if (!farm) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Farm not found.' },
      });
      return;
    }

    const lat = farm.latitude || 17.8524;
    const lon = farm.longitude || 78.6833;

    const weatherData = await weatherService.getForecast(farm.id, lat, lon, false);
    const prefs = await dataRepository.getAlertPreferences(req.user!.id, farm.id);
    const alerts = weatherService.evaluateAlerts(weatherData.forecast, prefs.thresholds);

    const explanation = await geminiService.explainWeatherAdvisory(alerts, req.user!.preferredLanguage);

    res.json({
      success: true,
      data: {
        alerts,
        explanation,
        fetchedAt: weatherData.fetchedAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get alert preferences
router.get('/:farmId/alert-preferences', async (req: AuthenticatedRequest, res, next) => {
  try {
    const prefs = await dataRepository.getAlertPreferences(req.user!.id, req.params.farmId);
    res.json({ success: true, data: prefs });
  } catch (error) {
    next(error);
  }
});

// Update alert preferences
router.put('/:farmId/alert-preferences', async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = UpdateAlertPreferencesSchema.parse(req.body);
    const updated = await dataRepository.updateAlertPreferences(req.user!.id, req.params.farmId, data as any);
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

export default router;

