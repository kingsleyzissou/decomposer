import { Hono } from 'hono';
import Maybe from 'true-myth/maybe';

import type { AppContext } from '@app/types';

import { paginate } from '../pagination';
import type { Compose, ComposeId, Composes } from './types';
import * as validators from './validators';

export const composes = new Hono<AppContext>()

  // curl --unix-socket /run/decomposer-httpd.sock \
  // -X GET 'http://localhost/api/image-builder-composer/v2/composes'
  .get('/composes', async (ctx) => {
    const { limit, offset } = ctx.req.query();
    const { compose: service } = ctx.get('services');
    const result = await service.all();

    return result.match({
      Ok: (composes) => {
        return ctx.json<Composes>(
          paginate<Compose>(composes, Maybe.of(limit), Maybe.of(offset)),
        );
      },
      Err: (error) => {
        const { body, code } = error.response();
        return ctx.json(body, code);
      },
    });
  })

  // curl --unix-socket /run/decomposer-httpd.sock \
  // -H "Content-Type: application/json" \
  // -d @src/__fixtures__/compose-request.json \
  // -X POST 'http://localhost/api/image-builder-composer/v2/compose'
  .post('/compose', validators.createCompose, async (ctx) => {
    const { compose: service } = ctx.get('services');
    const result = await service.add(ctx.req.valid('json'));

    return result.match({
      Ok: ({ id }) => {
        return ctx.json<ComposeId>({ id });
      },
      Err: (error) => {
        const { body, code } = error.response();
        return ctx.json(body, code);
      },
    });
  });

export type * from './types';
