import type { Store } from '@app/types';

import { Model } from './model';
import type { ComposeService as Service } from './types';

export class ComposeService implements Service {
  private model: Model;

  constructor(store: Store) {
    this.model = new Model(store.composes);
  }

  public async all() {
    return this.model.findAll();
  }
}
