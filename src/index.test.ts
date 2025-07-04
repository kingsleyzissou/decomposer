import { describe, expect, it } from 'bun:test';
import { testClient } from 'hono/testing';

import { router } from './router';

describe('Server test', () => {
  const client = testClient(router);

  it('/health should return 200 Response', async () => {
    // @ts-expect-error the client is typed so this is valid
    const res = await client.health.$get();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      message: 'OK',
      ok: true,
    });
  });

  it('/badroute should return 404 Response', async () => {
    // @ts-expect-error the client is typed so this is valid
    const res = await client.badroute.$get();
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({
      message: 'Not Found',
      ok: false,
    });
  });
});
