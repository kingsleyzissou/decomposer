import type { ErrorHandler, NotFoundHandler } from 'hono';
import { StatusCodes } from 'http-status-codes';

import { AppError } from './app';
import { DatabaseError, isPouchError } from './database';
import { ValidationError } from './validation';

export const notFound: NotFoundHandler = (ctx) => {
  throw new AppError({
    code: StatusCodes.NOT_FOUND,
    message: 'Path not found!',
    details: [`The path '${ctx.req.path}' does not exist`],
  });
};

export const onError: ErrorHandler = (error, ctx) => {
  if (
    error instanceof ValidationError ||
    error instanceof AppError ||
    error instanceof DatabaseError
  ) {
    const { body, code } = error.response();
    return ctx.json(body, code);
  }

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
