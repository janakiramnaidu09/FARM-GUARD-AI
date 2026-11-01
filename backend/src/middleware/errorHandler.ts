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
  const status = typeof err.status === 'number' ? err.status : 500;
  const message =
    status < 500
      ? err.message
      : 'An unexpected internal error occurred while processing your request. Please try again.';

  if (status >= 500) {
    console.error(`[Error] Request ${requestId} failed:`, err);
  }

  res.status(status).json({
    success: false,
    error: {
      code: err.code || (status === 400 ? 'BAD_REQUEST' : status === 403 ? 'FORBIDDEN' : 'INTERNAL_SERVER_ERROR'),
      message,
      requestId,
    },
  });
}

