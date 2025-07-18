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

  // curl --unix-socket /run/decomposer-httpd.sock \
  // -X GET 'http://localhost/api/image-builder-composer/v2/ready'
  .get('/ready', (ctx: Context) => {
    return ctx.json({ readiness: 'ready' });
  })

  // curl --unix-socket /run/decomposer-httpd.sock \
  // -X GET 'http://localhost/api/image-builder-composer/v2/openapi.json'
  .get('/openapi.json', async (ctx: Context) => {
    return ctx.json(ctx.get('schema'));
  });

export { meta };
