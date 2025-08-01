import * as Task from 'true-myth/task';

import { withDatabaseError } from '@app/errors';
import { BlueprintDocument, Store } from '@app/store';

import { Blueprint, BlueprintService as Service } from './types';

export class BlueprintService implements Service {
  private store: Store;

  constructor(store: Store) {
    this.store = store;
  }

  async all() {
    const task = Task.fromPromise(
      this.store.blueprints.allDocs({
        include_docs: true,
      }),
    );

    return await task.mapRejected(withDatabaseError).map((blueprints) => {
      return blueprints.rows
        .map((row) => row.doc!)
        .map((blueprint: BlueprintDocument) => {
          return {
            id: blueprint._id,
            name: blueprint.name,
            version: blueprint.version,
            description: blueprint.description,
            last_modified_at: blueprint.last_modified_at,
          } as Blueprint;
        });
    });
  }
}
