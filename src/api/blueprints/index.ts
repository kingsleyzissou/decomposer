import { Hono } from 'hono';
import Maybe from 'true-myth/maybe';

import type { AppContext } from '@app/types';

import type { Compose, ComposeId, Composes } from '../composes';
import { asPaginatedResponse } from '../pagination';
import type {
  Blueprint,
  BlueprintId,
  BlueprintMetadata,
  Blueprints,
} from './types';
import * as validators from './validators';

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
          asPaginatedResponse<BlueprintMetadata>(
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
        return ctx.json<BlueprintId>({ id });
      },
      Err: (error) => {
        const { body, code } = error.response();
        return ctx.json(body, code);
      },
    });
  })

  // curl --unix-socket /run/decomposer-httpd.sock \
  // -X GET 'http://localhost/api/image-builder-composer/v2/blueprints/123e4567-e89b-12d3-a456-426655440000'
  .get('/blueprints/:id', async (ctx) => {
    const id = ctx.req.param('id');
    const { blueprint: service } = ctx.get('services');
    const result = await service.get(id);

    return result.match({
      Ok: (blueprint) => {
        return ctx.json<Blueprint>(blueprint);
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
  // -X PUT 'http://localhost/api/image-builder-composer/v2/blueprints/123e4567-e89b-12d3-a456-426655440000'
  .put('/blueprints/:id', validators.createBlueprint, async (ctx) => {
    const id = ctx.req.param('id');
    const { blueprint: service } = ctx.get('services');
    const result = await service.update(id, ctx.req.valid('json'));

    return result.match({
      Ok: ({ id }) => {
        return ctx.json<BlueprintId>({ id });
      },
      Err: (error) => {
        const { body, code } = error.response();
        return ctx.json(body, code);
      },
    });
  })

  // curl --unix-socket /run/decomposer-httpd.sock \
  // -X DELETE 'http://localhost/api/image-builder-composer/v2/blueprints/123e4567-e89b-12d3-a456-426655440000'
  .delete('/blueprints/:id', async (ctx) => {
    const id = ctx.req.param('id');
    const { blueprint: service } = ctx.get('services');
    const result = await service.delete(id);

    return result.match({
      Ok: () => ctx.json({ message: 'OK' }),
      Err: (error) => {
        const { body, code } = error.response();
        return ctx.json(body, code);
      },
    });
  })

  // curl --unix-socket /run/decomposer-httpd.sock \
  // -X GET 'http://localhost/api/image-builder-composer/v2/blueprints/123e4567-e89b-12d3-a456-426655440000/composes'
  .get('/blueprints/:id/composes', async (ctx) => {
    const id = ctx.req.param('id');
    const { limit, offset } = ctx.req.query();
    const { compose: service } = ctx.get('services');
    const result = await service.all(id);

    // TODO: look at filters
    // - ignoreImageTypes
    // - blueprint_version
    //   - this may not be possible since we only store the latest
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

  // -H "Content-Type: application/json" \
  // -d @src/__mocks__/compose.json \
  // -X POST 'http://localhost/api/image-builder-composer/v2/compose'
  // TODO: fix endpoint comment doc
  .post('/blueprints/:id/compose', validators.composeBlueprint, async (ctx) => {
    const id = ctx.req.param('id');
    const body = ctx.req.valid('json');
    const { blueprint: service } = ctx.get('services');
    const result = await service.compose(id, body);

    return result.match({
      Ok: ({ id }) => ctx.json<ComposeId>({ id }),
      Err: (error) => {
        const { body, code } = error.response();
        return ctx.json(body, code);
      },
    });
  });

export type * from './types';
