import type { Schemas } from '@gen/ibcrc';

import type { ServiceTask as Task } from '../types';

export type Compose = Schemas['ComposesResponseItem'];
export type ComposeRequest = Schemas['ComposeRequest'];
export type Composes = Schemas['ComposesResponse'];
export type ComposeId = Schemas['ComposeResponse'];

export type ComposeService = {
  all: () => Task<Compose[]>;
  add: (request: ComposeRequest) => Task<ComposeId>;
};
