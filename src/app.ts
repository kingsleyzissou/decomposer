import { Hono } from 'hono';

import { api } from '@app/api';
import type { ComposeRequest } from '@app/api';
import { API_ENDPOINT } from '@app/constants';
import { createMiddleware } from '@app/middleware';
import { createQueue } from '@app/queue';
import type { Store } from '@app/store';
import type { Worker } from '@app/worker';

export const createApp = (
  socket: string,
  store: Store,
  worker: Worker<ComposeRequest>,
) => {
  const queue = createQueue(worker);
  const middleware = createMiddleware(queue, store);

  const app = new Hono()
    // prettier-ignore (multiline is easier to read)
    .route('*', middleware)
    .route(API_ENDPOINT, api);

  return {
    app,
    fetch: app.fetch,
    unix: socket,
  };
};
