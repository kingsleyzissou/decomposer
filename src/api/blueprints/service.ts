import { Store } from '@app/store';

import { Model } from './model';
import { BlueprintService as Service } from './types';

export class BlueprintService implements Service {
  private model: Model;

  constructor(store: Store) {
    this.model = new Model(store.blueprints);
  }

  public async all() {
    return this.model.findAll();
  }
}
