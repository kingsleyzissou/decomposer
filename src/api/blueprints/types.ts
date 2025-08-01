import { Schemas } from '@gen/ibcrc';

import { ServiceTask as Task } from '../types';

export type Blueprint = Schemas['BlueprintItem'];
export type Blueprints = Schemas['BlueprintsResponse'];
export type BlueprintRequest = Schemas['CreateBlueprintRequest'];

// pouchdb uses `_id` instead of `id` for the primary key
// we need a mix of these two types for the db document
export type BlueprintWithRequest = Omit<Blueprint, 'id'> & BlueprintRequest;

export type BlueprintService = {
  all: () => Task<Blueprint[]>;
};
