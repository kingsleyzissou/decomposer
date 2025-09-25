import type { Result } from 'true-myth/result';

import type { AppError } from '@app/errors';

type ServiceResult<T> = Result<T, AppError>;
type ServiceTask<T> = Promise<ServiceResult<T>>;

export type Packages = {};

export type Request = {
  packages: string[];
  distribution: string;
  architecture: string;
};

export type ContentService = {
  rpms: (request: Request) => ServiceTask<Packages[]>;
};
