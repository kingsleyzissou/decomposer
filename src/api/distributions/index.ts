import { Context } from 'hono';
import { Hono } from 'hono';
import z from 'zod';

import * as schema from '@gen/ibcrc/zod';

// pre-load the json list of distribution data on app
// startup and inject it to the route through middleware
import { list } from './distributions';

export type DistributionsResponse = z.infer<
  typeof schema.DistributionsResponse
>;

type RouteContext = {
  Variables: {
    distributions: DistributionsResponse;
  };
};

export const distributions = new Hono<RouteContext>()

  .use(async (ctx, next) => {
    ctx.set('distributions', list);
    await next();
  })

  // curl --unix-socket /run/decomposer-httpd.sock \
  // -X GET 'http://localhost/api/image-builder-composer/v2/distributions'
  .get('/distributions', (ctx: Context) => {
    const distributions = ctx.get('distributions');
    return ctx.json<DistributionsResponse>(distributions);
  });
