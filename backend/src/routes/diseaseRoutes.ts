import { Router } from 'express';
import multer from 'multer';
import crypto from 'crypto';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { storageService } from '../services/storage/storageService.js';
import { diseaseClient } from '../services/disease/diseaseClient.js';
import { dataRepository } from '../db/repositories/dataRepository.js';
import { createRateLimiter } from '../middleware/rateLimiter.js';
import { config } from '../config/env.js';

const router = Router();
router.use(authenticate);

const upload = multer({
  limits: {
    fileSize: config.MAX_IMAGE_BYTES,
  },
  storage: multer.memoryStorage(),
});

const uploadLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Upload rate limit reached. Please wait before submitting more photos.',
});

// Submit photo for disease assessment
router.post(
  '/',
  uploadLimiter,
  upload.single('image'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      if (!req.file || !req.file.buffer) {
        res.status(400).json({
          success: false,
          error: { code: 'MISSING_FILE', message: 'Please select or capture a leaf photo to upload.' },
        });
        return;
      }

      const fieldId = req.body.fieldId || null;
      const cropCode = req.body.cropCode || null;

      // 1. Private storage with file signature validation
      const stored = await storageService.storeImage(req.user!.id, req.file.buffer);

      // 2. Call OpenCV & TensorFlow inference microservice
      const inferenceResult = await diseaseClient.predictDisease(
        req.file.buffer,
        req.file.originalname || 'leaf.jpg',
        cropCode || undefined
      );

      // 3. Persist record in database repository
      const assessmentId = crypto.randomUUID();
      const record = await dataRepository.saveDiseaseAssessment(req.user!.id, {
        id: assessmentId,
        ownerId: req.user!.id,
        fieldId,
        cropCode,
        storageKey: stored.storageKey,
        imageSha256: stored.sha256,
        predictedClass: inferenceResult.predictedClass || null,
        confidence: inferenceResult.confidence ?? null,
        status: inferenceResult.status,
        abstentionReason: inferenceResult.abstentionReason || null,
        classProbabilities: inferenceResult.classProbabilities,
        nextSteps: inferenceResult.nextSteps,
        modelVersion: inferenceResult.modelVersion || null,
        createdAt: new Date().toISOString(),
      });

      res.status(201).json({
        success: true,
        data: {
          assessment: record,
          diagnostic: inferenceResult,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// List assessments
router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const list = await dataRepository.getDiseaseAssessments(req.user!.id);
    res.json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
});

// Get single assessment
router.get('/:assessmentId', async (req: AuthenticatedRequest, res, next) => {
  try {
    const item = await dataRepository.getDiseaseAssessmentById(req.user!.id, req.params.assessmentId);
    if (!item) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Disease assessment record not found.' },
      });
      return;
    }
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
});

// Stream authenticated private image
router.get('/:assessmentId/image', async (req: AuthenticatedRequest, res, next) => {
  try {
    const item = await dataRepository.getDiseaseAssessmentById(req.user!.id, req.params.assessmentId);
    if (!item) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Disease assessment not found.' },
      });
      return;
    }

    const imageBuffer = await storageService.getImageBytes(req.user!.id, item.storageKey);
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'private, max-age=3600');
    res.send(imageBuffer);
  } catch (error) {
    next(error);
  }
});

// Delete assessment
router.delete('/:assessmentId', async (req: AuthenticatedRequest, res, next) => {
  try {
    const item = await dataRepository.getDiseaseAssessmentById(req.user!.id, req.params.assessmentId);
    if (!item) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Disease assessment not found.' },
      });
      return;
    }

    await dataRepository.deleteDiseaseAssessment(req.user!.id, req.params.assessmentId);
    await storageService.deleteImage(req.user!.id, item.storageKey).catch(() => {});

    res.json({ success: true, data: { message: 'Disease assessment deleted successfully.' } });
  } catch (error) {
    next(error);
  }
});

export default router;
