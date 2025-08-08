import { Mutex } from 'async-mutex';
import { mkdir, rmdir } from 'node:fs/promises';
import path from 'node:path';
import * as Task from 'true-myth/task';
import { v4 as uuid } from 'uuid';

import { Status } from '@app/constants';
import { withAppError } from '@app/errors';
import { ComposeDocument } from '@app/store';

import { Compose, ComposeRequest } from './types';
import * as validators from './validators';

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
      await this.db.put({
        _id: id,
        created_at: new Date().toISOString(),
        status: Status.PENDING,
        request,
      });

      return { id };
    });
  }

  async findAll() {
    return Task.tryOrElse(withAppError, async (): Promise<Compose[]> => {
      const docs = await this.db.allDocs({
        include_docs: true,
      });

      return docs.rows.map((row) => row.doc!).map(validators.composesResponse);
    });
  }

  async findById(id: string) {
    return Task.tryOrElse(withAppError, () => this.db.get(id));
  }

  async update(id: string, changes: Partial<ComposeDocument>) {
    return Task.tryOrElse(withAppError, async () => {
      return this.mutex.runExclusive(async () => {
        const compose = await this.db.get(id);
        await this.db.put({
          ...compose,
          ...changes,
        });

        return { id };
      });
    });
  }

  async delete(id: string) {
    return Task.tryOrElse(withAppError, async () => {
      await this.mutex.runExclusive(async () => {
        const compose = await this.db.get(id);
        await this.db.remove(compose);
        await rmdir(path.join(this.store, id), { recursive: true });
      });
    });
  }
}
