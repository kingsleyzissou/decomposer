import pouchdb from 'pouchdb';
import memoryAdapter from 'pouchdb-adapter-memory';

import { ComposeDoc } from '@app/store';

pouchdb.plugin(memoryAdapter);

export const createTestStore = (store: string) => {
  const composesStore: PouchDB.Database<ComposeDoc> = new pouchdb('composes', {
    adapter: 'memory',
  });
  return {
    path: store,
    composes: composesStore,
  };
};
