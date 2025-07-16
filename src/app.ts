import { Hono } from 'hono';
import { pinoLogger } from 'hono-pino';
import { prettyJSON } from 'hono/pretty-json';

import * as api from '@app/api';
import type { Args } from '@app/args';
import { API_ENDPOINT } from '@app/constants';
import { notFound, onError } from '@app/errors';
import { logger } from '@app/logger';

export const createApp = ({ socket }: Args) => {
  const middleware = new Hono();
  middleware.use(prettyJSON());
  middleware.use(pinoLogger({ pino: logger }));

  // chaining the functions helps preserve RPC type inference
  const app = new Hono()
    .notFound(notFound)
    .onError(onError)
    .route('*', middleware)
    .route(API_ENDPOINT, api.meta);

  return {
    app,
    fetch: app.fetch,
    unix: socket,
  };
};
