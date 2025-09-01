import { Mutex } from 'async-mutex';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import * as Task from 'true-myth/task';
import { v4 as uuid } from 'uuid';

import { Status } from '@app/constants';
import { normalizeError } from '@app/errors';
import type { ComposeDocument, Store } from '@app/store';

import type { Compose, ComposeRequest } from './types';
import * as validators from './validators';

export class Model {
  private store: Store;
  private mutex: Mutex;

  constructor(store: Store) {
    this.store = store;
    this.mutex = new Mutex();
  }

  async create(request: ComposeRequest) {
    return Task.tryOrElse(normalizeError, async () => {
      const id = uuid();
      await mkdir(path.join(this.store.path, id), { recursive: true });
      await this.store.composes.put({
        _id: id,
        created_at: new Date().toISOString(),
        status: Status.PENDING,
        request,
      });

      return { id };
    });
  }

  async findAll() {
    return Task.tryOrElse(normalizeError, async (): Promise<Compose[]> => {
      const docs = await this.store.composes.allDocs({
        include_docs: true,
      });

      return docs.rows.map((row) => row.doc!).map(validators.composesResponse);
    });
  }

  async findById(id: string) {
    return Task.tryOrElse(normalizeError, () => this.store.composes.get(id));
  }

  async update(id: string, changes: Partial<ComposeDocument>) {
    return Task.tryOrElse(normalizeError, async () => {
      return this.mutex.runExclusive(async () => {
        const compose = await this.store.composes.get(id);
        await this.store.composes.put({
          ...compose,
          ...changes,
        });

        return { id };
      });
    });
  }
}
