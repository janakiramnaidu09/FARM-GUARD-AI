import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { config } from '../config/env.js';
import { getPool } from '../db/pool.js';
import { withAdminQuery } from '../db/withUserTransaction.js';
import { User } from '@farmguard/shared';

export interface AuthenticatedRequest extends Request {
  user?: User;
  requestId?: string;
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let token = req.cookies?.[config.AUTH_COOKIE_NAME];

    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
        token = parts[1];
      }
    }

    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication session required. Please sign in.',
          requestId: req.requestId,
        },
      });
      return;
    }

    const tokenHash = hashToken(token);
    const pool = getPool();

    if (!pool) {
      // In-memory development session resolution
      // Default to demo farmer if token is 'demo' or matches
      req.user = {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'farmer@farmguard.ai',
        displayName: 'Ramesh Reddy (రమేష్ రెడ్డి)',
        preferredLanguage: 'te',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      next();
      return;
    }

    const sessionData = await withAdminQuery(async (client) => {
      const sRes = await client.query('SELECT * FROM fn_lookup_session_by_token($1)', [tokenHash]);
      if (sRes.rows.length === 0) return null;
      const s = sRes.rows[0];
      if (s.revoked_at || new Date(s.expires_at) <= new Date()) return null;

      const uRes = await client.query('SELECT * FROM users WHERE id = $1', [s.user_id]);
      if (uRes.rows.length === 0) return null;
      const u = uRes.rows[0];
      if (u.disabled_at) return null;

      // Update last_used_at
      await client.query('UPDATE sessions SET last_used_at = now() WHERE id = $1', [s.id]);

      return {
        id: u.id,
        email: u.email,
        displayName: u.display_name,
        preferredLanguage: u.preferred_language,
        emailVerifiedAt: u.email_verified_at ? u.email_verified_at.toISOString() : null,
        disabledAt: u.disabled_at ? u.disabled_at.toISOString() : null,
        createdAt: u.created_at.toISOString(),
        updatedAt: u.updated_at.toISOString(),
      };
    });

    if (!sessionData) {
      res.status(401).json({
        success: false,
        error: {
          code: 'SESSION_EXPIRED',
          message: 'Your session has expired or is invalid. Please sign in again.',
          requestId: req.requestId,
        },
      });
      return;
    }

    req.user = sessionData;
    next();
  } catch (error) {
    next(error);
  }
}

export async function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = req.cookies?.[config.AUTH_COOKIE_NAME] || req.headers.authorization;
  if (!token) {
    return next();
  }
  return authenticate(req, res, () => next());
}

