import { ComposeDoc } from '@app/types';

export const withDefaults = (compose: ComposeDoc, defaults: ComposeDoc) => {
  const { _id: id } = compose;
  return {
    id,
    ...defaults,
    ...compose,
  };
};
