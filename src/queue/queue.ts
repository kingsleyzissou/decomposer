import { EventEmitter } from 'node:stream';

import { Status } from '@app/constants';
import { logger } from '@app/logger';
import { Job, JobResult, Worker } from '@app/worker';

export class JobQueue<T> {
  current?: Job<T> | undefined;
  public queue: Job<T>[];
  public run: Worker<T>;
  public events: EventEmitter;

  constructor(cmd: Worker<T>) {
    this.queue = [];
    this.run = cmd;
    this.events = new EventEmitter();
    this.events.on('message', (message: JobResult) => {
      if (message.type === 'ready') {
        this.current = undefined;
        this.process();
      }
    });
  }

  public async enqueue(job: Job<T>) {
    this.queue.push(job);
    this.process();
  }

  public dequeue() {
    this.current = this.queue.shift();
    return this.current;
  }

  public remove(id: string) {
    this.queue = this.queue.filter((job) => job.id === id);
  }

  public contains(id: string) {
    return this.queue.some((job) => job.id === id);
  }

  public isCurrent(id: string) {
    if (!this.current) {
      return false;
    }

    return id === this.current.id;
  }

  public async process() {
    if (this.queue.length === 0) {
      return;
    }

    if (this.current) {
      return;
    }

    const job = this.dequeue();
    const result = await this.execute(job);
    this.events.emit('message', { type: 'ready', data: result });
  }

  private async execute(job: Job<T> | undefined) {
    if (!job) {
      return;
    }

    const { id } = job;
    this.events.emit('message', {
      type: 'update',
      data: { id, result: Status.BUILDING },
    });

    const result = await this.run(job);
    return result.match({
      Ok: () => {
        logger.info(`✅ Image build successful: ${id}`);
        return { id, result: Status.SUCCESS };
      },
      Err: (reason) => {
        logger.info(`❌ Image build failed for ${id}: ${reason}`);
        return { id, result: Status.FAILURE };
      },
    });
  }
}
