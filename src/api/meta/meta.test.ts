import { $ } from 'bun';
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { StatusCodes } from 'http-status-codes';
import { mkdtemp, rm, rmdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'path';

import { schema } from '@gen/decomposer';

import { createTestClient, createTestStore } from '@fixtures';

const CURL_DIR = path.join('generated', 'examples', 'curl', 'meta');
const HTTP_DIR = path.join('generated', 'examples', 'http', 'meta');

describe('Meta handler tests', async () => {
  const tmp = await mkdtemp(path.join(tmpdir(), 'decomposer-test'));
  const store = createTestStore(tmp);
  const { app, client } = createTestClient(store);
  const socket = path.join(tmp, 'test.sock');

  beforeAll(() => {
    Bun.serve({
      fetch: app.fetch,
      unix: socket,
    });
  });

  afterAll(async () => {
    await rm(socket);
    await rmdir(tmp, { recursive: true });
  });

  describe('/ready endpoint tests', () => {
    it('should return a 200 Response', async () => {
      const res = await client.ready.$get();
      expect(res.status).toBe(StatusCodes.OK);
      expect(await res.json()).toEqual({
        readiness: 'ready',
      });
    });

    // we won't run both the curl & http tests here because they're quite
    // slow. So we can test one here and one in the next describe block
    it('should return a 200 Response with the curl example', async () => {
      const example = path.resolve(path.join(CURL_DIR, 'ready.sh'));
      const env = `SOCKET_PATH=${socket}`;
      const res = await $`${env} bash ${example} ${socket}`.json();
      expect(res).toBeDefined();
      expect(res).toStrictEqual({
        readiness: 'ready',
      });
    });
  });

  describe('/openapi.json endpoint tests', () => {
    it('should return a 200 Response', async () => {
      const res = await client['openapi.json'].$get();
      expect(res.status).toBe(StatusCodes.OK);
      expect(await res.json()).toEqual(schema);
    });

    it('should return a 200 Response with the http example', async () => {
      const example = path.join(path.join(HTTP_DIR, 'openapi.http'));
      const bin = path.join('node_modules', '.bin', 'httpyac');
      const env = `SOCKET_PATH=${socket}`;
      const res = await $`${bin} ${example} --var ${env} --json -l 3 `.json();
      const body = JSON.parse(res.requests[0].response.body);
      expect(body).toBeDefined();
      expect(body).toStrictEqual(schema);
    });
  });
});
