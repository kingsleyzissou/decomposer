import { describe, expect, it } from 'bun:test';

import { SCHEMA_PATH } from '@app/constants';
import { router } from '@app/router';

describe('Server test', () => {
  it('/readiness should return 200 Response', async () => {
    const res = await router.request('readiness');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      readiness: 'ready',
    });
  });

  it('/openapi.json should return 200 Response', async () => {
    const schema = await Bun.file(SCHEMA_PATH).json();
    const res = await router.request('openapi.json');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(schema);
  });
});
