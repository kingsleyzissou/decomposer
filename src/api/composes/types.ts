import { Result } from 'true-myth/result';
import z from 'zod';

import { DatabaseError } from '@app/errors';
import { ComposeDoc } from '@app/store';
import * as schema from '@gen/ibcrc/zod';

export type Compose = z.infer<typeof schema.ComposesResponseItem>;

export type ComposeRequest = z.infer<typeof schema.ComposeRequest>;

export type ComposesResponse = z.infer<typeof schema.ComposesResponse>;

export type ComposeResponse = z.infer<typeof schema.ComposeResponse>;

export type ComposeStatusResponse = z.infer<typeof schema.ComposeStatus>;

type ServiceTask<T> = Promise<Result<T, DatabaseError>>;

export type ComposeService = {
  all: () => ServiceTask<Compose[]>;
  add: (request: ComposeRequest) => ServiceTask<{ id: string }>;
  get: (id: string) => ServiceTask<ComposeDoc>;
  update: (id: string, changes: ComposeDoc) => ServiceTask<void>;
  delete: (id: string) => ServiceTask<unknown>;
};
