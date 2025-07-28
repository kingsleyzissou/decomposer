import { ContentfulStatusCode } from 'hono/utils/http-status';

import { AppError } from './app';

export const isPouchError = (err: unknown): err is PouchDB.Core.Error => {
  return (
    typeof err === 'object' &&
    err !== null &&
    err.constructor.name === 'PouchError'
  );
};

export const withDatabaseError = (error: unknown) => {
  if (error instanceof Error && isPouchError(error)) {
    return new DatabaseError(error);
  }

  if (error instanceof DatabaseError || error instanceof AppError) {
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

export class DatabaseError extends AppError {
  constructor(error: unknown) {
    if (error instanceof Error && error.name === 'OpenError') {
      super({ message: 'Unable to connect to the database' });
      this.name = 'Database Connection Error';
      return;
    }

    if (!isPouchError(error)) {
      super({ message: 'Unknown error occured' });
      console.log(error);
      this.name = 'Database Error';
      return;
    }

    const err = error as {
      status: number;
      name: string;
      message: string;
      reason?: string;
    };

    let message = err.message;
    if (err.status === 404) {
      message = 'Resource not found';
    }
    super({
      message,
      code: err.status as ContentfulStatusCode,
      details: err.reason,
    });
    this.name = 'Database Error';
  }
}
