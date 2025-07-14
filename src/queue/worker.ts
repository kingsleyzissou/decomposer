import { mkdir } from 'node:fs/promises';
import path from 'node:path';

import { ComposeJob } from '@app/types';

const processRequest = async (request: ComposeJob, store: string) => {
  const composeDir = path.join(store, request.id);
  await mkdir(composeDir, { recursive: true });
  await Bun.file(path.join(composeDir, 'request.json')).write(
    JSON.stringify(request.request, null, 2),
  );
  // TODO: create BP from request
  // TODO: execute ibcli
};

self.onmessage = async (event) => {
  const { type } = event.data;

  if (type === 'process') {
    await processRequest(event.data.request, event.data.store);
    postMessage({ type: 'ready', message: 'Worker is ready' });
  }
};
