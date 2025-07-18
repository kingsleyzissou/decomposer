import { afterAll, describe, expect, it } from 'bun:test';
import { Hono } from 'hono';
import { testClient } from 'hono/testing';
import { StatusCodes } from 'http-status-codes';
import { mkdir, mkdtemp, rmdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { v4 as uuid } from 'uuid';

import { onError } from '@app/errors';

import { composes } from '.';
import { ComposeContext, ComposesResponse } from './types';

const tmp = await mkdtemp(path.join(tmpdir(), 'decomposer-test'));

describe('Composes handler tests', async () => {
  const client = testClient(
    new Hono<ComposeContext>()
      .onError(onError)
      .use(async (ctx, next) => {
        ctx.set('store', tmp);
        await next();
      })
      .route('/', composes),
  );

  afterAll(async () => {
    await rmdir(tmp);
  });

  it('GET /composes should initially be empty', async () => {
    const res = await client.composes.$get();
    expect(res.status).toBe(StatusCodes.OK);
    const body = (await res.json()) as ComposesResponse;
    expect(body).not.toBeUndefined();
    expect(body.meta.count).toBe(0);
    expect(body.data).not.toBeUndefined();
    expect(body.data.length).toBe(0);
  });

  it('DELETE /compose/:id should delete a compose', async () => {
    let res = await client.composes.$get();
    expect(res.status).toBe(StatusCodes.OK);
    let body = (await res.json()) as ComposesResponse;
    expect(body.meta.count).toBe(0);
    await mkdir(path.join(tmp, uuid()));
    res = await client.composes.$get();
    expect(res.status).toBe(StatusCodes.OK);
    body = (await res.json()) as ComposesResponse;
    expect(body.meta.count).toBe(1);
    const { id } = body.data[0];
    await client.compose[':id'].$delete({ param: { id } });
    res = await client.composes.$get();
    expect(res.status).toBe(StatusCodes.OK);
    body = (await res.json()) as ComposesResponse;
    expect(body.meta.count).toBe(0);
  });

  it('DELETE /compose/:id for non-existing compose should return 404', async () => {
    const res = await client.compose[':id'].$delete({ param: { id: '123' } });
    expect(res.status).toBe(StatusCodes.NOT_FOUND);
  });
});
