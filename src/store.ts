import path from 'path';
import pouchdb from 'pouchdb';

import { ComposeWithBuildStatus } from '@app/api/composes';

type Document = {
  _id: string;
  _rev?: string;
};

// pouchdb uses `_id` instead of `id` for the primary key
// we also want to keep track of the compose status in the document,
// so we add that type too
export type ComposeDocument = Document & ComposeWithBuildStatus;

export type Store = {
  path: string;
  composes: PouchDB.Database<ComposeDocument>;
};

export const createStore = (store: string) => {
  const composesPath = path.join(store, 'composes');
  const composesStore: PouchDB.Database<ComposeDocument> = new pouchdb(
    composesPath,
  );
  return {
    path: store,
    composes: composesStore,
  };
};
