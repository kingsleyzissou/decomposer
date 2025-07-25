import { afterAll, describe, expect, it } from 'bun:test';
import { Hono } from 'hono';
import { testClient } from 'hono/testing';
import { ContentfulStatusCode } from 'hono/utils/http-status';
import { StatusCodes } from 'http-status-codes';
import { mkdtemp, rmdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { validate } from 'uuid';

import { onError } from '@app/errors';
import { JobQueue } from '@app/queue';
import { buildImage } from '@app/queue';
import { ComposeRequest } from '@app/types';

import { composeRequest, createTestStore } from '@fixtures';

import { composes } from '.';
import { ComposeContext, ComposesResponse } from './types';

const executable = path.join(__dirname, '..', '..', '__mocks__', 'ibcli');

describe('Composes handler tests', async () => {
  const store = createTestStore();
  const tmp = await mkdtemp(path.join(tmpdir(), 'decomposer-test'));
  const client = testClient(
    new Hono<ComposeContext>()
      .onError(onError)
      .use(async (ctx, next) => {
        // inject a mock executable here so that we don't actually run ibcli
        const queue = new JobQueue<ComposeRequest>(buildImage(tmp, executable));
        ctx.set('queue', queue);
        ctx.set('store', { path: tmp, composes: store.composes });
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
    expect(res.status).toBe(StatusCodes.OK);
    const { id } = await res.json();
    newCompose = id;
    expect(validate(id)).toBeTrue();
  });

  it('GET /composes should have one compose now', async () => {
    // delay the request so we can finish simulating
    // the post request
    const res = await client.composes.$get();
    expect(res.status).toBe(StatusCodes.OK);
    const body = (await res.json()) as ComposesResponse;
    expect(body).not.toBeUndefined();
    expect(body.meta.count).toBe(1);
    expect(body.data).not.toBeUndefined();
    expect(body.data.length).toBe(1);
  });

  it('DELETE /compose/:id should delete a compose', async () => {
    await Bun.sleep(4);
    const res = await client.compose[':id'].$delete({
      param: { id: newCompose },
    });
    expect(res.status).toBe(StatusCodes.OK);
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

  it('POST /compose should create a new compose', async () => {
    const res = await client.compose.$post({
      json: composeRequest,
    });
    expect(res.status).toBe(StatusCodes.OK);
    const { id } = await res.json();
    newCompose = id;
    Bun.sleep(2);
  });

  it('DELETE /compose/:id with corrupt directory should return 500', async () => {
    // just wait for the scheduled job to run, otherwise this causes
    // the tests to break
    await Bun.sleep(1);
    await rmdir(path.join(tmp, newCompose), { recursive: true });
    Bun.sleep(2);
    const res = await client.compose[':id'].$delete({
      param: { id: newCompose },
    });
    expect(res.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    const body = (await res.json()) as {
      code: ContentfulStatusCode;
      message: string;
      details?: unknown;
    };
    expect(body).toStrictEqual({
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      message: 'Unable to complete transaction',
      details: [
        {
          code: 'ENOENT',
          syscall: 'rmdir',
          errno: -2,
        },
      ],
    });
  });
});
