import { Router } from 'express';
import { UpdateFieldSchema } from '@farmguard/shared';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { dataRepository } from '../db/repositories/dataRepository.js';

const router = Router();
router.use(authenticate);

// Get single field
router.get('/:fieldId', async (req: AuthenticatedRequest, res, next) => {
  try {
    const field = await dataRepository.getFieldById(req.user!.id, req.params.fieldId);
    if (!field) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Field not found.' },
      });
      return;
    }
    res.json({ success: true, data: field });
  } catch (error) {
    next(error);
  }
});

// Update field
router.patch('/:fieldId', async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = UpdateFieldSchema.parse(req.body);
    const field = await dataRepository.updateField(req.user!.id, req.params.fieldId, data);
    if (!field) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Field not found.' },
      });
      return;
    }
    res.json({ success: true, data: field });
  } catch (error) {
    next(error);
  }
});

// Delete field
router.delete('/:fieldId', async (req: AuthenticatedRequest, res, next) => {
  try {
    const success = await dataRepository.deleteField(req.user!.id, req.params.fieldId);
    if (!success) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Field not found.' },
      });
      return;
    }
    res.json({ success: true, data: { message: 'Field deleted successfully.' } });
  } catch (error) {
    next(error);
  }
});

export default router;

