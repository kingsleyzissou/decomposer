import { Result } from 'true-myth/result';

import { DatabaseError } from '@app/errors';

export type ServiceTask<T> = Promise<Result<T, DatabaseError>>;
