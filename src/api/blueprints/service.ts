import { Result } from 'true-myth/result';

import type { Store } from '@app/store';

import type { ComposeRequest, ComposeService } from '../composes';
import { Model } from './model';
import type {
  BlueprintBody,
  BlueprintRequest,
  BlueprintService as Service,
} from './types';

export class BlueprintService implements Service {
  private model: Model;
  private composer: ComposeService;

  constructor(store: Store, composer: ComposeService) {
    this.model = new Model(store.blueprints);
    this.composer = composer;
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
      description: blueprint.description ?? '',
      last_modified_at: blueprint.last_modified_at,
    }));
  }

  public async update(id: string, changes: BlueprintRequest) {
    return this.model.update(id, changes);
  }

  public async delete(id: string) {
    return this.model.delete(id);
  }

  public async compose(id: string, body?: BlueprintBody) {
    const blueprint = await this.model.findById(id, body);
    if (blueprint.isErr) {
      return Result.err(blueprint.error);
    }

    // the compose request is basically just a subset
    // of the blueprint, so this is okay
    const cr: ComposeRequest = {
      ...blueprint.value,
      client_id: 'ui',
    };

    const result = await this.composer.add(cr, id);
    return result.map(({ id }) => ({ id }));
  }
}
