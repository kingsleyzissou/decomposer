import * as Task from 'true-myth/task';

import { withAppError } from '@app/errors';
import { BlueprintDocument } from '@app/store';

import { Blueprint } from './types';
import * as validators from './validators';

export class Model {
  private store: PouchDB.Database<BlueprintDocument>;

  constructor(store: PouchDB.Database<BlueprintDocument>) {
    this.store = store;
  }

  async findAll() {
    return Task.tryOrElse(withAppError, async (): Promise<Blueprint[]> => {
      const docs = await this.store.allDocs({
        include_docs: true,
      });

      return docs.rows.map((row) => row.doc!).map(validators.blueprintResponse);
    });
  }
}
