import { Router } from 'express';
import { CreateConversationSchema, SendMessageSchema } from '@farmguard/shared';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { geminiService } from '../services/gemini/geminiService.js';
import { weatherService } from '../services/weather/weatherService.js';
import { dataRepository } from '../db/repositories/dataRepository.js';
import { createRateLimiter } from '../middleware/rateLimiter.js';
import { config } from '../config/env.js';

const router = Router();
router.use(authenticate);

const aiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 20,
  message: 'Assistant message rate limit reached. Please wait a moment before sending another query.',
});

// List conversations
router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const list = await dataRepository.getConversations(req.user!.id);
    res.json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
});

// Create conversation
router.post('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = CreateConversationSchema.parse(req.body);
    const conv = await dataRepository.createConversation(req.user!.id, {
      farmId: data.farmId || null,
      fieldId: data.fieldId || null,
      language: data.language || req.user!.preferredLanguage || 'te',
      title: data.title,
    });
    res.status(201).json({ success: true, data: conv });
  } catch (error) {
    next(error);
  }
});

// Get conversation with message history
router.get('/:conversationId', async (req: AuthenticatedRequest, res, next) => {
  try {
    const conv = await dataRepository.getConversationById(req.user!.id, req.params.conversationId);
    if (!conv) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Conversation not found.' },
      });
      return;
    }
    res.json({ success: true, data: conv });
  } catch (error) {
    next(error);
  }
});

// Send message to assistant
router.post('/:conversationId/messages', aiLimiter, async (req: AuthenticatedRequest, res, next) => {
  try {
    const conv = await dataRepository.getConversationById(req.user!.id, req.params.conversationId);
    if (!conv) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Conversation not found.' },
      });
      return;
    }

    const { content, language: overrideLang, latitude, longitude, locationName } = SendMessageSchema.parse(req.body);
    const lang = overrideLang || conv.language || req.user!.preferredLanguage || 'te';

    // 1. Fetch real-time GPS weather telemetry if coordinates provided
    let gpsContext = '';
    if (typeof latitude === 'number' && typeof longitude === 'number') {
      try {
        const { forecast } = await weatherService.getForecast('gps-live', latitude, longitude);
        gpsContext = `Live GPS Location: ${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E${locationName ? ` (${locationName})` : ''}. Current Ambient Telemetry: Temperature ${forecast.current.temperatureC}°C, Weather: ${forecast.current.conditionText}, Humidity: ${forecast.current.humidityPct}%, Wind: ${forecast.current.windSpeedKmh} km/h, Today's Expected Rain: ${forecast.daily[0]?.precipitationSumMm || 0}mm.`;
      } catch {
        gpsContext = `Live GPS Location: ${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E${locationName ? ` (${locationName})` : ''}.`;
      }
    }

    // 2. Record user message
    const userMsg = await dataRepository.addMessage(req.user!.id, conv.id, {
      role: 'user',
      content,
    });

    // 3. Fetch context if attached to farm/field
    let farmContext = '';
    let fieldContext = '';
    let soilContext = '';

    if (conv.farmId) {
      const farm = await dataRepository.getFarmById(req.user!.id, conv.farmId);
      if (farm) {
        farmContext = `Farm: ${farm.name}, Location: ${farm.district || ''}, ${farm.state || ''}`;
      }
    }

    if (conv.fieldId) {
      const field = await dataRepository.getFieldById(req.user!.id, conv.fieldId);
      if (field) {
        fieldContext = `Field: ${field.name}, Crop: ${field.currentCropCode || 'Not specified'}, Soil Type: ${field.soilType || 'Not specified'}`;
        const readings = await dataRepository.getSoilReadings(req.user!.id, field.id);
        if (readings.length > 0) {
          const r = readings[0];
          soilContext = `Observed: ${r.observedAt}, Moisture: ${r.moisturePct}%, pH: ${r.ph}, Temp: ${r.temperatureC}°C, Source: ${r.source}`;
        }
      }
    }

    // 4. Generate structured advice via Gemini with university-grounded fallback
    const advice = await geminiService.generateAssistantAdvice({
      question: content,
      language: lang,
      farmContext,
      fieldContext,
      soilContext,
      gpsContext,
      sourceReferences: [
        { id: 'ICAR-AGRI-2020', title: 'Handbook of Agriculture (ICAR New Delhi)' },
        { id: 'PJTSAU-GUIDE-2023', title: 'Vyavasaya Panchangam (PJTSAU Hyderabad)' },
      ],
    });

    // 4. Record assistant message
    const assistantMsg = await dataRepository.addMessage(req.user!.id, conv.id, {
      role: 'assistant',
      content: advice.answer,
      structuredAdvice: advice,
      provider: geminiService.isConfigured() ? 'gemini' : 'local-advisory',
      model: config.GEMINI_MODEL,
    });

    res.status(201).json({
      success: true,
      data: {
        userMessage: userMsg,
        assistantMessage: assistantMsg,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Delete conversation
router.delete('/:conversationId', async (req: AuthenticatedRequest, res, next) => {
  try {
    const success = await dataRepository.deleteConversation(req.user!.id, req.params.conversationId);
    if (!success) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Conversation not found.' },
      });
      return;
    }
    res.json({ success: true, data: { message: 'Conversation deleted.' } });
  } catch (error) {
    next(error);
  }
});

export default router;

