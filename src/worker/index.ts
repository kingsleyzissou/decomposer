import { Store } from '@app/types';

import { buildImage } from './build-image';
import { buildManifest } from './build-manifest';

export const createWorker = (
  store: Store,
  subcommand: 'build' | 'manifest',
  executable: string = 'image-builder',
) => {
  if (subcommand === 'build') {
    return buildImage({ store: store.path, executable });
  }

  return buildManifest({ store: store.path, executable });
};

export { buildImage, buildManifest };
