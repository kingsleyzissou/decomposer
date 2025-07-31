import { describe, expect, it } from 'bun:test';
import { Hono } from 'hono';
import { testClient } from 'hono/testing';
import { StatusCodes } from 'http-status-codes';

import { ibcliList } from '@app/__mocks__/ibcliList';
import { AppContext } from '@app/types';

import { distributions } from '.';
import { list } from './distribution-list';
import { DistributionService } from './service';
import { ArchitecturesResponse, DistributionsResponse } from './types';

export const KNOWN_IMAGE_TYPES = [
  'aws',
  'azure',
  'gcp',
  'guest-image',
  'image-installer',
  'oci',
  'vsphere',
  'vsphere-ova',
  'wsl',
];

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
    const body = (await res.json()) as DistributionsResponse;
    expect(body).toEqual(list);
  });

  it('GET /architectures/:distribution should return list of available image types for fedora-42', async () => {
    const res = await client.architectures[':distribution'].$get({
      param: { distribution: 'fedora-42' },
    });
    expect(res.status).toBe(StatusCodes.OK);
    const body = (await res.json()) as ArchitecturesResponse;
    body.forEach((type) => {
      // arm only has a subset of image types, so just check for that
      expect(type.image_types).toContainAnyValues(KNOWN_IMAGE_TYPES);
    });
  });

  it('GET /architectures/:distribution should return list of available image types for rhel-9.6', async () => {
    const res = await client.architectures[':distribution'].$get({
      param: { distribution: 'rhel-9.6' },
    });
    expect(res.status).toBe(StatusCodes.OK);
    const body = (await res.json()) as ArchitecturesResponse;
    body.forEach((type) => {
      // arm only has a subset of image types, so just check for that
      expect(type.image_types).toContainAnyValues(KNOWN_IMAGE_TYPES);
    });
  });

  it('GET /architectures/:distribution should return list of available image types for rhel-10.0', async () => {
    const res = await client.architectures[':distribution'].$get({
      param: { distribution: 'rhel-10.0' },
    });
    expect(res.status).toBe(StatusCodes.OK);
    const body = (await res.json()) as ArchitecturesResponse;
    body.forEach((type) => {
      // arm only has a subset of image types, so just check for that
      expect(type.image_types).toContainAnyValues(KNOWN_IMAGE_TYPES);
    });
  });
});
