import path from 'path';
import pouchdb from 'pouchdb';

import { Blueprint, BlueprintRequest } from '@app/api/blueprints';
import { Compose, ComposeStatus } from '@app/api/composes';

type Document = {
  _id: string;
  _rev?: string;
};

// pouchdb uses `_id` instead of `id` for the primary key
// we also want to keep track of the compose status in the document,
// so we add that type too
export type ComposeDocument = Document & Omit<Compose, 'id'> & ComposeStatus;

// pouchdb uses `_id` instead of `id` for the primary key
export type BlueprintDocument = Document &
  // we need a mix of these two types for the
  // document that we save to the database
  Omit<Blueprint, 'id'> &
  BlueprintRequest;

export type Store = {
  path: string;
  composes: PouchDB.Database<ComposeDocument>;
  blueprints: PouchDB.Database<BlueprintDocument>;
};

export const createStore = (store: string) => {
  const composesStore: PouchDB.Database<ComposeDocument> = new pouchdb(
    path.join(store, 'composes'),
  );
  const blueprintsStore: PouchDB.Database<BlueprintDocument> = new pouchdb(
    path.join(store, 'blueprints'),
  );
  return {
    path: store,
    composes: composesStore,
    blueprints: blueprintsStore,
  };
};
