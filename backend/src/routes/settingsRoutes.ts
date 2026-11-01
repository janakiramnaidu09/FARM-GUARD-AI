import { Router } from 'express';
import { UpdateProfileSchema } from '@farmguard/shared';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { authService } from '../services/auth/authService.js';
import { dataRepository } from '../db/repositories/dataRepository.js';

const router = Router();
router.use(authenticate);

// Get user settings
router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await authService.getMe(req.user!.id);
    const farms = await dataRepository.getFarms(req.user!.id);
    let alertPrefs = null;
    if (farms.length > 0) {
      alertPrefs = await dataRepository.getAlertPreferences(req.user!.id, farms[0].id);
    }

    res.json({
      success: true,
      data: {
        user,
        defaultAlertPreferences: alertPrefs,
        privacy: {
          retentionPeriodDays: 90,
          allowTelemetry: false,
          allowAnonymousModelImprovement: false,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Update settings
router.patch('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = UpdateProfileSchema.parse(req.body);
    const updatedUser = await authService.updateProfile(req.user!.id, data);
    res.json({
      success: true,
      data: { user: updatedUser },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

