import type { Store } from '@app/store';

import { buildImage } from './build-image';

export const createWorker = (
  store: Store,
  executable: string = 'image-builder',
) => {
  return buildImage({ store: store.path, executable });
};

export type * from './types';
