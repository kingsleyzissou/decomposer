import { Result } from 'true-myth';
import z from 'zod';

import { DatabaseError } from '@app/errors';
import { AppContext, ComposeDoc, ComposeRequest } from '@app/types';
import * as schema from '@gen/ibcrc/zod';

export type Compose = z.infer<typeof schema.ComposesResponseItem>;
export type ComposesResponse = z.infer<typeof schema.ComposesResponse>;

export type ComposeResponse = z.infer<typeof schema.ComposeResponse>;

export type ComposeStatusResponse = z.infer<typeof schema.ComposeStatus>;

export type ComposeContext = AppContext & {
  Variables: {
    service: ComposeService;
  };
};

export type ComposeService = {
  composes: () => Promise<Result<Compose[], DatabaseError>>;
  add: (
    request: ComposeRequest,
  ) => Promise<Result<{ id: string }, DatabaseError>>;
  get: (id: string) => Promise<Result<ComposeDoc, DatabaseError>>;
  delete: (id: string) => Promise<Result<void, DatabaseError>>;
};
