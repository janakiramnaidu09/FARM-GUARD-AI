import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import crypto from 'crypto';
import { DatabaseUnavailableError } from '../db/withUserTransaction.js';

export function requestIdMiddleware(req: Request & { requestId?: string }, res: Response, next: NextFunction) {
  const reqId = (req.headers['x-request-id'] as string) || crypto.randomUUID();
  req.requestId = reqId;
  res.setHeader('X-Request-Id', reqId);
  next();
}

export function notFoundHandler(req: Request & { requestId?: string }, res: Response) {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `The requested endpoint '${req.method} ${req.path}' was not found.`,
      requestId: req.requestId,
    },
  });
}

export function globalErrorHandler(
  err: any,
  req: Request & { requestId?: string },
  res: Response,
  next: NextFunction
) {
  const requestId = req.requestId || crypto.randomUUID();

  // 1. Zod Validation Error
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data provided.',
        details: err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
        requestId,
      },
    });
    return;
  }

  // 2. Database Unavailable
  if (err instanceof DatabaseUnavailableError || err.code === 'DATABASE_UNAVAILABLE') {
    res.status(503).json({
      success: false,
      error: {
        code: 'DATABASE_UNAVAILABLE',
        message: err.message,
        requestId,
      },
    });
    return;
  }

  // 3. User operational errors
  let status = typeof err.status === 'number' ? err.status : 500;
  let message = typeof err.message === 'string' ? err.message : '';

  // Auto-detect common auth/validation error messages if status wasn't explicitly set
  if (status === 500 && message) {
    const lower = message.toLowerCase();
    if (lower.includes('invalid email or password') || lower.includes('invalid or expired session') || lower.includes('session has expired')) {
      status = 401;
    } else if (lower.includes('already exists') || lower.includes('duplicate key')) {
      status = 409;
    } else if (lower.includes('not found')) {
      status = 404;
    } else if (lower.includes('deactivated') || lower.includes('unauthorized') || lower.includes('forbidden') || lower.includes('permission denied')) {
      status = 403;
    }
  }

  if (status >= 500) {
    console.error(`[Error] Request ${requestId} failed:`, err);
    if (!message || message.length === 0) {
      message = 'An unexpected internal error occurred while processing your request. Please try again.';
    }
  }

  res.status(status).json({
    success: false,
    error: {
      code: err.code || (status === 401 ? 'UNAUTHORIZED' : status === 409 ? 'CONFLICT' : status === 404 ? 'NOT_FOUND' : status === 400 ? 'BAD_REQUEST' : status === 403 ? 'FORBIDDEN' : 'INTERNAL_SERVER_ERROR'),
      message:
        status >= 500 && process.env.NODE_ENV === 'production' && !err.expose
          ? 'An unexpected internal error occurred while processing your request. Please try again.'
          : message,
      requestId,
    },
  });
}

