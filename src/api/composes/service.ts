import { StatusCodes } from 'http-status-codes';
import { rmdir } from 'node:fs/promises';
import path from 'node:path';
import { v4 as uuid } from 'uuid';
import z from 'zod';

import { AppError } from '@app/errors';
import { JobQueue } from '@app/queue';
import {
  ComposeDoc,
  ComposeRequest,
  JobMessage,
  Status,
  Store,
} from '@app/types';
import { withMutex, withTransaction } from '@app/utilities';
import { ClientId } from '@gen/ibcrc/zod';

import { Compose, ComposeService as Service } from './types';

export class ComposeService implements Service {
  private store: Store;
  private queue: JobQueue<ComposeRequest>;

  constructor(queue: JobQueue<ComposeRequest>, store: Store) {
    this.queue = queue;
    this.store = store;
    this.queue.events.on('message', async ({ data }: JobMessage) => {
      await this.update(data.id, { status: data.result } as ComposeDoc);
    });
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
        status: Status.PENDING,
        request,
      }),
    );

    this.queue.enqueue({ id: compose.id, request });
    return { id: compose.id };
  }

  public async get(id: string) {
    return await withTransaction(async () => {
      return await this.store.composes.get(id);
    });
  }

  public async delete(id: string) {
    if (this.queue.isCurrent(id)) {
      throw new AppError({
        code: StatusCodes.FORBIDDEN,
        message: 'Job is in progress, it cannot be deleted.',
      });
    }
    this.queue.remove(id);
    await withTransaction(() =>
      withMutex(id, async () => {
        const compose = await this.store.composes.get(id);
        await this.store.composes.remove(compose);
        await rmdir(path.join(this.store.path, id), { recursive: true });
      }),
    );
  }

  public async update(id: string, changes: ComposeDoc) {
    await withTransaction(() =>
      withMutex(id, async () => {
        const compose = await this.store.composes.get(id);
        await this.store.composes.put({
          ...compose,
          ...changes,
        });
      }),
    );
  }
}
