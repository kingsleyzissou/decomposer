import type { JobQueue } from '@app/queue';
import type { ComposeDocument, JobResult, Store } from '@app/types';

import { Model } from './model';
import type { ComposeRequest, ComposeService as Service } from './types';

export class ComposeService implements Service {
  private model: Model;
  private queue: JobQueue<ComposeRequest>;

  constructor(queue: JobQueue<ComposeRequest>, store: Store) {
    this.queue = queue;
    this.model = new Model(store);
    this.queue.events.on('message', async ({ data }: JobResult) => {
      await this.update(data.id, { status: data.result });
    });
  }

  public async all() {
    return this.model.findAll();
  }

  public async status(id: string) {
    const result = await this.model.findById(id);

    return result.map((compose) => {
      return {
        request: compose.request as ComposeRequest,
        image_status: {
          status: compose.status,
        },
      };
    });
  }

  public async add(request: ComposeRequest) {
    const result = await this.model.create(request);

    return result.map(({ id }) => {
      this.queue.enqueue({ id, request });
      return { id };
    });
  }

  public async update(id: string, changes: Partial<ComposeDocument>) {
    return this.model.update(id, changes);
  }
}
