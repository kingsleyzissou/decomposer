import { EventEmitter } from 'node:stream';

import { logger } from '@app/logger';
import { JobMessage, Status } from '@app/types';

import { Job, Worker } from './types';

export class JobQueue<T> {
  current?: Job<T> | undefined;
  public queue: Job<T>[];
  public run: Worker<T>;
  public events: EventEmitter;

  constructor(cmd: Worker<T>) {
    this.queue = [];
    this.run = cmd;
    this.events = new EventEmitter();
    this.events.on('message', (message: JobMessage) => {
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

    this.events.emit('message', {
      type: 'update',
      data: { id: job.id, result: Status.BUILDING },
    });
    return await this.run(job)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        // Just handle the error and return a failed result, there
        // was some issue either saving the blueprint to the state
        // directory or with the build itself
        logger.error('There was an error executing the job', err);
        return { id: job.id, result: Status.FAILURE };
      });
  }
}
