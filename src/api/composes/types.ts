import type { Status } from '@app/constants';
import type { Schemas } from '@gen/decomposer';

import type { ServiceTask as Task } from '../types';

export type ComposeBuildStatus = { status: Status };
export type Compose = Schemas['ComposesResponseItem'];
export type ComposeRequest = Schemas['ComposeRequest'];
export type Composes = Schemas['ComposesResponse'];
export type ComposeId = Schemas['ComposeResponse'];
export type ComposeStatus = Schemas['ComposeStatus'];

// omit the `id` since this will be used for a pouchdb
// document. pouchdb uses `_id` as the index
export type ComposeWithBuildStatus = Omit<Compose, 'id'> & ComposeBuildStatus;

export type ComposeService = {
  all: () => Task<Compose[]>;
  add: (request: ComposeRequest) => Task<ComposeId>;
};
