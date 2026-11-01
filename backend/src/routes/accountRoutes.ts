import { Router } from 'express';
import { DeleteAccountSchema } from '@farmguard/shared';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { dataRepository } from '../db/repositories/dataRepository.js';
import { config } from '../config/env.js';

const router = Router();
router.use(authenticate);

// Export all farmer records in JSON format
router.get('/export', async (req: AuthenticatedRequest, res, next) => {
  try {
    const exportData = await dataRepository.exportUserData(req.user!.id);
    res.setHeader('Content-Disposition', `attachment; filename="farmguard-data-${req.user!.id}.json"`);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(exportData, null, 2));
  } catch (error) {
    next(error);
  }
});

// Delete account and all private records
router.delete('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    DeleteAccountSchema.parse(req.body);
    await dataRepository.deleteAccountAndData(req.user!.id);
    res.clearCookie(config.AUTH_COOKIE_NAME, { path: '/' });
    res.json({
      success: true,
      data: { message: 'Your FarmGuard account and all associated farm records have been permanently deleted.' },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

