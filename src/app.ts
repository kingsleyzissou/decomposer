import { Hono } from 'hono';
import { pinoLogger } from 'hono-pino';
import { prettyJSON } from 'hono/pretty-json';

import { notFound, onError } from '@app/errors';
import { logger } from '@app/logger';
import type { AppContext } from '@app/types';

const middleware = new Hono<AppContext>();
middleware.use(prettyJSON());
middleware.use(pinoLogger({ pino: logger }));
middleware.use(async (ctx, next) => {
  ctx.set('logger', logger);
  await next();
});

// chaining the functions helps preserve RPC type inference
export const app = new Hono<AppContext>()
  .notFound(notFound)
  .onError(onError)
  .route('*', middleware)
  .get('/health', (c) => c.json({ message: 'OK', ok: true }, 200));
