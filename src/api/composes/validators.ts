import { zValidator } from '@hono/zod-validator';
import { parserFor } from 'true-myth-zod';

import { DatabaseError, ValidationError } from '@app/errors';
import { ComposeDocument } from '@app/types';
import { ComposeRequest, ComposesResponseItem } from '@gen/ibcrc/zod';

// The zod schema ensures that there is only one single
// image request in the image requests array, so there
// is no need to extend the validation to check for this
export const createCompose = zValidator('json', ComposeRequest, (result) => {
  if (!result.success) {
    throw new ValidationError(result.error);
  }
});

export const composesResponse = (compose: ComposeDocument) => {
  const parser = parserFor(ComposesResponseItem);

  const result = parser({ id: compose._id, ...compose });
  if (result.isErr) {
    throw new DatabaseError({
      message: 'Stored database value is invalid',
      details: result.error.issues,
    });
  }

  return result.value;
};
