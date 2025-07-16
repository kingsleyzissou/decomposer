import { zValidator } from '@hono/zod-validator';

import { ValidationError } from '@app/errors';
import { ComposeRequest } from '@generated/zod';

export const createCompose = zValidator('json', ComposeRequest, (result) => {
  if (!result.success) {
    throw new ValidationError(result.error);
  }
});
