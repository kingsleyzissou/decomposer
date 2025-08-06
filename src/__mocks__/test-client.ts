import { testClient } from 'hono/testing';
import path from 'path';

import { createApp } from '@app/app';
import { createWorker } from '@app/worker';

import { createTestStore } from '@fixtures';

const executable = path.join(__dirname, 'ibcli');

export const createTestClient = (tmp: string) => {
  const store = createTestStore(tmp);
  const worker = createWorker(store, 'manifest', executable);
  const { app } = createApp('', store, worker);
  const client = testClient(app);
  return client.api['image-builder-composer'].v2;
};
