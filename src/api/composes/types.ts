import { Status } from '@app/constants';
import { ComposeDocument } from '@app/store';
import { type Schemas } from '@gen/ibcrc';

import { ServiceTask as Task } from '../types';

export type ComposeBuildStatus = { status: Status };
export type Compose = Schemas['ComposesResponseItem'];
export type ComposeRequest = Schemas['ComposeRequest'];
export type Composes = Schemas['ComposesResponse'];
export type ComposeId = Schemas['ComposeResponse'];
export type ComposeStatus = Schemas['ComposeStatus'];

export type ComposeWithBuildStatus = Omit<Compose, 'id'> & ComposeBuildStatus;

export type ComposeService = {
  composes: () => Task<Compose[]>;
  add: (request: ComposeRequest) => Task<ComposeId>;
  status: (id: string) => Task<ComposeStatus>;
  update: (id: string, changes: Partial<ComposeDocument>) => Task<void>;
  delete: (id: string) => Task<unknown>;
};
