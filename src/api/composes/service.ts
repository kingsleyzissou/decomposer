import { StatusCodes } from 'http-status-codes';
import { rmdir } from 'node:fs/promises';
import path from 'node:path';
import { Result } from 'true-myth';
import * as Task from 'true-myth/task';
import { v4 as uuid } from 'uuid';
import z from 'zod';

import { AppError, withDatabaseError } from '@app/errors';
import { JobQueue } from '@app/queue';
import {
  ComposeDoc,
  ComposeRequest,
  JobMessage,
  Status,
  Store,
} from '@app/types';
import { withMutex } from '@app/utilities';
import { ClientId } from '@gen/ibcrc/zod';

import { ComposeService as Service } from './types';

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

  public async composes() {
    const task = Task.fromPromise(
      this.store.composes.allDocs({
        include_docs: true,
      }),
    );

    return await task.mapRejected(withDatabaseError).map((composes) => {
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
    });
  }

  public async add(request: ComposeRequest) {
    const task = Task.fromPromise(
      this.store.composes.put({
        _id: uuid(),
        created_at: new Date().toISOString(),
        status: Status.PENDING,
        request,
      }),
    );

    return await task.mapRejected(withDatabaseError).map((compose) => {
      this.queue.enqueue({ id: compose.id, request });
      return { id: compose.id };
    });
  }

  public async get(id: string) {
    const task = Task.fromPromise(this.store.composes.get(id));

    return await task.mapRejected(withDatabaseError);
  }

  public async delete(id: string) {
    if (this.queue.isCurrent(id)) {
      return Result.err(
        new AppError({
          code: StatusCodes.FORBIDDEN,
          message: 'Job is in progress & it cannot be deleted.',
        }),
      );
    }
    this.queue.remove(id);
    const task = Task.fromPromise(
      withMutex(id, async () => {
        const compose = await this.store.composes.get(id);
        await this.store.composes.remove(compose);
        await rmdir(path.join(this.store.path, id), { recursive: true });
      }),
    );
    // This is okay since the withDatabaseError will fall back onto
    // the default AppError type if there is a fs error
    return await task.mapRejected(withDatabaseError);
  }

  public async update(id: string, changes: ComposeDoc) {
    const task = Task.fromPromise(
      withMutex(id, async () => {
        const compose = await this.store.composes.get(id);
        await this.store.composes.put({
          ...compose,
          ...changes,
        });
      }),
    );

    return await task.mapRejected(withDatabaseError);
  }
}
