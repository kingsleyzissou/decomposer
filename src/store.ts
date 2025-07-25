import path from 'path';
import pouchdb from 'pouchdb';

import { ComposeDoc } from '@app/types';

export const createStore = (store: string) => {
  const composesPath = path.join(store, 'composes');
  const composesStore: PouchDB.Database<ComposeDoc> = new pouchdb(composesPath);
  return {
    composes: composesStore,
  };
};
