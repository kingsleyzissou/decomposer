import { logger } from '@app/logger';

import { Job, processor } from './types';

export class JobQueue<T> {
  current?: Job<T> | undefined;
  public queue: Job<T>[];
  public run: processor<T>;

  constructor(cmd: processor<T>) {
    this.queue = [];
    this.run = cmd;
  }

  public async enqueue(job: Job<T>) {
    this.queue.push(job);
    this.process();
  }

  public dequeue() {
    this.current = this.queue.shift();
    return this.current;
  }

  public process() {
    if (this.queue.length === 0) {
      return;
    }

    if (this.current) {
      return;
    }

    const job = this.dequeue();
    this.execute(job);
  }

  public execute(job: Job<T> | undefined) {
    if (!job) {
      return;
    }

    this.run(job)
      .then(() => {
        this.current = undefined;
        this.process();
      })
      .catch((err) => {
        // There was most likely an error saving the request or blueprint
        // to the artifacts directory, we should just move on to the next job
        logger.error('There was an error executing the job', err);
        this.current = undefined;
        this.process();
      });
  }
}
