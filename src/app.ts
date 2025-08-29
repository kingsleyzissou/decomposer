import { Hono } from 'hono';
import { pinoLogger } from 'hono-pino';
import { prettyJSON } from 'hono/pretty-json';

import { api } from '@app/api';
import { API_ENDPOINT } from '@app/constants';
import { notFound, onError } from '@app/errors';
import { logger } from '@app/logger';
import type { Store } from '@app/store';

// eslint-disable-next-line
export const createApp = (socket: string, store: Store) => {
  const middleware = new Hono()
    .notFound(notFound)
    .use(prettyJSON())
    .use(pinoLogger({ pino: logger }));

  const app = new Hono()
    // we need to catch the errors either at the router
    // level or the app level, otherwise the errors go
    // uncaught
    .onError(onError)
    .route('*', middleware)
    .route(API_ENDPOINT, api);

  return {
    app,
    fetch: app.fetch,
    unix: socket,
  };
};
