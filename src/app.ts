import { Hono } from 'hono';
import { pinoLogger } from 'hono-pino';
import { prettyJSON } from 'hono/pretty-json';

import { notFound, onError } from '@app/errors';
import { logger } from '@app/logger';

const middleware = new Hono();
middleware.use(prettyJSON());
middleware.use(pinoLogger({ pino: logger }));

// chaining the functions helps preserve RPC type inference
export const app = new Hono()
  .notFound(notFound)
  .onError(onError)
  .route('*', middleware)
  .get('/health', (c) => c.json({ message: 'OK', ok: true }, 200));
