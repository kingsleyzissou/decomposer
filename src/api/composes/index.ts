import { Hono } from 'hono';
import Maybe from 'true-myth/maybe';

import type { AppContext } from '@app/types';

import { paginate } from '../pagination';
import type { Compose, Composes } from './types';

export const composes = new Hono<AppContext>()

  /**
   * List composes
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
  });

export type * from './types';
