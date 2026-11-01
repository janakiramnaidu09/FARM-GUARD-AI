import { Router } from 'express';
import { HistoryQuerySchema } from '@farmguard/shared';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { dataRepository } from '../db/repositories/dataRepository.js';

const router = Router();
router.use(authenticate);

// Searchable and filterable unified history
router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const query = HistoryQuerySchema.parse(req.query);
    const history = await dataRepository.getUnifiedHistory(req.user!.id, query.type);
    res.json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
});

export default router;

