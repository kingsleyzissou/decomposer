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
