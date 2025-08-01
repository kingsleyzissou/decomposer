import { Hono } from 'hono';
import Maybe from 'true-myth/maybe';

import { AppContext } from '@app/types';

import { asPaginatedResponse } from '../pagination';
import { Compose, ComposeId, ComposeStatus, Composes } from './types';
import * as validators from './validators';

export const composes = new Hono<AppContext>()

  // curl --unix-socket /run/decomposer-httpd.sock \
  // -X GET 'http://localhost/api/image-builder-composer/v2/composes'
  .get('/composes', async (ctx) => {
    const { limit, offset } = ctx.req.query();
    const { compose: service } = ctx.get('services');
    const result = await service.composes();

    return result.match({
      Ok: (composes) => {
        return ctx.json<Composes>(
          asPaginatedResponse<Compose>(
            composes,
            Maybe.of(limit),
            Maybe.of(offset),
          ),
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
  // -d @src/__mocks__/compose.json \
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
  })

  // curl --unix-socket /run/decomposer-httpd.sock \
  // -X GET 'http://localhost/api/image-builder-composer/v2/compose/123e4567-e89b-12d3-a456-426655440000'
  .get('/composes/:id', async (ctx) => {
    const id = ctx.req.param('id');
    const { compose: service } = ctx.get('services');
    const result = await service.get(id);

    return result.match({
      Ok: (compose) => {
        return ctx.json<ComposeStatus>({
          request: compose.request!,
          image_status: {
            status: compose.status,
          },
        });
      },
      Err: (error) => {
        const { body, code } = error.response();
        return ctx.json(body, code);
      },
    });
  })

  // curl --unix-socket /run/decomposer-httpd.sock \
  // -X DELETE 'http://localhost/api/image-builder-composer/v2/compose/123e4567-e89b-12d3-a456-426655440000'
  .delete('/compose/:id', async (ctx) => {
    const id = ctx.req.param('id');
    const { compose: service } = ctx.get('services');
    const result = await service.delete(id);

    return result.match({
      Ok: () => ctx.json({ message: 'OK' }),
      Err: (error) => {
        const { body, code } = error.response();
        return ctx.json(body, code);
      },
    });
  });

export * from './types';
