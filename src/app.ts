import { Hono } from 'hono';
import { pinoLogger } from 'hono-pino';
import { prettyJSON } from 'hono/pretty-json';

import * as api from '@app/api';
import type { ComposeRequest } from '@app/api';
import { services } from '@app/api';
import { API_ENDPOINT } from '@app/constants';
import { notFound, onError } from '@app/errors';
import { logger } from '@app/logger';
import { createQueue } from '@app/queue';
import type { Store } from '@app/store';
import type { AppContext } from '@app/types';
import type { Worker } from '@app/worker';

export const createApp = (
  socket: string,
  store: Store,
  worker: Worker<ComposeRequest>,
) => {
  const queue = createQueue(worker);
  const composeService = new services.Compose(queue, store);
  const blueprintService = new services.Blueprint(store, composeService);
  const distributionService = new services.Distribution();

  const middleware = new Hono<AppContext>();
  middleware.use(prettyJSON());
  middleware.use(pinoLogger({ pino: logger }));
  middleware.use(async (ctx, next) => {
    ctx.set('services', {
      blueprint: blueprintService,
      compose: composeService,
      distribution: distributionService,
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
    .route(API_ENDPOINT, api.composes)
    .route(API_ENDPOINT, api.blueprints)
    .route(API_ENDPOINT, api.distributions);

  return {
    app,
    fetch: app.fetch,
    unix: socket,
  };
};
