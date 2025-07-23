import { SOCKET_PATH } from '@app/constants';
import { AppError, DatabaseError, isPouchError } from '@app/errors';

export const removeSocket = async () => {
  if (await Bun.file(SOCKET_PATH).exists()) {
    await Bun.file(SOCKET_PATH).unlink();
  }
};

export const prettyPrint = (o: object) => {
  return Object.entries(o)
    .map(([key, value]) => {
      return `  ${key}: ${value}\n`;
    })
    .join('');
};

export const jsonFormat = (o: object) => {
  return JSON.stringify(o, null, 2);
};

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
