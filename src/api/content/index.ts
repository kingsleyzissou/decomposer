import { Hono } from 'hono';

import type { AppContext } from '@app/types';

export const content = new Hono<AppContext>()
  .get('/hello', async (ctx) => {
    return ctx.json({ hello: 'hello' });
  })
  // curl --unix-socket /run/decomposer-httpd.sock \
  // -H "Content-Type: application/json" \
  // -d @/search.json \
  // -X POST 'http://localhost/api/content-services/v1/rpms/names'
  .post('/rpms/names', async (ctx) => {
    const { content: service } = ctx.get('services');
    const result = await service.rpms(await ctx.req.json());

    return result.match({
      Ok: (packages) => {
        return ctx.json(packages);
      },
      Err: (error) => {
        const { body, code } = error.response();
        return ctx.json(body, code);
      },
    });
  });
