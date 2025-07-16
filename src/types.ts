import { logger } from '@app/logger';
import { WorkerQueue as Queue } from '@app/queue';

export type AppContext = {
  Variables: {
    store: string;
    logger: typeof logger;
    queue: Queue<string>;
  };
};
