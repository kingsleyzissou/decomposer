import { testClient } from 'hono/testing';

import { createApp } from '@app/app';
import type { Store } from '@app/store';

export const createTestClient = (store: Store) => {
  const { app } = createApp('', store);
  const client = testClient(app);
  return client.api['image-builder-composer'].v2;
};
