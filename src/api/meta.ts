import { Context } from 'hono';
import { Hono } from 'hono';

import { SCHEMA_PATH } from '@app/constants';

const meta = new Hono()

  .get('/ready', (ctx: Context) => {
    return ctx.json({ readiness: 'ready' });
  })

  .get('/openapi.json', async (ctx: Context) => {
    try {
      const schema = await Bun.file(SCHEMA_PATH).json();
      return ctx.json(schema);
    } catch {
      // move out the error handling to middleware
      const message = 'There was an error parsing the openapi schema';
      return ctx.json({ message, ok: false }, 500);
    }
  });

export { meta };
