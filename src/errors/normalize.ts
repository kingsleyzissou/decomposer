import { AppError } from './app';
import { DatabaseError, isPouchError } from './database';
import { ValidationError } from './validation';

export const normalizeError = (error: unknown) => {
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
