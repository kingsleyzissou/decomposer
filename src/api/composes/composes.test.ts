import { $ } from 'bun';
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { StatusCodes } from 'http-status-codes';
import { mkdtemp, rm, rmdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { validate } from 'uuid';

import { Status } from '@app/constants';

import { composeRequest } from '@fixtures';
import { createTestClient, createTestStore } from '@fixtures';

import type { ComposeStatus, Composes } from './types';

const CURL_DIR = path.join('generated', 'examples', 'curl', 'composes');
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

  let newCompose = '';

  describe('get composes test', () => {
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
      newCompose = id;
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

  describe('get compose status tests', () => {
    it('should return the status of a compose', async () => {
      const res = await client.composes[':id'].$get({
        param: {
          id: newCompose,
        },
      });
      expect(res.status).toBe(StatusCodes.OK);
      const body = (await res.json()) as ComposeStatus;
      expect(body).not.toBeUndefined();
      expect(body.image_status.status).toBeOneOf([
        Status.SUCCESS,
        Status.FAILURE,
      ]);
    });

    it('should return the status of a compose with the curl example', async () => {
      const example = path.join(path.join(CURL_DIR, 'show.sh'));
      const env = `SOCKET_PATH=${socket}`;
      const res = await $`${env} bash ${example} ${newCompose}`.json();
      expect(res).not.toBeUndefined();
      expect(res.image_status.status).toBeOneOf([
        Status.SUCCESS,
        Status.FAILURE,
      ]);
    });

    it('should return a 404 Response for non-existing compose', async () => {
      const res = await client.composes[':id'].$get({ param: { id: '123' } });
      expect(res.status).toBe(StatusCodes.NOT_FOUND);
    });
  });

  describe('delete compose tests', () => {
    it('should delete a compose', async () => {
      await Bun.sleep(4);
      const res = await client.composes[':id'].$delete({
        param: { id: newCompose },
      });
      expect(res.status).toBe(StatusCodes.OK);
    });

    it('should have one compose again', async () => {
      const res = await client.composes.$get();
      expect(res.status).toBe(StatusCodes.OK);
      const body = (await res.json()) as Composes;
      expect(body).not.toBeUndefined();
      expect(body.meta.count).toBe(1);
      expect(body.data).not.toBeUndefined();
      expect(body.data.length).toBe(1);
    });

    it('should return a 404 Response for non-existing compose', async () => {
      const res = await client.composes[':id'].$delete({
        param: { id: '123' },
      });
      expect(res.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('compose should create a new compose', async () => {
      const res = await client.compose.$post({
        json: composeRequest,
      });
      expect(res.status).toBe(StatusCodes.OK);
      const { id } = await res.json();
      newCompose = id;
      await Bun.sleep(2);
    });

    it('it should return a 500 Response with corrupt directory', async () => {
      // just wait for the scheduled job to run, otherwise this causes
      // the tests to break
      await Bun.sleep(1);
      await rmdir(path.join(tmp, newCompose), { recursive: true });
      await Bun.sleep(4);
      const res = await client.composes[':id'].$delete({
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
});
