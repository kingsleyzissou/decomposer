import { Hono } from 'hono';
import { pinoLogger } from 'hono-pino';
import { prettyJSON } from 'hono/pretty-json';
import { randomUUID } from 'crypto';

import * as api from '@app/api';
import type { ComposeRequest } from '@app/api';
import { services } from '@app/api';
import { API_ENDPOINT } from '@app/constants';
import { notFound, onError } from '@app/errors';
import { logger, createModuleLogger } from '@app/logger';
import { createQueue } from '@app/queue';
import type { Store } from '@app/store';
import type { AppContext } from '@app/types';
import type { Worker } from '@app/worker';

const appLogger = createModuleLogger('app');

export const createApp = (
  socket: string,
  store: Store,
  worker: Worker<ComposeRequest>,
) => {
  appLogger.info('Creating application instance');
  
  const queue = createQueue(worker);
  const composeService = new services.Compose(queue, store);
  const blueprintService = new services.Blueprint(store, composeService);
  const distributionService = new services.Distribution();

  appLogger.debug('Services initialized');

  const middleware = new Hono<AppContext>();
  
  // Request correlation ID middleware
  middleware.use(async (ctx, next) => {
    const requestId = ctx.req.header('x-request-id') || randomUUID();
    ctx.set('requestId', requestId);
    ctx.header('x-request-id', requestId);
    await next();
  });
  
  middleware.use(prettyJSON());
  
  // Enhanced pino logger with request context
  middleware.use(pinoLogger({ 
    pino: logger,
  }));
  
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

  appLogger.info({
    socket,
    apiEndpoint: API_ENDPOINT,
  }, 'Application configured successfully');

  return {
    app,
    fetch: app.fetch,
    unix: socket,
  };
};
