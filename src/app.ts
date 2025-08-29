import { Hono } from 'hono';
import { pinoLogger } from 'hono-pino';
import { prettyJSON } from 'hono/pretty-json';

import * as api from '@app/api';
import type { ComposeRequest } from '@app/api';
import { API_ENDPOINT } from '@app/constants';
import { notFound, onError } from '@app/errors';
import { logger } from '@app/logger';
import type { Store } from '@app/store';
import type { AppContext } from '@app/types';
import type { Worker } from '@app/worker';

import { createQueue } from './queue';

export const createApp = (
  socket: string,
  store: Store,
  worker: Worker<ComposeRequest>,
) => {
  const queue = createQueue(worker);
  const composeService = new api.services.Compose(queue, store);

  const middleware = new Hono<AppContext>();
  middleware.use(prettyJSON());
  middleware.use(pinoLogger({ pino: logger }));
  middleware.use(async (ctx, next) => {
    ctx.set('logger', logger);
    ctx.set('services', {
      compose: composeService,
    });
    await next();
  });

  // chaining the functions helps preserve RPC type inference
  const app = new Hono<AppContext>()
    .notFound(notFound)
    .onError(onError)
    .route('*', middleware)
    .route(API_ENDPOINT, api.composes)
    .route(API_ENDPOINT, api.meta);

  return {
    app,
    fetch: app.fetch,
    unix: socket,
  };
};
