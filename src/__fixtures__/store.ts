import pouchdb from 'pouchdb';
import memoryAdapter from 'pouchdb-adapter-memory';

import type { ComposeDocument } from '@app/store';

pouchdb.plugin(memoryAdapter);

const options = {
  adapter: 'memory',
};

export const createTestStore = (store: string) => {
  const composes: PouchDB.Database<ComposeDocument> = new pouchdb(
    'composes',
    options,
  );

  return {
    path: store,
    composes,
  };
};
