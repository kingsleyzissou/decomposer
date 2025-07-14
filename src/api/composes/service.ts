import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { validate as isValidUUID, v4 as uuidv4 } from 'uuid';

import { WorkerQueue } from '@app/queue';
import { ComposeJob } from '@app/types';

import { Compose, ComposeRequest, ComposeService as Service } from './types';

export class ComposeService implements Service {
  private store: string;
  private queue: WorkerQueue<ComposeJob>;

  constructor(queue: WorkerQueue<ComposeJob>, store: string) {
    this.queue = queue;
    this.store = store;
  }

  // TODO: check for compose requests and make this
  // more complete. For the time being we can just keep
  // this simple for the POC
  public async composes(): Promise<Compose[]> {
    const items = await readdir(this.store);
    return Promise.all(
      items
        .map((item) => ({
          id: item,
          path: path.join(this.store, item),
        }))
        .filter(async (item) => {
          const stat = await Bun.file(item.path).stat();
          return !stat.isDirectory() || !isValidUUID(item.id);
        })
        .map(async (item) => {
          const stat = await Bun.file(item.path).stat();
          return {
            id: item.id,
            client_id: 'ui', // hardcoded for cockpit usage
            created_at: stat.mtime.toTimeString(),
          } as Compose;
        }),
    );
  }

  public async add(request: ComposeRequest) {
    const id = uuidv4();
    this.queue.enqueue({ id, request });
    return { id };
  }
}
