import { ComposeRequest, Worker } from '@app/types';

import { JobQueue } from './queue';

export const createQueue = (worker: Worker<ComposeRequest>) => {
  return new JobQueue<ComposeRequest>(worker);
};

export { JobQueue };
