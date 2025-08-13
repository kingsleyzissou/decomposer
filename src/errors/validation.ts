import { StatusCodes } from 'http-status-codes';
import type { $ZodError } from 'zod/v4/core';

import { AppError } from './app';

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
