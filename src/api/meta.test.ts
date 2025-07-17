import { describe, expect, it } from 'bun:test';
import { testClient } from 'hono/testing';
import { StatusCodes } from 'http-status-codes';

import { schema } from '@gen/ibcrc';

import { meta } from './meta';

describe('Meta handler tests', () => {
  const client = testClient(meta);
  it('GET /ready should return 200 Response', async () => {
    const res = await client.ready.$get();
    expect(res.status).toBe(StatusCodes.OK);
    expect(await res.json()).toEqual({
      readiness: 'ready',
    });
  });

  it('GET /openapi.json should return 200 Response', async () => {
    const res = await client['openapi.json'].$get();
    expect(res.status).toBe(StatusCodes.OK);
    expect(await res.json()).toEqual(schema);
  });
});
