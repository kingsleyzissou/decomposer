import { Hono } from 'hono';
import Maybe from 'true-myth/maybe';

import { AppContext } from '@app/types';

import { asPaginatedResponse } from '../pagination';
import { Blueprint, Blueprints } from './types';

export const blueprints = new Hono<AppContext>()

  // curl --unix-socket /run/decomposer-httpd.sock \
  // -X GET 'http://localhost/api/image-builder-composer/v2/blueprints'
  .get('/blueprints', async (ctx) => {
    const { limit, offset } = ctx.req.query();
    const { blueprint: service } = ctx.get('services');
    const result = await service.all();

    return result.match({
      Ok: (blueprints) => {
        return ctx.json<Blueprints>(
          asPaginatedResponse<Blueprint>(
            blueprints,
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
  });

export * from './types';
