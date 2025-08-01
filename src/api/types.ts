import { Result } from 'true-myth/result';

import { AppError, DatabaseError, ValidationError } from '@app/errors';

export type ServiceTask<T> = Promise<
  Result<T, DatabaseError | ValidationError | AppError>
>;
