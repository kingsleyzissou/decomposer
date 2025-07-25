import { ComposeRequest, Store } from '@app/types';

import { JobQueue } from './queue';
import { buildImage } from './worker';

export * from './types';

export const createQueue = (store: Store) => {
  return new JobQueue<ComposeRequest>(buildImage(store.path));
};

export { buildImage, JobQueue };
