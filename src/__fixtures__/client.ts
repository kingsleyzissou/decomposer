import { testClient } from 'hono/testing';
import path from 'path';

import { createApp } from '@app/app';
import type { Store } from '@app/store';
import { createWorker } from '@app/worker';

const executable = path.join(__dirname, '..', '__mocks__', 'ibcli');

export const createTestClient = (store: Store) => {
  const worker = createWorker(store, executable);
  const { app } = createApp('', store, worker);
  const client = testClient(app);
  return client.api['image-builder-composer'].v2;
};
