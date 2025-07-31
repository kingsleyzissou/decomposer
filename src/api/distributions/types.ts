import { Result } from 'true-myth/result';
import z from 'zod';

import { AppError } from '@app/errors';
import * as schema from '@gen/ibcrc/zod';

export type ArchitecturesResponse = z.infer<typeof schema.Architectures>;

export type DistributionsResponse = z.infer<
  typeof schema.DistributionsResponse
>;

export type Distributions = z.infer<typeof schema.Distributions>;

export type ImageType = {
  image_type: {
    name: string;
  };
};

type ServiceResult<T> = Result<T, AppError>;
type ServiceTask<T> = Promise<ServiceResult<T>>;

export type DistributionService = {
  all: () => ServiceResult<DistributionsResponse>;
  getArchitectures: (
    distribution: Distributions,
  ) => ServiceTask<ArchitecturesResponse>;
};
