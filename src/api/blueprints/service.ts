import { Store } from '@app/store';

import { Model } from './model';
import { BlueprintRequest, BlueprintService as Service } from './types';

export class BlueprintService implements Service {
  private model: Model;

  constructor(store: Store) {
    this.model = new Model(store.blueprints);
  }

  public async all() {
    return this.model.findAll();
  }

  public async add(request: BlueprintRequest) {
    const result = await this.model.create(request);

    return result.map(({ id }) => ({ id }));
  }

  public async get(id: string) {
    const result = await this.model.findById(id);

    return result.map((blueprint) => ({
      id: blueprint._id,
      name: blueprint.name,
      version: blueprint.version,
      description: blueprint.description,
      last_modified_at: blueprint.last_modified_at,
    }));
  }
}
