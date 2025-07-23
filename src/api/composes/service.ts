import { rmdir } from 'node:fs/promises';
import path from 'node:path';
import { v4 as uuid } from 'uuid';
import z from 'zod';

import { JobQueue } from '@app/queue';
import { ComposeRequest, Store } from '@app/types';
import { withTransaction } from '@app/utilities';
import { ClientId } from '@gen/ibcrc/zod';

import { Compose, ComposeService as Service } from './types';

export class ComposeService implements Service {
  private store: Store;
  private queue: JobQueue<ComposeRequest>;

  constructor(queue: JobQueue<ComposeRequest>, store: Store) {
    this.queue = queue;
    this.store = store;
  }

  public async composes(): Promise<Compose[]> {
    const composes = await withTransaction(() =>
      this.store.composes.allDocs({
        include_docs: true,
      }),
    );

    return composes.rows
      .map((row) => row.doc!)
      .map((compose) => {
        return {
          id: compose._id,
          client_id: 'ui' as z.infer<typeof ClientId>, // hardcoded for cockpit
          created_at: compose.created_at,
          request: compose.request!,
        };
      });
  }

  public async add(request: ComposeRequest) {
    const compose = await withTransaction(() =>
      this.store.composes.put({
        _id: uuid(),
        created_at: new Date().toISOString(),
        status: 'pending',
        request,
      }),
    );

    this.queue.enqueue({ id: compose.id, request });
    return { id: compose.id };
  }

  public async delete(id: string) {
    await withTransaction(async () => {
      const compose = await this.store.composes.get(id);
      await this.store.composes.remove(compose);
      await rmdir(path.join(this.store.path, id), { recursive: true });
    });
  }
}
