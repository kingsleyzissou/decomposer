import { AppError, DatabaseError, isPouchError } from '@app/errors';

export const withTransaction = async <T>(
  operation: () => Promise<T>,
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    if (isPouchError(error)) {
      throw new DatabaseError(error);
    }
    throw new AppError({
      message: 'Unable to complete transaction',
      details: [error],
    });
  }
};
