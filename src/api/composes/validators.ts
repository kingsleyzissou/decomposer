import { parserFor } from 'true-myth-zod';

import { DatabaseError } from '@app/errors';
import type { ComposeDocument } from '@app/types';
import { ComposesResponseItem } from '@gen/ibcrc/zod';

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
