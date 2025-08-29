import type { Schemas } from '@gen/ibcrc';

import type { ServiceTask as Task } from '../types';

export type Compose = Schemas['ComposesResponseItem'];
export type ComposeRequest = Schemas['ComposeRequest'];
export type Composes = Schemas['ComposesResponse'];

export type ComposeService = {
  all: () => Task<Compose[]>;
};
