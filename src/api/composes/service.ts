import { Mutex } from 'async-mutex';
import { StatusCodes } from 'http-status-codes';
import { rmdir } from 'node:fs/promises';
import path from 'node:path';
import { Result } from 'true-myth';
import * as Task from 'true-myth/task';
import { v4 as uuid } from 'uuid';

import { Status } from '@app/constants';
import { AppError, withDatabaseError } from '@app/errors';
import { JobQueue } from '@app/queue';
import { ComposeDocument, JobResult, Store } from '@app/types';
import { resolve } from '@app/utilities';

import { Compose, ComposeRequest, ComposeService as Service } from './types';

export class ComposeService implements Service {
  private store: Store;
  private queue: JobQueue<ComposeRequest>;
  private mutex: Mutex;

  constructor(queue: JobQueue<ComposeRequest>, store: Store) {
    this.queue = queue;
    this.store = store;
    this.mutex = new Mutex();
    this.queue.events.on('message', async ({ data }: JobResult) => {
      await this.update(data.id, { status: data.result });
    });
  }

  public async composes() {
    const task = Task.fromPromise(
      this.store.composes.allDocs({
        include_docs: true,
      }),
    );

    return task.mapRejected(withDatabaseError).map((composes) => {
      return composes.rows
        .map((row) => row.doc!)
        .map((compose: ComposeDocument) => {
          return {
            id: compose._id,
            request: compose.request,
            client_id: compose.client_id,
            created_at: compose.created_at,
          } as Compose;
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

    return task.mapRejected(withDatabaseError).map((compose) => {
      this.queue.enqueue({ id: compose.id, request });
      return { id: compose.id };
    });
  }

  public async status(id: string) {
    const task = Task.fromPromise(this.store.composes.get(id));

    return task.mapRejected(withDatabaseError).map((compose) => {
      return {
        request: compose.request as ComposeRequest,
        image_status: {
          status: compose.status,
        },
      };
    });
  }

  public async delete(id: string) {
    if (this.queue.isCurrent(id)) {
      return Result.err(
        new AppError({
          code: StatusCodes.FORBIDDEN,
          message: 'Job is in progress, it cannot be deleted.',
        }),
      );
    }
    this.queue.remove(id);
    const task = Task.fromPromise(
      resolve(async () => {
        await this.mutex.runExclusive(async () => {
          const compose = await this.store.composes.get(id);
          await this.store.composes.remove(compose);
          await rmdir(path.join(this.store.path, id), { recursive: true });
        });
      }),
    );

    return task.mapRejected(withDatabaseError);
  }

  public async update(id: string, changes: Partial<ComposeDocument>) {
    const task = Task.fromPromise(
      resolve(async () => {
        await this.mutex.runExclusive(async () => {
          const compose = await this.store.composes.get(id);
          await this.store.composes.put({
            ...compose,
            ...changes,
          });
        });
      }),
    );

    return task.mapRejected(withDatabaseError);
  }
}
