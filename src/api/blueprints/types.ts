import type { Schemas } from '@gen/ibcrc';

import type { ComposeId } from '../composes';
import type { ServiceTask as Task } from '../types';

export type BlueprintMetadata = Schemas['BlueprintItem'];
export type Blueprints = Schemas['BlueprintsResponse'];
export type BlueprintRequest = Schemas['CreateBlueprintRequest'];
export type BlueprintId = Schemas['CreateBlueprintResponse'];
export type BlueprintBody = Schemas['composeBlueprint_Body'];

// The types are a bit awkward here, we only need some of
// the return type, so let's just wrap it in a `Partial`
export type Blueprint = Partial<Schemas['BlueprintResponse']>;

// pouchdb uses `_id` instead of `id` for the primary key
// we need a mix of these two types for the db document
export type BlueprintWithRequest = Omit<BlueprintMetadata, 'id'> &
  BlueprintRequest & { version: number };

export type BlueprintService = {
  all: () => Task<BlueprintMetadata[]>;
  add: (request: BlueprintRequest) => Task<BlueprintId>;
  update: (id: string, request: BlueprintRequest) => Task<BlueprintId>;
  get: (id: string) => Task<Blueprint>;
  delete: (id: string) => Task<unknown>;
  compose: (id: string, body?: BlueprintBody) => Task<ComposeId>;
};
