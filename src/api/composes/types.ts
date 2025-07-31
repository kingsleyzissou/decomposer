import { Result } from 'true-myth/result';

import { DatabaseError } from '@app/errors';
import { ComposeDoc } from '@app/store';
import { Schemas } from '@gen/ibcrc';

export type Compose = Schemas['ComposesResponseItem'];
export type ComposeRequest = Schemas['ComposeRequest'];
export type Composes = Schemas['ComposesResponse'];
export type ComposeId = Schemas['ComposeResponse'];
export type ComposeStatus = Schemas['ComposeStatus'];

type ServiceTask<T> = Promise<Result<T, DatabaseError>>;

export type ComposeService = {
  composes: () => ServiceTask<Compose[]>;
  add: (request: ComposeRequest) => ServiceTask<ComposeId>;
  get: (id: string) => ServiceTask<ComposeDoc>;
  update: (id: string, changes: ComposeDoc) => ServiceTask<void>;
  delete: (id: string) => ServiceTask<unknown>;
};
