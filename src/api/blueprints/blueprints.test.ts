import { afterAll, describe, expect, it } from 'bun:test';
import { StatusCodes } from 'http-status-codes';
import { mkdtemp, rmdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { validate } from 'uuid';

import { blueprintRequest } from '@fixtures';
import { createTestClient } from '@mocks';

import { BlueprintRequest, Blueprints } from '.';
import { Composes } from '../composes';

describe('Blueprints handler tests', async () => {
  const tmp = await mkdtemp(path.join(tmpdir(), 'decomposer-test'));
  const client = createTestClient(tmp);

  afterAll(async () => {
    await rmdir(tmp, { recursive: true });
  });

  let newBlueprint = '';
  const updatedName = 'New Name';

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

  it('GET /blueprints/:id/composes should initially be empty', async () => {
    const res = await client.blueprints[':id'].composes.$get({
      param: { id: newBlueprint },
    });
    expect(res.status).toBe(StatusCodes.OK);
    const body = (await res.json()) as Composes;
    expect(body).not.toBeUndefined();
    expect(body.meta.count).toBe(0);
    expect(body.data).not.toBeUndefined();
    expect(body.data.length).toBe(0);
  });

  it('PUT /blueprints/:id should update the blueprint and return 200', async () => {
    const res = await client.blueprints[':id'].$put({
      param: {
        id: newBlueprint,
      },
      json: {
        ...blueprintRequest,
        name: updatedName,
      },
    });
    expect(res.status).toBe(StatusCodes.OK);
  });

  it('GET /blueprints/:id should get the blueprint with updates', async () => {
    await Bun.sleep(4);
    const res = await client.blueprints[':id'].$get({
      param: { id: newBlueprint },
    });
    expect(res.status).toBe(StatusCodes.OK);
    const body = (await res.json()) as Blueprints;
    expect(body.name).toBe(updatedName);
  });

  it('DELETE /blueprints/:id should delete a blueprint', async () => {
    await Bun.sleep(4);
    const res = await client.blueprints[':id'].$delete({
      param: { id: newBlueprint },
    });
    expect(res.status).toBe(StatusCodes.OK);
  });

  it('GET /blueprints should empty again', async () => {
    const res = await client.blueprints.$get();
    expect(res.status).toBe(StatusCodes.OK);
    const body = (await res.json()) as Blueprints;
    expect(body).not.toBeUndefined();
    expect(body.meta.count).toBe(0);
    expect(body.data).not.toBeUndefined();
    expect(body.data.length).toBe(0);
  });

  it('GET /blueprints/:id for non-existing blueprint should return 404', async () => {
    const res = await client.blueprints[':id'].$get({ param: { id: '123' } });
    expect(res.status).toBe(StatusCodes.NOT_FOUND);
  });

  it('PUT /blueprints/:id for non-existing blueprint should return 404', async () => {
    const res = await client.blueprints[':id'].$put({
      param: {
        id: '123',
      },
      json: blueprintRequest,
    });
    expect(res.status).toBe(StatusCodes.NOT_FOUND);
  });

  it('PUT /blueprints/:id with bad input blueprint should return 422', async () => {
    const res = await client.blueprints[':id'].$put({
      param: {
        id: '123',
      },
      json: {} as BlueprintRequest,
    });
    expect(res.status).toBe(StatusCodes.UNPROCESSABLE_ENTITY);
  });

  it('DELETE /blueprints/:id for non-existing blueprint should return 404', async () => {
    const res = await client.blueprints[':id'].$delete({
      param: { id: '123' },
    });
    expect(res.status).toBe(StatusCodes.NOT_FOUND);
  });
});
