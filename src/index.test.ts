import { describe, expect, it } from 'bun:test';
import { testClient } from 'hono/testing';

import { app } from './app';

describe('Server test', () => {
  const client = testClient(app);

  it('/health should return 200 Response', async () => {
    const res = await client.health.$get();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      message: 'OK',
      ok: true,
    });
  });
});
