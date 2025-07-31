import { describe, expect, it } from 'bun:test';
import { $ZodError } from 'zod/v4/core';

import { blueprint, customizations, name } from '@fixtures';

import { mapHostedToOnPrem, validatedHostedToOnPrem } from '.';

describe('Test blueprint conversion', () => {
  it('should convert hosted customizations to on-prem blueprint', async () => {
    // const bp = await Bun.file('./src/__mocks__/blueprint.json').json();
    expect(mapHostedToOnPrem({ name, customizations })).toEqual(blueprint);
  });

  it('should successfully validate the converted blueprint', () => {
    const result = validatedHostedToOnPrem({ name, customizations });
    expect(result.success).toBeTrue();
    expect(result.error).toBeUndefined();
  });

  it('should return an error for invalid customizations', () => {
    const c = { hostname: 1234 };
    // @ts-expect-error this will cause an error because the types don't match
    const result = validatedHostedToOnPrem({ name, customizations: c });
    expect(result.success).not.toBeTrue();
    expect(result.error).toBeInstanceOf($ZodError);
  });
});
