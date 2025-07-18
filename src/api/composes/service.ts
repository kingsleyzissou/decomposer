import { StatusCodes } from 'http-status-codes';
import { readdir, rmdir } from 'node:fs/promises';
import path from 'node:path';
import { validate as isValidUUID } from 'uuid';

import { AppError } from '@app/errors';
import { logger } from '@app/logger';

import { Compose, ComposeService as Service } from './types';

export class ComposeService implements Service {
  private store: string;

  constructor(store: string) {
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
            created_at: stat.mtime.toISOString(),
          } as Compose;
        }),
    );
  }

  private async exists(id: string) {
    try {
      const composePath = path.join(this.store, id);
      await Bun.file(composePath).stat();
    } catch {
      const message = `No compose found for: ${id}`;
      logger.debug(message);
      throw new AppError({
        message,
        code: StatusCodes.NOT_FOUND,
      });
    }
  }

  public async delete(id: string) {
    await this.exists(id);
    await rmdir(path.join(this.store, id));
  }
}
