import { StatusCodes } from 'http-status-codes';
import { readdir, rmdir } from 'node:fs/promises';
import path from 'node:path';
import { validate as isValidUUID, v4 as uuid } from 'uuid';

import { AppError } from '@app/errors';
import { logger } from '@app/logger';
import { JobQueue } from '@app/queue';
import { ComposeRequest } from '@app/types';

import { Compose, ImageStatus, ComposeService as Service } from './types';

const getComposeRequest = async (composeDir: string) => {
  try {
    return (await Bun.file(
      path.join(composeDir, 'request.json'),
    ).json()) as ComposeRequest;
  } catch {
    throw new AppError({ message: 'Error loading compose request' });
  }
};

export class ComposeService implements Service {
  private store: string;
  private queue: JobQueue<ComposeRequest>;

  constructor(queue: JobQueue<ComposeRequest>, store: string) {
    this.queue = queue;
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

  public async add(request: ComposeRequest) {
    const id = uuid();
    this.queue.enqueue({ id, request });
    return { id };
  }

  public async get(id: string) {
    const composeDir = path.join(this.store, id);
    const request = await getComposeRequest(composeDir);

    let status = '';

    if (this.queue?.current?.id === id) {
      status = 'building';
    }

    if (this.queue.contains(id)) {
      status = 'pending';
    }

    // prettier-ignore
    const success = await Bun.file(path.join(composeDir, 'result.good')).exists()
    const failed = await Bun.file(path.join(composeDir, 'result.bad')).exists();

    if (success) {
      status = 'success';
    }

    if (failed) {
      status = 'failure';
    }

    // if (status === '') {
    //   throw new AppError({
    //     code: StatusCodes.NOT_FOUND,
    //     message: 'Compose not found',
    //   });
    // }

    return { request, image_status: { status } as ImageStatus };
  }

  public async delete(id: string) {
    await this.exists(id);
    await rmdir(path.join(this.store, id));
  }
}
