import { Hono } from 'hono';

import { AppContext } from '@app/types';
import { pagify } from '@app/utilities';

import { Blueprint, BlueprintsResponse } from './types';

export const blueprints = new Hono<AppContext>()

  // curl --unix-socket /run/decomposer-httpd.sock \
  // -X GET 'http://localhost/api/image-builder-composer/v2/blueprints'
  .get('/blueprints', async (ctx) => {
    const { blueprint: service } = ctx.get('services');
    const result = await service.all();

    return result.match({
      Ok: (blueprints) => {
        return ctx.json<BlueprintsResponse>(pagify<Blueprint>(blueprints));
      },
      Err: (error) => {
        const { body, code } = error.response();
        return ctx.json(body, code);
      },
    });
  });

export * from './types';
