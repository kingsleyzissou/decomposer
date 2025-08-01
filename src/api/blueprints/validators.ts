import { zValidator } from '@hono/zod-validator';

import { ValidationError } from '@app/errors';
import { CreateBlueprintRequest } from '@gen/ibcrc/zod';

export const createBlueprint = zValidator(
  'json',
  CreateBlueprintRequest,
  (result) => {
    if (!result.success) {
      throw new ValidationError(result.error);
    }
  },
);
