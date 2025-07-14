import { mkdir } from 'node:fs/promises';
import path from 'node:path';

self.onmessage = async (event) => {
  const { type } = event.data;
  if (type === 'process') {
    // simulate a job processing
    // if the store isn't provided
    if (event.data.store === '') {
      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });
      postMessage({ type: 'ready', message: 'Worker is ready' });
      return;
    }

    // it's okay to create this since the test runner will
    // clean up this directory after the tests have been run
    const { store, request } = event.data;
    const composeDir = path.join(store, request.id);
    await mkdir(composeDir, { recursive: true });
    postMessage({ type: 'ready', message: 'Worker is ready' });
  }
};
