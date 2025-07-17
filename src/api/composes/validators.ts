import { zValidator } from '@hono/zod-validator';

import { ValidationError } from '@app/errors';
import { ComposeRequest } from '@gen/ibcrc/zod';

// The zod schema ensures that there is only one single
// image request in the image requests array, so there
// is no need to extend the validation to check for this
export const createCompose = zValidator('json', ComposeRequest, (result) => {
  if (!result.success) {
    throw new ValidationError(result.error);
  }
});
