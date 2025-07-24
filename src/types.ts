import z from 'zod';

import { logger } from '@app/logger';
import { JobQueue as Queue } from '@app/queue';
import { ComposeRequest as CRCComposeRequest } from '@gen/ibcrc/zod';

export type ComposeRequest = z.infer<typeof CRCComposeRequest>;

export type ComposeDoc = {
  _id: string;
  _rev?: string;
  created_at: string;
  status: string;
  request?: ComposeRequest;
};

export type JobResult = {
  id: string;
  result: string;
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
