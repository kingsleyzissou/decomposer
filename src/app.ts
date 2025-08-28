import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';

const middleware = new Hono();
middleware.use(prettyJSON());
middleware.use(logger());

// chaining the functions helps preserve RPC type inference
export const app = new Hono()
  .notFound((c) => c.json({ message: 'Not Found', ok: false }, 404))
  .route('*', middleware)
  .get('/health', (c) => c.json({ message: 'OK', ok: true }, 200));
