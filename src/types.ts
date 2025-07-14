import z from 'zod';

import { logger } from '@app/logger';
import { WorkerQueue } from '@app/queue';
import { ComposeRequest } from '@generated/zod';

export type ComposeJob = {
  id: string;
  request: z.infer<typeof ComposeRequest>;
};

export type AppContext = {
  Variables: {
    store: string;
    logger: typeof logger;
    queue: WorkerQueue<ComposeJob>;
  };
};
