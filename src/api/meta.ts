import { Context } from 'hono';
import { Hono } from 'hono';

const meta = new Hono()

  .get('/ready', (ctx: Context) => {
    return ctx.json({ readiness: 'ready' });
  })

  .get('/openapi.json', async (ctx: Context) => {
    return ctx.json(ctx.get('schema'));
  });

export { meta };
