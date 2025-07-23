import pouchdb from 'pouchdb';
import memoryAdapter from 'pouchdb-adapter-memory';

import { ComposeDoc } from '@app/types';

pouchdb.plugin(memoryAdapter);

export const createTestStore = () => {
  const composesStore: PouchDB.Database<ComposeDoc> = new pouchdb('composes', {
    adapter: 'memory',
  });
  return {
    composes: composesStore,
  };
};
