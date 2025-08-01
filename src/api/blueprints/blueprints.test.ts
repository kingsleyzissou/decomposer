import { afterAll, describe, expect, it } from 'bun:test';
import { Hono } from 'hono';
import { testClient } from 'hono/testing';
import { StatusCodes } from 'http-status-codes';
import { mkdtemp, rmdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { validate } from 'uuid';

import { AppContext } from '@app/types';

import { blueprintRequest, createTestStore } from '@fixtures';

import { Blueprints, blueprints } from '.';
import { BlueprintService } from './service';

const createTestClient = (tmp: string) => {
  const store = createTestStore(tmp);
  const service = new BlueprintService(store);
  return testClient(
    new Hono<AppContext>()
      .use(async (ctx, next) => {
        // @ts-expect-error we don't need to set
        // the compose service here for testing
        ctx.set('services', {
          blueprint: service,
        });
        await next();
      })
      .route('/', blueprints),
  );
};

describe('Blueprints handler tests', async () => {
  const tmp = await mkdtemp(path.join(tmpdir(), 'decomposer-test'));
  const client = createTestClient(tmp);

  afterAll(async () => {
    await rmdir(tmp, { recursive: true });
  });

  let newBlueprint = '';

  it('GET /blueprints should initially be empty', async () => {
    const res = await client.blueprints.$get();
    expect(res.status).toBe(StatusCodes.OK);
    const body = (await res.json()) as Blueprints;
    expect(body).not.toBeUndefined();
    expect(body.meta.count).toBe(0);
    expect(body.data).not.toBeUndefined();
    expect(body.data.length).toBe(0);
  });

  it('POST /compose should create a new compose', async () => {
    const res = await client.blueprint.$post({
      json: blueprintRequest,
    });
    expect(res.status).toBe(StatusCodes.OK);
    const { id } = await res.json();
    newBlueprint = id;
    expect(validate(id)).toBeTrue();
  });

  it('GET /blueprints should have one blueprint now', async () => {
    const res = await client.blueprints.$get();
    expect(res.status).toBe(StatusCodes.OK);
    const body = (await res.json()) as Blueprints;
    expect(body).not.toBeUndefined();
    expect(body.meta.count).toBe(1);
    expect(body.data).not.toBeUndefined();
    expect(body.data.length).toBe(1);
  });

  it('GET /blueprints/:id should get a blueprint', async () => {
    await Bun.sleep(4);
    const res = await client.blueprints[':id'].$get({
      param: { id: newBlueprint },
    });
    expect(res.status).toBe(StatusCodes.OK);
    const body = (await res.json()) as Blueprints;
    expect(body.name).toBe(blueprintRequest.name);
    expect(body.description).toBe(blueprintRequest.description);
  });
});
