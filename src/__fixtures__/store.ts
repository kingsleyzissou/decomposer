import pouchdb from 'pouchdb';
import memoryAdapter from 'pouchdb-adapter-memory';

import { ComposeDocument, Store } from '@app/store';

pouchdb.plugin(memoryAdapter);

export const createTestStore = (
  store: string,
  key: 'blueprints' | 'composes',
) => {
  const memoryStore: PouchDB.Database<ComposeDocument> = new pouchdb(key, {
    adapter: 'memory',
  });

  // type casting the store is okay here
  // since we are only interested in a subset
  // of the store
  return {
    path: store,
    [key]: memoryStore,
  } as unknown as Store;
};
