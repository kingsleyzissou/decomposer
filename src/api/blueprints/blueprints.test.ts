import { afterAll, describe, expect, it } from 'bun:test';
import { Hono } from 'hono';
import { testClient } from 'hono/testing';
import { StatusCodes } from 'http-status-codes';
import { mkdtemp, rmdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { AppContext } from '@app/types';

import { createTestStore } from '@fixtures';

import { BlueprintsResponse, blueprints } from '.';
import { BlueprintService } from './service';

const createTestClient = (tmp: string) => {
  const store = createTestStore(tmp, 'blueprints');
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

  it('GET /blueprints should initially be empty', async () => {
    const res = await client.blueprints.$get();
    expect(res.status).toBe(StatusCodes.OK);
    const body = (await res.json()) as BlueprintsResponse;
    expect(body).not.toBeUndefined();
    expect(body.meta.count).toBe(0);
    expect(body.data).not.toBeUndefined();
    expect(body.data.length).toBe(0);
  });
});
