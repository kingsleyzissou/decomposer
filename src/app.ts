import { Hono } from 'hono';
import { pinoLogger } from 'hono-pino';
import { prettyJSON } from 'hono/pretty-json';

import * as api from '@app/api';
import { API_ENDPOINT } from '@app/constants';
import { notFound, onError } from '@app/errors';
import { logger } from '@app/logger';
import { JobQueue, buildImage } from '@app/queue';
import { createStore } from '@app/store';
import { AppContext, ComposeRequest } from '@app/types';

export const createApp = (store: string, socket: string) => {
  const app = new Hono();
  app.notFound(notFound);
  app.onError(onError);

  const { composes } = createStore(store);
  const queue = new JobQueue<ComposeRequest>(buildImage(store));

  const middleware = new Hono<AppContext>();
  middleware.use(prettyJSON());
  middleware.use(pinoLogger({ pino: logger }));
  middleware.use(async (ctx, next) => {
    ctx.set('store', {
      path: store,
      composes,
    });
    ctx.set('queue', queue);
    await next();
  });
  app.route('*', middleware);

  app.route(API_ENDPOINT, api.meta);
  app.route(API_ENDPOINT, api.composes);

  return {
    fetch: app.fetch,
    unix: socket,
  };
};
