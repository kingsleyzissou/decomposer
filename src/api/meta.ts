import { Context } from 'hono';
import { Hono } from 'hono';

import { SCHEMA_PATH } from '@app/constants';

// load the openapi spec on app startup
// rather than inside the middleware function,
// otherwise the file is loaded on every request.
const schema = await Bun.file(SCHEMA_PATH).json();

type RouteContext = {
  Variables: {
    schema: JSON;
  };
};

const meta = new Hono<RouteContext>()

  // the meta routes are the only routes that
  // need access to the openapi spec
  .use(async (ctx, next) => {
    ctx.set('schema', schema);
    await next();
  })

  .get('/ready', (ctx: Context) => {
    return ctx.json({ readiness: 'ready' });
  })

  .get('/openapi.json', async (ctx: Context) => {
    return ctx.json(ctx.get('schema'));
  });

export { meta };
