import z from 'zod';

import { logger } from '@app/logger';
import { JobQueue as Queue } from '@app/queue';
import { ComposeRequest as CRCComposeRequest } from '@gen/ibcrc/zod';

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

export type AppContext = {
  Variables: {
    store: Store;
    logger: typeof logger;
    queue: Queue<ComposeRequest>;
  };
};
