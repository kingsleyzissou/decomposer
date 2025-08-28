import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';

import { notFound, onError } from '@app/errors';

const middleware = new Hono();
middleware.use(prettyJSON());
middleware.use(logger());

// chaining the functions helps preserve RPC type inference
export const app = new Hono()
  .notFound(notFound)
  .onError(onError)
  .route('*', middleware)
  .get('/health', (c) => c.json({ message: 'OK', ok: true }, 200));
