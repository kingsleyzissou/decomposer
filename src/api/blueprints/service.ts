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
}
