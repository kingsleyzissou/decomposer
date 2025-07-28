import { describe, expect, it } from 'bun:test';
import { Hono } from 'hono';
import { StatusCodes } from 'http-status-codes';
import z from 'zod';

import { AppError, ValidationError, notFound, onError } from '@app/errors';

const setup = () => {
  return new Hono()
    .get('/app-error-no-code', () => {
      throw new AppError({
        message: 'App error with no status code',
        details: ['something unexpected happened'],
      });
    })
    .get('/app-error-with-code', () => {
      throw new AppError({
        code: StatusCodes.UNAUTHORIZED,
        message: 'App error with status code',
        details: ['something unexpected happened'],
      });
    })
    .get('/unexpected-error', () => {
      throw new Error('something very unexpected happened');
    })
    .get('/validation-error', async () => {
      const schema = z.object({
        willError: z.boolean(),
      });
      const res = schema.safeParse('hello');
      // @ts-expect-error this should error out
      throw new ValidationError(res.error);
    })
    .notFound(notFound)
    .onError(onError);
};

describe('Test error handling', () => {
  const router = setup();

  it('/badroute should return 404 Response', async () => {
    const res = await router.request('/badroute');
    expect(res.status).toBe(StatusCodes.NOT_FOUND);
    expect(await res.json()).toEqual({
      code: StatusCodes.NOT_FOUND,
      message: `Path not found!`,
      details: [`The path '/badroute' does not exist`],
    });
  });

  it('app error with no code should default to 500', async () => {
    const res = await router.request('/app-error-no-code');
    expect(res.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(await res.json()).toEqual({
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      message: 'App error with no status code',
      details: ['something unexpected happened'],
    });
  });

  it('app error with code should use correct code', async () => {
    const res = await router.request('/app-error-with-code');
    expect(res.status).toBe(StatusCodes.UNAUTHORIZED);
    expect(await res.json()).toEqual({
      code: StatusCodes.UNAUTHORIZED,
      message: 'App error with status code',
      details: ['something unexpected happened'],
    });
  });

  it('unexpected error should still be caught', async () => {
    const res = await router.request('/unexpected-error');
    expect(res.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(await res.json()).toEqual({
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      message: 'something very unexpected happened',
    });
  });

  it('validation error should be handled', async () => {
    const res = await router.request('/validation-error');
    expect(res.status).toBe(StatusCodes.UNPROCESSABLE_ENTITY);
    expect(await res.json()).toEqual({
      code: StatusCodes.UNPROCESSABLE_ENTITY,
      details: [
        {
          code: 'invalid_type',
          expected: 'object',
          message: 'Invalid input: expected object, received string',
          path: [],
        },
      ],
      message: 'Validation failed',
    });
  });
});
