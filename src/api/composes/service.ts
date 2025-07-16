import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { validate as isValidUUID } from 'uuid';

import { Compose, ComposeService as Service } from './types';

export class ComposeService implements Service {
  private store: string;

  constructor(store: string) {
    this.store = store;
  }

  // TODO: possibly look at using some kind of database,
  // like sqlite or jsondb to handle composes
  public async composes(): Promise<Compose[]> {
    const items = await readdir(this.store);
    const composes: Compose[] = [];

    for (const item of items) {
      if (!isValidUUID(item)) {
        continue;
      }

      const filepath = path.join(this.store, item);
      const stat = await Bun.file(filepath).stat();

      if (stat.isFile()) {
        continue;
      }

      // TODO: check for compose requests and make this
      // more complete. For the time being we can just keep
      // this simple for the POC
      composes.push({
        id: item,
        client_id: 'ui', // hardcoded for cockpit
        created_at: stat.mtime.toISOString(),
        // we're missing the request, so we need to cast this
      } as Compose);
    }

    return composes;
  }
}
