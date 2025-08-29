import { Hono } from 'hono';
import { pinoLogger } from 'hono-pino';
import { prettyJSON } from 'hono/pretty-json';

import { services } from '@app/api';
import { notFound } from '@app/errors';
import { logger } from '@app/logger';
import type { AppContext, Store } from '@app/types';

export const createMiddleware = (store: Store) => {
  const composeService = new services.Compose(store);

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
