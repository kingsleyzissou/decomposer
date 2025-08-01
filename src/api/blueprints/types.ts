import { Result } from 'true-myth/result';
import z from 'zod';

import { DatabaseError } from '@app/errors';
import * as schema from '@gen/ibcrc/zod';

export type Blueprint = z.infer<typeof schema.BlueprintItem>;

export type BlueprintsResponse = z.infer<typeof schema.BlueprintsResponse>;

export type BlueprintRequest = z.infer<typeof schema.CreateBlueprintRequest>;

type ServiceTask<T> = Promise<Result<T, DatabaseError>>;

export type BlueprintService = {
  all: () => ServiceTask<Blueprint[]>;
};
