import { ErrorHandler, NotFoundHandler } from 'hono';
import { StatusCodes } from 'http-status-codes';

import { AppError } from './app';
import { DatabaseError } from './database';
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
