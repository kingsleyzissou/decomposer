import path from 'path';
import pouchdb from 'pouchdb';

import type { ComposeWithBuildStatus } from '@app/api';

type Document = {
  _id: string;
  _rev?: string;
};

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
