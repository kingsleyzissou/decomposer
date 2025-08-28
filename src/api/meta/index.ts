import type { Context } from 'hono';
import { Hono } from 'hono';

// load the openapi spec once on app startup
import { schema } from '@gen/ibcrc';

export const meta = new Hono()
  // curl --unix-socket /run/decomposer-httpd.sock \
  // -X GET 'http://localhost/api/image-builder-composer/v2/ready'
  .get('/ready', (ctx: Context) => {
    return ctx.json({ readiness: 'ready' });
  })

  // curl --unix-socket /run/decomposer-httpd.sock \
  // -X GET 'http://localhost/api/image-builder-composer/v2/openapi.json'
  .get('/openapi.json', async (ctx: Context) => {
    return ctx.json(schema);
  });
