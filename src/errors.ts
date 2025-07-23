import { Context } from 'hono';
import type { ErrorHandler, NotFoundHandler } from 'hono/types';
import { ContentfulStatusCode } from 'hono/utils/http-status';
import { StatusCodes } from 'http-status-codes';
import { $ZodError } from 'zod/v4/core';

type AppErrorProps = {
  code?: ContentfulStatusCode;
  message: string;
  details?: unknown;
};

export class AppError extends Error {
  public code: ContentfulStatusCode;
  public details?: unknown;

  constructor({
    message,
    details,
    code = StatusCodes.INTERNAL_SERVER_ERROR,
  }: AppErrorProps) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
  }

  public handle(ctx: Context) {
    return ctx.json(
      {
        message: this.message,
        details: this.details,
        code: this.code,
      },
      this.code,
    );
  }
}

export class ValidationError extends AppError {
  constructor({ issues }: $ZodError) {
    super({
      message: 'Validation failed',
      details: issues,
      code: StatusCodes.UNPROCESSABLE_ENTITY,
    });
    this.name = 'ValidationError';
  }
}

export const notFound: NotFoundHandler = (ctx) => {
  throw new AppError({
    code: StatusCodes.NOT_FOUND,
    message: 'Path not found!',
    details: [`The path '${ctx.req.path}' does not exist`],
  });
};

export const onError: ErrorHandler = (error, ctx) => {
  if (error instanceof ValidationError || error instanceof AppError) {
    return error.handle(ctx);
  }

  return ctx.json(
    {
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      message: error.message,
    },
    StatusCodes.INTERNAL_SERVER_ERROR,
  );
};
