import * as Task from 'true-myth/task';

import { normalizeError } from '@app/errors';
import type { ComposeDocument } from '@app/store';

import type { Compose } from './types';
import * as validators from './validators';

export class Model {
  private store: PouchDB.Database<ComposeDocument>;

  constructor(store: PouchDB.Database<ComposeDocument>) {
    this.store = store;
  }

  async findAll() {
    return Task.tryOrElse(normalizeError, async (): Promise<Compose[]> => {
      const docs = await this.store.allDocs({
        include_docs: true,
      });

      return docs.rows.map((row) => row.doc!).map(validators.composesResponse);
    });
  }
}
