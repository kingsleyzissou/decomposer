import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { StatusCodes } from 'http-status-codes';
import { mkdtemp, rmdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import type { Compose } from '../src/api';
import { createApp } from '../src/app';
import { createStore } from '../src/store';
import { getHostArch } from '../src/utilities';
import { createWorker } from '../src/worker';

const composeRequest = await Bun.file(
  path.join(__dirname, '..', 'src', '__fixtures__', 'compose-request.json'),
).json();

describe('Integration test', async () => {
  const tmp = await mkdtemp(path.join(tmpdir(), 'decomposer-test'));
  const socket = '/tmp/test.sock';
  const hostArch = getHostArch();

  beforeAll(async () => {
    const store = createStore(tmp);
    const worker = createWorker(store, 'manifest');
    const app = createApp(socket, store, worker);
    const proc = Bun.serve(app);
    expect(proc).toBeDefined();
  });

  afterAll(async () => {
    await rmdir(tmp, { recursive: true });
    if (await Bun.file(socket).exists()) {
      await Bun.file(socket).unlink();
    }
  });

  let composeId = '';

  it('should queue an image manifest', async () => {
    const response = await fetch(
      'http://localhost/api/image-builder-composer/v2/compose',
      {
        unix: socket,
        method: 'POST',
        body: JSON.stringify(composeRequest),
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    expect(response.status).toBe(StatusCodes.OK);
    const data = await response.json();
    expect(data).toBeDefined();
    composeId = data.id;
  });

  it('should not be able to delete the current job', async () => {
    const response = await fetch(
      `http://localhost/api/image-builder-composer/v2/compose/${composeId}`,
      {
        unix: socket,
        method: 'DELETE',
      },
    );
    expect(response.status).toBe(StatusCodes.FORBIDDEN);
  });

  it('should have the compose item in the list of composes', async () => {
    const response = await fetch(
      'http://localhost/api/image-builder-composer/v2/composes',
      {
        unix: socket,
        method: 'GET',
      },
    );
    expect(response.status).toBe(StatusCodes.OK);
    const { data: composes } = await response.json();
    expect(composes).toBeDefined();
    expect(composes.some((c: Compose) => c.id === composeId)).toBeTrue();
  });

  it('should complete the manifest build', async () => {
    let status = 'pending';
    while (true) {
      const response = await fetch(
        `http://localhost/api/image-builder-composer/v2/composes/${composeId}`,
        {
          unix: socket,
          method: 'GET',
        },
      );
      expect(response.status).toBe(StatusCodes.OK);
      const { image_status: data } = await response.json();
      expect(data).toBeDefined();
      expect(data.status).toBeDefined();
      if (data.status !== 'building' && data.status !== 'pending') {
        status = data.status;
        break;
      }
      await Bun.sleep(500);
    }
    expect(status).toBe('success');
    const result = await Bun.file(
      path.join(tmp, composeId, 'manifest.json'),
    ).json();
    const expected = await Bun.file(
      // just test centos-9 for now
      path.join(__dirname, '__fixtures__', hostArch, 'centos-9.qcow2.json'),
    ).json();
    // we can just check that core pipelines are okay, since rpms and
    // sources are too volatile.
    expect(result.pipelines[0]).toMatchObject(expected.pipelines[0]);
    expect(result.pipelines[1]).toMatchObject(expected.pipelines[1]);
    expect(result.pipelines[2]).toMatchObject(expected.pipelines[2]);
    expect(result.pipelines[3]).toMatchObject(expected.pipelines[3]);
  });

  it('should delete the compose item', async () => {
    const response = await fetch(
      `http://localhost/api/image-builder-composer/v2/compose/${composeId}`,
      {
        unix: socket,
        method: 'DELETE',
      },
    );
    expect(response.status).toBe(StatusCodes.OK);
    const data = await response.json();
    expect(data).toBeDefined();
    expect(data.message).toBe('OK');
  });

  it('should no longer have the compose item in the list of composes', async () => {
    const response = await fetch(
      'http://localhost/api/image-builder-composer/v2/composes',
      {
        unix: socket,
        method: 'GET',
      },
    );
    expect(response.status).toBe(StatusCodes.OK);
    const { data: composes } = await response.json();
    expect(composes).toBeDefined();
    expect(composes.some((c: Compose) => c.id === composeId)).toBeFalse();
  });
});
