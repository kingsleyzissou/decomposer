import { afterAll, describe, expect, it } from 'bun:test';
import { Hono } from 'hono';
import { testClient } from 'hono/testing';
import { StatusCodes } from 'http-status-codes';
import { mkdtemp, rmdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { validate } from 'uuid';

import { onError } from '@app/errors';
import { WorkerQueue } from '@app/queue';
import { ComposeJob } from '@app/types';

import { composeRequest } from '@fixtures';

import { composes } from '.';
import { ComposeContext, ComposesResponse } from './types';

describe('Composes handler tests', async () => {
  const tmp = await mkdtemp(path.join(tmpdir(), 'decomposer-test'));
  const client = testClient(
    new Hono<ComposeContext>()
      .onError(onError)
      .use(async (ctx, next) => {
        // we're re-creating the worker on each request which is
        // not ideal. But moving this out of this middleware causes
        // some test flakiness
        const worker = new Worker(
          path.join(__dirname, '..', '__mocks__', 'worker.ts'),
        );
        const queue = new WorkerQueue<ComposeJob>(worker, tmp);
        ctx.set('queue', queue);
        ctx.set('store', tmp);
        await next();
      })
      .route('/', composes),
  );

  afterAll(async () => {
    await rmdir(tmp, { recursive: true });
  });

  let newCompose = '';

  it('GET /composes should initially be empty', async () => {
    const res = await client.composes.$get();
    expect(res.status).toBe(StatusCodes.OK);
    const body = (await res.json()) as ComposesResponse;
    expect(body).not.toBeUndefined();
    expect(body.meta.count).toBe(0);
    expect(body.data).not.toBeUndefined();
    expect(body.data.length).toBe(0);
  });

  it('POST /compose should create a new compose', async () => {
    const res = await client.compose.$post({
      json: composeRequest,
    });
    expect(res.status).toBe(200);
    const { id } = await res.json();
    newCompose = id;
    expect(validate(id)).toBeTrue();
  });

  it('GET /composes should have one compose now', async () => {
    // delay the request so we can finish simulating
    // the post request
    setTimeout(async () => {
      const res = await client.composes.$get();
      expect(res.status).toBe(200);
      const body = (await res.json()) as ComposesResponse;
      expect(body).not.toBeUndefined();
      expect(body.meta.count).toBe(1);
      expect(body.data).not.toBeUndefined();
      expect(body.data.length).toBe(1);
    }, 200);
  });

  it('DELETE /compose/:id should delete a compose', async () => {
    // delay the request so we can finish simulating
    // the post request
    setTimeout(async () => {
      const res = await client.compose[':id'].$delete({
        param: { id: newCompose },
      });
      expect(res.status).toBe(200);
    }, 200);
  });

  it('GET /composes should empty again', async () => {
    const res = await client.composes.$get();
    expect(res.status).toBe(StatusCodes.OK);
    const body = (await res.json()) as ComposesResponse;
    expect(body).not.toBeUndefined();
    expect(body.meta.count).toBe(0);
    expect(body.data).not.toBeUndefined();
    expect(body.data.length).toBe(0);
  });

  it('DELETE /compose/:id for non-existing compose should return 404', async () => {
    const res = await client.compose[':id'].$delete({ param: { id: '123' } });
    expect(res.status).toBe(StatusCodes.NOT_FOUND);
  });
});
