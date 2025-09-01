import { Hono } from 'hono';
import Maybe from 'true-myth/maybe';

import type { AppContext } from '@app/types';

import { paginate } from '../pagination';
import type { Compose, ComposeId, ComposeStatus, Composes } from './types';
import * as validators from './validators';

export const composes = new Hono<AppContext>()

  /**
   * List composes
   *
   * @rest index
   */
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

  /**
   * Create compose
   *
   * @rest create
   * @example src/__fixtures__/compose.json
   */
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

  /**
   * Get compose status
   *
   * @rest show
   */
  .get('/composes/:id', async (ctx) => {
    const id = ctx.req.param('id');
    const { compose: service } = ctx.get('services');
    const result = await service.status(id);

    return result.match({
      Ok: (status) => {
        return ctx.json<ComposeStatus>(status);
      },
      Err: (error) => {
        const { body, code } = error.response();
        return ctx.json(body, code);
      },
    });
  })

  /**
   * Delete compose
   *
   * @rest delete
   */
  .delete('/composes/:id', async (ctx) => {
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

export type * from './types';
