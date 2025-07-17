import { zValidator } from '@hono/zod-validator';

import { ValidationError } from '@app/errors';
import { ComposeRequest } from '@gen/ibcrc/zod';

export const createCompose = zValidator('json', ComposeRequest, (result) => {
  if (!result.success) {
    throw new ValidationError(result.error);
  }
});
