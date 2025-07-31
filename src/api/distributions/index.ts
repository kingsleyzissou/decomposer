import { Hono } from 'hono';

import { AppContext } from '@app/types';

import {
  ArchitecturesResponse,
  Distributions,
  DistributionsResponse,
} from './types';

export const distributions = new Hono<AppContext>()

  // curl --unix-socket /run/decomposer-httpd.sock \
  // -X GET 'http://localhost/api/image-builder-composer/v2/distributions'
  .get('/distributions', (ctx) => {
    const { distribution: service } = ctx.get('services');
    const result = service.all();

    return result.match({
      Ok: (distributions) => {
        return ctx.json<DistributionsResponse>(distributions);
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
    const distribution = ctx.req.param('distribution') as Distributions;
    const { distribution: service } = ctx.get('services');
    const result = await service.getArchitectures(distribution);

    return result.match({
      Ok: (architectures) => {
        return ctx.json<ArchitecturesResponse>(architectures);
      },
      Err: (error) => {
        const { body, code } = error.response();
        return ctx.json(body, code);
      },
    });
  });
