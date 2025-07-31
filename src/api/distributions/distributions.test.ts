import { describe, expect, it } from 'bun:test';
import { testClient } from 'hono/testing';
import { StatusCodes } from 'http-status-codes';

import { DistributionsResponse, distributions } from '.';
import { list } from './distributions';

describe('Distribution handler tests', () => {
  const client = testClient(distributions);
  it('GET /distributions should return list of distributions', async () => {
    const res = await client.distributions.$get();
    expect(res.status).toBe(StatusCodes.OK);
    const body = (await res.json()) as DistributionsResponse;
    expect(body).toEqual(list);
  });
});
