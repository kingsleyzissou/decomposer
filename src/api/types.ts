import type { Result } from 'true-myth/result';

import type { DatabaseError } from '@app/errors';

export type ServiceTask<T> = Promise<Result<T, DatabaseError>>;
