import { Hono } from 'hono';

import { AppContext } from '@app/types';

import { Architectures, Distribution, Distributions } from './types';

export const distributions = new Hono<AppContext>()

  // curl --unix-socket /run/decomposer-httpd.sock \
  // -X GET 'http://localhost/api/image-builder-composer/v2/distributions'
  .get('/distributions', (ctx) => {
    const { distribution: service } = ctx.get('services');
    const result = service.distributions();

    return result.match({
      Ok: (distributions) => {
        return ctx.json<Distributions>(distributions);
      },
      Err: (error) => {
        const { body, code } = error.response();
        return ctx.json(body, code);
      },
    });
  })

  // curl --unix-socket /run/decomposer-httpd.sock \
  // -X GET 'http://localhost/api/image-builder-composer/v2/architectures/rhel-9.0'
  .get('/architectures/:distribution', async (ctx) => {
    const distribution = ctx.req.param('distribution') as Distribution;
    const { distribution: service } = ctx.get('services');
    const result = await service.architectures(distribution);

    return result.match({
      Ok: (architectures) => {
        return ctx.json<Architectures>(architectures);
      },
      Err: (error) => {
        const { body, code } = error.response();
        return ctx.json(body, code);
      },
    });
  });
