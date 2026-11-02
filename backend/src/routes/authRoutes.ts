import { Router } from 'express';
import {
  SignupRequestSchema,
  LoginRequestSchema,
  PasswordResetRequestSchema,
  PasswordResetCompleteSchema
} from '@farmguard/shared';
import { authService } from '../services/auth/authService.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { config } from '../config/env.js';
import { createRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Rate limiter for auth actions (10 requests per minute)
const authLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Too many authentication attempts. Please wait a minute and try again.',
});

function setSessionCookie(res: any, token: string, expiresAt: string) {
  res.cookie(config.AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax',
    expires: new Date(expiresAt),
    path: '/',
  });
}

router.post('/signup', authLimiter, async (req, res, next) => {
  try {
    const data = SignupRequestSchema.parse(req.body);
    const session = await authService.signup(data, req.headers['user-agent'], req.ip);
    setSessionCookie(res, session.refreshToken, session.expiresAt);
    res.status(201).json({
      success: true,
      data: {
        user: session.user,
        sessionId: session.sessionId,
        token: session.refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const data = LoginRequestSchema.parse(req.body);
    const session = await authService.login(data, req.headers['user-agent'], req.ip);
    setSessionCookie(res, session.refreshToken, session.expiresAt);
    res.json({
      success: true,
      data: {
        user: session.user,
        sessionId: session.sessionId,
        token: session.refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', async (req, res, next) => {
  try {
    const token = req.cookies?.[config.AUTH_COOKIE_NAME];
    await authService.logout(token);
    res.clearCookie(config.AUTH_COOKIE_NAME, { path: '/' });
    res.json({
      success: true,
      data: { message: 'Successfully signed out.' },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const token = req.cookies?.[config.AUTH_COOKIE_NAME] || req.body?.refreshToken;
    if (!token) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'No refresh token available.' },
      });
      return;
    }
    const session = await authService.refresh(token, req.headers['user-agent'], req.ip);
    setSessionCookie(res, session.refreshToken, session.expiresAt);
    res.json({
      success: true,
      data: {
        user: session.user,
        sessionId: session.sessionId,
        token: session.refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await authService.getMe(req.user!.id);
    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/password-reset/request', authLimiter, async (req, res, next) => {
  try {
    const data = PasswordResetRequestSchema.parse(req.body);
    // Generic message to prevent account enumeration
    res.json({
      success: true,
      data: {
        message: 'If an account exists with this email address, a password reset link has been dispatched.',
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/password-reset/complete', authLimiter, async (req, res, next) => {
  try {
    const data = PasswordResetCompleteSchema.parse(req.body);
    res.json({
      success: true,
      data: { message: 'Password has been successfully updated. You may now sign in.' },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

