import type { ErrorHandler, NotFoundHandler } from 'hono/types';
import { ContentfulStatusCode } from 'hono/utils/http-status';
import { StatusCodes } from 'http-status-codes';
import { $ZodError, $ZodIssue } from 'zod/v4/core';

type AppErrorProps = {
  code?: number;
  message: string;
  details?: unknown;
};

export class AppError extends Error {
  public code: number;
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
}

export class ValidationError extends Error {
  public issues: $ZodIssue[];

  constructor({ issues }: $ZodError) {
    super('Validation failed');
    this.name = 'ValidationError';
    this.issues = issues;
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
  if (error instanceof ValidationError) {
    return ctx.json(
      {
        message: error.message,
        details: error.issues,
      },
      StatusCodes.UNPROCESSABLE_ENTITY,
    );
  }

  if (error instanceof AppError) {
    return ctx.json(
      {
        message: error.message,
        details: error.details,
      },
      error.code as ContentfulStatusCode,
    );
  }

  return ctx.json(
    {
      message: error.message,
    },
    StatusCodes.INTERNAL_SERVER_ERROR,
  );
};
