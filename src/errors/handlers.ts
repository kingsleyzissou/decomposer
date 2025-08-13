import type { ErrorHandler, NotFoundHandler } from 'hono';
import { StatusCodes } from 'http-status-codes';

import { createModuleLogger } from '@app/logger';
import { AppError } from './app';
import { DatabaseError, isPouchError } from './database';
import { ValidationError } from './validation';

const logger = createModuleLogger('error-handler');

export const notFound: NotFoundHandler = (ctx) => {
  const requestId = ctx.get('requestId');
  
  logger.warn({
    requestId,
    path: ctx.req.path,
    method: ctx.req.method,
    userAgent: ctx.req.header('user-agent'),
  }, 'Path not found');

  throw new AppError({
    code: StatusCodes.NOT_FOUND,
    message: 'Path not found!',
    details: [`The path '${ctx.req.path}' does not exist`],
  });
};

export const onError: ErrorHandler = (error, ctx) => {
  const requestId = ctx.get('requestId');
  const baseContext = {
    requestId,
    path: ctx.req.path,
    method: ctx.req.method,
    userAgent: ctx.req.header('user-agent'),
  };

  if (error instanceof ValidationError) {
    logger.warn({
      ...baseContext,
      error: {
        message: error.message,
        details: error.details,
        code: error.code,
      }
    }, 'Validation error');

    const { body, code } = error.response();
    return ctx.json(body, code);
  }

  if (error instanceof AppError) {
    logger.warn({
      ...baseContext,
      error: {
        message: error.message,
        details: error.details,
        code: error.code,
      }
    }, 'Application error');

    const { body, code } = error.response();
    return ctx.json(body, code);
  }

  if (error instanceof DatabaseError) {
    logger.error({
      ...baseContext,
      error: {
        message: error.message,
        details: error.details,
        code: error.code,
      }
    }, 'Database error');

    const { body, code } = error.response();
    return ctx.json(body, code);
  }

  // Log unexpected errors with full stack trace
  logger.error({
    ...baseContext,
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    }
  }, 'Unexpected error');

  return ctx.json(
    {
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      message: error.message,
    },
    StatusCodes.INTERNAL_SERVER_ERROR,
  );
};

export const withAppError = (error: unknown) => {
  if (error instanceof Error && isPouchError(error)) {
    return new DatabaseError(error);
  }

  if (
    error instanceof DatabaseError ||
    error instanceof ValidationError ||
    error instanceof AppError
  ) {
    return error;
  }

  if (error instanceof Error && error.name === 'OpenError') {
    return new DatabaseError(error);
  }

  return new AppError({
    message: 'Unable to complete transaction',
    details: [error],
  });
};
