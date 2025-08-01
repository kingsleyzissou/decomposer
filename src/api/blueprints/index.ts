import { Hono } from 'hono';

import { AppContext } from '@app/types';
import { pagify } from '@app/utilities';

import {
  Blueprint,
  BlueprintsResponse,
  CreateBlueprintResponse,
} from './types';
import * as validators from './validators';

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
  })

  // curl --unix-socket /run/decomposer-httpd.sock \
  // -H "Content-Type: application/json" \
  // -d @src/__mocks__/blueprint.json \
  // -X POST 'http://localhost/api/image-builder-composer/v2/blueprint'
  .post('/blueprint', validators.createBlueprint, async (ctx) => {
    const { blueprint: service } = ctx.get('services');
    const result = await service.add(ctx.req.valid('json'));

    return result.match({
      Ok: ({ id }) => {
        return ctx.json<CreateBlueprintResponse>({ id });
      },
      Err: (error) => {
        const { body, code } = error.response();
        return ctx.json(body, code);
      },
    });
  });

export * from './types';
