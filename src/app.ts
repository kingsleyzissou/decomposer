import { Hono } from 'hono';

import { api } from '@app/api';
import { API_ENDPOINT } from '@app/constants';
import { createMiddleware } from '@app/middleware';
import type { Store } from '@app/store';

export const createApp = (socket: string, store: Store) => {
  const middleware = createMiddleware(store);

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
