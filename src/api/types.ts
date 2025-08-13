import type { Result } from 'true-myth/result';

import type { AppError, DatabaseError, ValidationError } from '@app/errors';

export type ServiceTask<T> = Promise<
  Result<T, DatabaseError | ValidationError | AppError>
>;
