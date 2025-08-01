import * as Task from 'true-myth/task';
import { v4 as uuid } from 'uuid';

import { withDatabaseError } from '@app/errors';
import { BlueprintDocument, Store } from '@app/store';
import { resolve } from '@app/utilities';

import {
  Blueprint,
  CreateBlueprintRequest,
  BlueprintService as Service,
} from './types';

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

  async add(request: CreateBlueprintRequest) {
    const id = uuid();
    const task = Task.fromPromise(
      this.store.blueprints.put({
        _id: id,
        name: request.name,
        description: request.description,
        distribution: request.distribution,
        image_requests: request.image_requests,
        customizations: request.customizations,
        last_modified_at: new Date().toISOString(),
        version: 1,
      }),
    );

    return await task.mapRejected(withDatabaseError).map(() => ({ id }));
  }

  public async get(id: string) {
    const task = Task.fromPromise(this.store.blueprints.get(id));

    return await task.mapRejected(withDatabaseError).map((blueprint) => {
      return {
        id: blueprint.id,
        name: blueprint.name,
        version: blueprint.version,
        description: blueprint.description,
        last_modified_at: blueprint.last_modified_at,
      } as Blueprint;
    });
  }

  public async delete(id: string) {
    const task = Task.fromPromise(
      resolve(async () => {
        const blueprint = await this.store.blueprints.get(id);
        await this.store.blueprints.remove(blueprint);
      }),
    );

    return await task.mapRejected(withDatabaseError);
  }
}
