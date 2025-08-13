import type { Result } from 'true-myth/result';

import type { AppError } from '@app/errors';
import type { Schemas } from '@gen/ibcrc';

export type Architectures = Schemas['Architectures'];
export type Distributions = Schemas['DistributionsResponse'];
export type Distribution = Schemas['Distributions'];

export type ImageType = {
  image_type: {
    name: string;
  };
};

type ServiceResult<T> = Result<T, AppError>;
type ServiceTask<T> = Promise<ServiceResult<T>>;

export type DistributionService = {
  distributions: () => ServiceResult<Distributions>;
  architectures: (distribution: Distribution) => ServiceTask<Architectures>;
};
