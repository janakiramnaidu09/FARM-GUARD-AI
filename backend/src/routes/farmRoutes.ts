import { Router } from 'express';
import {
  CreateFarmSchema,
  UpdateFarmSchema,
  CreateFieldSchema,
  UpdateFieldSchema
} from '@farmguard/shared';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { dataRepository } from '../db/repositories/dataRepository.js';

const router = Router();
router.use(authenticate);

// List all farms for authenticated user
router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const farms = await dataRepository.getFarms(req.user!.id);
    res.json({ success: true, data: farms });
  } catch (error) {
    next(error);
  }
});

// Create farm
router.post('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = CreateFarmSchema.parse(req.body);
    const farm = await dataRepository.createFarm(req.user!.id, data);
    res.status(201).json({ success: true, data: farm });
  } catch (error) {
    next(error);
  }
});

// Get farm by ID
router.get('/:farmId', async (req: AuthenticatedRequest, res, next) => {
  try {
    const farm = await dataRepository.getFarmById(req.user!.id, req.params.farmId);
    if (!farm) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Farm not found.' },
      });
      return;
    }
    const fields = await dataRepository.getFields(req.user!.id, farm.id);
    res.json({ success: true, data: { ...farm, fields } });
  } catch (error) {
    next(error);
  }
});

// Update farm
router.patch('/:farmId', async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = UpdateFarmSchema.parse(req.body);
    const farm = await dataRepository.updateFarm(req.user!.id, req.params.farmId, data);
    if (!farm) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Farm not found.' },
      });
      return;
    }
    res.json({ success: true, data: farm });
  } catch (error) {
    next(error);
  }
});

// Delete farm
router.delete('/:farmId', async (req: AuthenticatedRequest, res, next) => {
  try {
    const success = await dataRepository.deleteFarm(req.user!.id, req.params.farmId);
    if (!success) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Farm not found.' },
      });
      return;
    }
    res.json({ success: true, data: { message: 'Farm and associated fields deleted successfully.' } });
  } catch (error) {
    next(error);
  }
});

// Get fields for farm
router.get('/:farmId/fields', async (req: AuthenticatedRequest, res, next) => {
  try {
    const farm = await dataRepository.getFarmById(req.user!.id, req.params.farmId);
    if (!farm) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Farm not found.' },
      });
      return;
    }
    const fields = await dataRepository.getFields(req.user!.id, farm.id);
    res.json({ success: true, data: fields });
  } catch (error) {
    next(error);
  }
});

// Add field to farm
router.post('/:farmId/fields', async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = CreateFieldSchema.parse(req.body);
    const field = await dataRepository.createField(req.user!.id, req.params.farmId, data);
    res.status(201).json({ success: true, data: field });
  } catch (error) {
    next(error);
  }
});

export default router;

