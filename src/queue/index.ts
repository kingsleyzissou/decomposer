import type { ComposeRequest } from '@app/api/composes';
import type { Worker } from '@app/worker';

import { JobQueue } from './queue';

export const createQueue = (worker: Worker<ComposeRequest>) => {
  return new JobQueue<ComposeRequest>(worker);
};

export { JobQueue };
