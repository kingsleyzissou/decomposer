import z from 'zod';

import { logger } from '@app/logger';
import { JobQueue as Queue } from '@app/queue';
import { ComposeRequest as CRCComposeRequest } from '@gen/ibcrc/zod';

export type ComposeRequest = z.infer<typeof CRCComposeRequest>;

export type AppContext = {
  Variables: {
    store: string;
    logger: typeof logger;
    queue: Queue<ComposeRequest>;
  };
};
