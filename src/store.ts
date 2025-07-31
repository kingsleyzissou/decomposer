import path from 'path';
import pouchdb from 'pouchdb';

import { ComposeRequest } from '@app/api/composes';
import { Status } from '@app/constants';

export type ComposeDoc = {
  _id: string;
  _rev?: string;
  created_at: string;
  status: Status;
  request?: ComposeRequest;
};

export type Store = {
  path: string;
  composes: PouchDB.Database<ComposeDoc>;
};

export const createStore = (store: string) => {
  const composesPath = path.join(store, 'composes');
  const composesStore: PouchDB.Database<ComposeDoc> = new pouchdb(composesPath);
  return {
    path: store,
    composes: composesStore,
  };
};
