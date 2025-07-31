import { describe, expect, it } from 'bun:test';
import { Hono } from 'hono';
import { testClient } from 'hono/testing';
import { StatusCodes } from 'http-status-codes';
import z from 'zod';

import { AppContext } from '@app/types';
import { ImageTypes } from '@gen/ibcrc/zod';

import { ibcliList } from '@mocks';

import { distributions } from '.';
import { list } from './distribution-list';
import { DistributionService } from './service';
import { Architectures, Distributions } from './types';

// this is just a zod helper so we can parse the whole list
// of image types in one go and ensure that they are okay
const SupportedImageTypes = z.array(ImageTypes);

const createTestClient = () => {
  const service = new DistributionService(ibcliList);
  return testClient(
    new Hono<AppContext>()
      .use(async (ctx, next) => {
        // @ts-expect-error we don't need to set
        // the compose service here for testing
        ctx.set('services', {
          distribution: service,
        });
        await next();
      })
      .route('/', distributions),
  );
};

describe('Distribution handler tests', async () => {
  const client = createTestClient();

  it('GET /distributions should return list of distributions', async () => {
    const res = await client.distributions.$get();
    expect(res.status).toBe(StatusCodes.OK);
    const body = (await res.json()) as Distributions;
    expect(body).toEqual(list);
  });

  it('GET /architectures/:distribution should return list of available image types for fedora-42', async () => {
    const res = await client.architectures[':distribution'].$get({
      param: { distribution: 'fedora-42' },
    });
    expect(res.status).toBe(StatusCodes.OK);
    const body = (await res.json()) as Architectures;
    body.forEach((type) => {
      const result = SupportedImageTypes.safeParse(type.image_types);
      expect(result.success).toBeTrue();
    });
  });

  it('GET /architectures/:distribution should return list of available image types for rhel-9.6', async () => {
    const res = await client.architectures[':distribution'].$get({
      param: { distribution: 'rhel-9.6' },
    });
    expect(res.status).toBe(StatusCodes.OK);
    const body = (await res.json()) as Architectures;
    body.forEach((type) => {
      const result = SupportedImageTypes.safeParse(type.image_types);
      expect(result.success).toBeTrue();
    });
  });

  it('GET /architectures/:distribution should return list of available image types for rhel-10.0', async () => {
    const res = await client.architectures[':distribution'].$get({
      param: { distribution: 'rhel-10.0' },
    });
    expect(res.status).toBe(StatusCodes.OK);
    const body = (await res.json()) as Architectures;
    body.forEach((type) => {
      const result = SupportedImageTypes.safeParse(type.image_types);
      expect(result.success).toBeTrue();
    });
  });
});
