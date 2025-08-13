import pouchdb from 'pouchdb';
import memoryAdapter from 'pouchdb-adapter-memory';

import type { BlueprintDocument, ComposeDocument } from '@app/store';

pouchdb.plugin(memoryAdapter);

export const createTestStore = (store: string) => {
  const options = {
    adapter: 'memory',
  };

  const composes: PouchDB.Database<ComposeDocument> = new pouchdb(
    'composes',
    options,
  );

  const blueprints: PouchDB.Database<BlueprintDocument> = new pouchdb(
    'blueprints',
    options,
  );

  return {
    path: store,
    composes,
    blueprints,
  };
};
