import { Result } from 'true-myth';
import z from 'zod';

import { logger } from '@app/logger';
import { ComposeRequest as CRCComposeRequest } from '@gen/ibcrc/zod';
import * as schema from '@gen/ibcrc/zod';

import { DatabaseError } from './errors';

export type ComposeRequest = z.infer<typeof CRCComposeRequest>;

export enum Status {
  SUCCESS = 'success',
  FAILURE = 'failure',
  PENDING = 'pending',
  BUILDING = 'building',
}

export type ComposeDoc = {
  _id: string;
  _rev?: string;
  created_at: string;
  status: Status;
  request?: ComposeRequest;
};

export type JobResult = {
  id: string;
  result: Status;
};

export type JobMessage = {
  type: string;
  data: JobResult;
};

export type Store = {
  path: string;
  composes: PouchDB.Database<ComposeDoc>;
};

export type Compose = z.infer<typeof schema.ComposesResponseItem>;

export type ComposeService = {
  composes: () => Promise<Result<Compose[], DatabaseError>>;
  add: (
    request: ComposeRequest,
  ) => Promise<Result<{ id: string }, DatabaseError>>;
  get: (id: string) => Promise<Result<ComposeDoc, DatabaseError>>;
  update: (
    id: string,
    changes: ComposeDoc,
  ) => Promise<Result<void, DatabaseError>>;
  delete: (id: string) => Promise<Result<unknown, DatabaseError>>;
};

export type AppContext = {
  Variables: {
    logger: typeof logger;
    services: {
      compose: ComposeService;
    };
  };
};
