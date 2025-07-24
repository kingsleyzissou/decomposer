import { EventEmitter } from 'node:stream';

import { logger } from '@app/logger';
import { JobResult } from '@app/types';

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
    this.events.on('completed', (result: JobResult) => {
      logger.info('Queue ready');
      this.events.emit('update', result);
      this.current = undefined;
      this.process();
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

  public async process() {
    if (this.queue.length === 0) {
      return;
    }

    if (this.current) {
      return;
    }

    const job = this.dequeue();
    const result = await this.execute(job);
    this.events.emit('completed', result);
  }

  private async execute(job: Job<T> | undefined) {
    if (!job) {
      return;
    }

    this.events.emit('update', { id: job.id, result: 'building' });
    return await this.run(job)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        // Just handle the error and return a failed result, there
        // was some issue either saving the blueprint to the state
        // directory or with the build itself
        logger.error('There was an error executing the job', err);
        return { id: job.id, result: 'failure' };
      });
  }
}
