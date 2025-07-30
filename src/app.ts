import { Hono } from 'hono';
import { pinoLogger } from 'hono-pino';
import { prettyJSON } from 'hono/pretty-json';

import * as api from '@app/api';
import { ComposeService } from '@app/api/composes/service';
import { API_ENDPOINT } from '@app/constants';
import { notFound, onError } from '@app/errors';
import { logger } from '@app/logger';
import { createQueue } from '@app/queue';
import { AppContext, ComposeRequest, Store, Worker } from '@app/types';

export const createApp = (
  socket: string,
  store: Store,
  worker: Worker<ComposeRequest>,
) => {
  const queue = createQueue(worker);
  const composeService = new ComposeService(queue, store);

  const middleware = new Hono<AppContext>();
  middleware.use(prettyJSON());
  middleware.use(pinoLogger({ pino: logger }));
  middleware.use(async (ctx, next) => {
    ctx.set('services', {
      compose: composeService,
    });
    await next();
  });

  // chaining commands like this helps
  // RPC type inference
  const app = new Hono<AppContext>()
    .notFound(notFound)
    .onError(onError)
    .route('*', middleware)
    .route(API_ENDPOINT, api.meta)
    .route(API_ENDPOINT, api.composes);

  return {
    app,
    fetch: app.fetch,
    unix: socket,
  };
};
