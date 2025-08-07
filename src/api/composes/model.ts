import { Mutex } from 'async-mutex';
import { StatusCodes } from 'http-status-codes';
import { mkdir, rmdir } from 'node:fs/promises';
import path from 'node:path';
import * as Task from 'true-myth/task';
import { v4 as uuid } from 'uuid';

import { Status } from '@app/constants';
import { AppError, withAppError } from '@app/errors';
import { ComposeDocument } from '@app/store';
import { ComposesResponseItem } from '@gen/ibcrc/zod';

import { Compose, ComposeRequest } from './types';

export class Model {
  private db: PouchDB.Database<ComposeDocument>;
  private store: string;
  private mutex: Mutex;

  constructor(store: string, db: PouchDB.Database<ComposeDocument>) {
    this.db = db;
    this.store = store;
    this.mutex = new Mutex();
  }

  async create(request: ComposeRequest) {
    return Task.tryOrElse(withAppError, async () => {
      const id = uuid();
      await mkdir(path.join(this.store, id), { recursive: true });
      return this.db.put({
        _id: id,
        created_at: new Date().toISOString(),
        status: Status.PENDING,
        request,
      });
    });
  }

  async findAll() {
    return Task.tryOrElse(withAppError, async (): Promise<Compose[]> => {
      const docs = await this.db.allDocs({
        include_docs: true,
      });

      return docs.rows
        .map((row) => row.doc!)
        .map((compose: ComposeDocument) => {
          const parsed = ComposesResponseItem.safeParse({
            id: compose._id,
            ...compose,
          });

          if (!parsed.success) {
            throw new AppError({
              code: StatusCodes.INTERNAL_SERVER_ERROR,
              message:
                'Unable to retrieve compose: stored compose data is invalid',
              details: parsed.error.issues,
            });
          }

          return parsed.data;
        });
    });
  }

  async findById(id: string) {
    return Task.tryOrElse(withAppError, () => this.db.get(id));
  }

  async update(id: string, changes: Partial<ComposeDocument>) {
    return Task.tryOrElse(withAppError, async () => {
      const compose = await this.findById(id);
      if (compose.isErr) {
        throw compose.error;
      }

      await this.mutex.runExclusive(async () => {
        await this.db.put({
          ...compose.value,
          ...changes,
        });
      });
    });
  }

  async delete(id: string) {
    return Task.tryOrElse(withAppError, async () => {
      const compose = await this.db.get(id);

      await this.mutex.runExclusive(async () => {
        await this.db.remove(compose);
        await rmdir(path.join(this.store, id), { recursive: true });
      });
    });
  }
}
