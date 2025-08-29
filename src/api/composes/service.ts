import type { JobQueue } from '@app/queue';
import type { Store } from '@app/types';

import { Model } from './model';
import type { ComposeRequest, ComposeService as Service } from './types';

export class ComposeService implements Service {
  private model: Model;
  private queue: JobQueue<ComposeRequest>;

  constructor(queue: JobQueue<ComposeRequest>, store: Store) {
    this.queue = queue;
    this.model = new Model(store);
  }

  public async all() {
    return this.model.findAll();
  }

  public async add(request: ComposeRequest) {
    const result = await this.model.create(request);

    return result.map(({ id }) => {
      this.queue.enqueue({ id, request });
      return { id };
    });
  }
}
