import { Hono } from 'hono';

import { ComposeService } from './service';
import { ComposeContext, ComposesResponse } from './types';

export const composes = new Hono<ComposeContext>()

  // Rather than initialising the service inside each
  // handler, we can just inject it through middleware.
  // Each handler will then have access to service via app context
  // This does mean that we are instantiating the service on each
  // request, but the constructor is small
  .use(async (ctx, next) => {
    const store = ctx.get('store');
    ctx.set('service', new ComposeService(store));
    await next();
  })

  .get('/composes', async (ctx) => {
    const service = ctx.get('service');
    const composes = await service.composes();

    const first = composes.length > 0 ? composes[0].id : '';
    const last = composes.length > 0 ? composes[composes.length - 1].id : '';

    return ctx.json<ComposesResponse>({
      meta: { count: composes.length },
      links: {
        first,
        last,
      },
      data: composes,
    });
  });
