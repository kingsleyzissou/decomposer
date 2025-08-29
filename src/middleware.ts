import { Hono } from 'hono';
import { pinoLogger } from 'hono-pino';
import { prettyJSON } from 'hono/pretty-json';

import { type ComposeRequest, services } from '@app/api';
import { notFound } from '@app/errors';
import { logger } from '@app/logger';
import type { JobQueue } from '@app/queue';
import type { AppContext, Store } from '@app/types';

export const createMiddleware = (
  queue: JobQueue<ComposeRequest>,
  store: Store,
) => {
  const composeService = new services.Compose(queue, store);

  return new Hono<AppContext>()
    .notFound(notFound)
    .use(prettyJSON())
    .use(pinoLogger({ pino: logger }))
    .use(async (ctx, next) => {
      ctx.set('services', {
        compose: composeService,
      });
      await next();
    });
};
