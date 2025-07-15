import { type Context, Hono } from 'hono';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import type { Next } from 'hono/types';

import { SCHEMA_PATH } from '@app/constants';
import { AppContext } from '@app/types';

export const openapiSchema = async (ctx: Context, next: Next) => {
  ctx.set('schema', await Bun.file(SCHEMA_PATH).json());
  await next();
};

export const middleware = new Hono<AppContext>();
middleware.use(prettyJSON());
middleware.use(logger());
middleware.use(openapiSchema);
