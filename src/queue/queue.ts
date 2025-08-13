import { EventEmitter } from 'node:stream';

import { Status } from '@app/constants';
import { createModuleLogger, createJobLogger, createTimingLogger } from '@app/logger';
import type { Job, JobResult, Worker } from '@app/worker';

export class JobQueue<T> {
  current?: Job<T> | undefined;
  public queue: Job<T>[];
  public run: Worker<T>;
  public events: EventEmitter;
  private logger = createModuleLogger('job-queue');

  constructor(cmd: Worker<T>) {
    this.queue = [];
    this.run = cmd;
    this.events = new EventEmitter();
    
    this.logger.info('JobQueue initialized');
    
    this.events.on('message', (message: JobResult) => {
      this.logger.debug({
        messageType: message.type,
        jobId: message.data?.id,
        result: message.data?.result,
      }, 'Received job message');
      
      if (message.type === 'ready') {
        this.current = undefined;
        this.process();
      }
    });
  }

  public async enqueue(job: Job<T>) {
    this.logger.info({
      jobId: job.id,
      queueLength: this.queue.length,
    }, 'Enqueuing job');
    
    this.queue.push(job);
    this.process();
  }

  public dequeue() {
    const job = this.queue.shift();
    this.current = job;
    
    if (job) {
      this.logger.debug({
        jobId: job.id,
        remainingInQueue: this.queue.length,
      }, 'Job dequeued');
    }
    
    return job;
  }

  public remove(id: string) {
    const originalLength = this.queue.length;
    this.queue = this.queue.filter((job) => job.id !== id);
    const removed = originalLength !== this.queue.length;
    
    this.logger.info({
      jobId: id,
      removed,
      queueLength: this.queue.length,
    }, removed ? 'Job removed from queue' : 'Job not found in queue');
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
      this.logger.debug('Queue is empty, nothing to process');
      return;
    }

    if (this.current) {
      this.logger.debug({
        currentJobId: this.current.id,
        queueLength: this.queue.length,
      }, 'Job already in progress, skipping process');
      return;
    }

    this.logger.debug({
      queueLength: this.queue.length,
    }, 'Starting queue processing');

    const job = this.dequeue();
    const result = await this.execute(job);
    this.events.emit('message', { type: 'ready', data: result });
  }

  private async execute(job: Job<T> | undefined) {
    if (!job) {
      this.logger.warn('Attempted to execute undefined job');
      return;
    }

    const { id } = job;
    const jobLogger = createJobLogger(id);
    const timing = createTimingLogger('job-execution', { jobId: id });
    
    jobLogger.info('Job execution started');
    
    this.events.emit('message', {
      type: 'update',
      data: { id, result: Status.BUILDING },
    });

    try {
      const result = await this.run(job);
      
      return result.match({
        Ok: () => {
          const duration = timing.done();
          jobLogger.info({ duration }, '✅ Job completed successfully');
          this.logger.info({
            jobId: id,
            duration,
            result: Status.SUCCESS,
          }, 'Job executed successfully');
          
          return { id, result: Status.SUCCESS };
        },
        Err: (reason) => {
          const duration = timing.error(reason instanceof Error ? reason : new Error(String(reason)));
          jobLogger.error({
            duration,
            error: {
              message: reason instanceof Error ? reason.message : String(reason),
              stack: reason instanceof Error ? reason.stack : undefined,
            }
          }, '❌ Job failed');
          
          this.logger.error({
            jobId: id,
            duration,
            result: Status.FAILURE,
            error: {
              message: reason instanceof Error ? reason.message : String(reason),
            }
          }, 'Job execution failed');
          
          return { id, result: Status.FAILURE };
        },
      });
    } catch (error) {
      const duration = timing.error(error instanceof Error ? error : new Error(String(error)));
      jobLogger.error({
        duration,
        error: {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        }
      }, 'Unexpected error during job execution');
      
      this.logger.error({
        jobId: id,
        duration,
        result: Status.FAILURE,
        error: {
          message: error instanceof Error ? error.message : String(error),
        }
      }, 'Unexpected job execution error');
      
      return { id, result: Status.FAILURE };
    }
  }
}
