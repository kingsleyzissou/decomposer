import { afterAll, describe, expect, it } from 'bun:test';
import { StatusCodes } from 'http-status-codes';
import { mkdtemp, rmdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { validate } from 'uuid';

import { composeRequest } from '@fixtures';
import { createTestClient, createTestStore } from '@fixtures';

import type { Composes } from './types';

describe('Composes handler tests', async () => {
  const tmp = await mkdtemp(path.join(tmpdir(), 'decomposer-test'));
  const store = createTestStore(tmp);
  const client = createTestClient(store);

  afterAll(async () => {
    await rmdir(tmp, { recursive: true });
  });

  it('GET /composes should initially be empty', async () => {
    const res = await client.composes.$get();
    expect(res.status).toBe(StatusCodes.OK);
    const body = (await res.json()) as Composes;
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
    expect(validate(id)).toBeTrue();
  });

  it('GET /composes should have one compose now', async () => {
    const res = await client.composes.$get();
    expect(res.status).toBe(StatusCodes.OK);
    const body = (await res.json()) as Composes;
    expect(body).not.toBeUndefined();
    expect(body.meta.count).toBe(1);
    expect(body.data).not.toBeUndefined();
    expect(body.data.length).toBe(1);
  });
});
