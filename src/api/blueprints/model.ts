import * as Task from 'true-myth/task';
import { v4 as uuid } from 'uuid';

import { withAppError } from '@app/errors';
import { BlueprintDocument } from '@app/store';

import { Blueprint, BlueprintRequest } from './types';
import * as validators from './validators';

export class Model {
  private store: PouchDB.Database<BlueprintDocument>;

  constructor(store: PouchDB.Database<BlueprintDocument>) {
    this.store = store;
  }

  async create(request: BlueprintRequest) {
    return Task.tryOrElse(withAppError, async () => {
      const id = uuid();
      return this.store.put({
        _id: id,
        name: request.name,
        description: request.description,
        distribution: request.distribution,
        image_requests: request.image_requests,
        customizations: request.customizations,
        last_modified_at: new Date().toISOString(),
        version: 1,
      });
    });
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
