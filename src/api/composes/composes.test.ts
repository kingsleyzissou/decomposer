import { $ } from 'bun';
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { StatusCodes } from 'http-status-codes';
import { mkdtemp, rm, rmdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { validate } from 'uuid';

import { composeRequest } from '@fixtures';
import { createTestClient, createTestStore } from '@fixtures';

import type { Composes } from './types';

const HTTP_DIR = path.join('generated', 'examples', 'http', 'composes');

describe('Composes handler tests', async () => {
  const tmp = await mkdtemp(path.join(tmpdir(), 'decomposer-test'));
  const store = createTestStore(tmp);
  const { client, app } = createTestClient(store);
  const socket = path.join(tmp, 'test.sock');

  beforeAll(async () => {
    Bun.serve({
      fetch: app.fetch,
      unix: socket,
    });
  });

  afterAll(async () => {
    await rm(socket);
    await rmdir(tmp, { recursive: true });
  });

  describe('get /composes endpoint', () => {
    it('should initially have no composes', async () => {
      const res = await client.composes.$get();
      expect(res.status).toBe(StatusCodes.OK);
      const body = (await res.json()) as Composes;
      expect(body).not.toBeUndefined();
      expect(body.meta.count).toBe(0);
      expect(body.data).not.toBeUndefined();
      expect(body.data.length).toBe(0);
    });
  });

  describe('create compose tests', () => {
    it('compose should create a new compose', async () => {
      const res = await client.compose.$post({
        json: composeRequest,
      });
      expect(res.status).toBe(StatusCodes.OK);
      const { id } = await res.json();
      expect(validate(id)).toBeTrue();
    });

    it('it should create a new compose with the http example', async () => {
      const example = path.join(path.join(HTTP_DIR, 'create.http'));
      const bin = path.join('node_modules', '.bin', 'httpyac');
      const env = `SOCKET_PATH=${socket}`;
      // prettier-ignore
      const res = await $`${bin} ${example} -v --var ${env} --json -l 3 `.json();
      const { id } = JSON.parse(res.requests[0].response.body);
      expect(validate(id)).toBeTrue();
    });

    it('should now return two composes', async () => {
      const res = await client.composes.$get();
      expect(res.status).toBe(StatusCodes.OK);
      const body = (await res.json()) as Composes;
      expect(body).not.toBeUndefined();
      expect(body.meta.count).toBe(2);
      expect(body.data).not.toBeUndefined();
      expect(body.data.length).toBe(2);
    });
  });
});
