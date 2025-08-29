import { beforeEach, describe, expect, it, spyOn } from 'bun:test';

import { runJob } from '@mocks';

import { JobQueue as Queue } from './queue';

describe('Test the worker queue', () => {
  let queue: Queue<string>;
  let queueProcessorSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    queue = new Queue<string>(runJob);
    queueProcessorSpy = spyOn(queue, 'process');
  });

  it('initial queue size should be zero', () => {
    expect(queue.queue.length).toBe(0);
    expect(queueProcessorSpy).toHaveBeenCalledTimes(0);
  });

  it('enqueuing a requests should start the worker thread', () => {
    expect(queue.queue.length).toBe(0);
    queue.enqueue({ id: 'task1', request: 'First task' });
    expect(queueProcessorSpy).toHaveBeenCalledTimes(1);
    expect(queue.current).toStrictEqual({ id: 'task1', request: 'First task' });
    expect(queueProcessorSpy).toHaveBeenCalledTimes(1);
  });

  it('enqueuing 3 requests should call the process function multiple times', () => {
    expect(queue.queue.length).toBe(0);
    queue.enqueue({ id: 'task1', request: 'First task' });
    expect(queueProcessorSpy).toHaveBeenCalledTimes(1);
    queue.enqueue({ id: 'task2', request: 'Second task' });
    queue.enqueue({ id: 'task3', request: 'Third task' });
    expect(queueProcessorSpy).toHaveBeenCalledTimes(3);
    expect(queue.queue.length).toBe(2);
    expect(queue.current).toStrictEqual({ id: 'task1', request: 'First task' });
    expect(queueProcessorSpy).toHaveBeenCalledTimes(3);
  });

  it('completed queue should have no items and current should not be set', async () => {
    expect(queue.queue.length).toBe(0);
    queue.enqueue({ id: 'task1', request: 'First task' });
    expect(queueProcessorSpy).toHaveBeenCalledTimes(1);
    queue.enqueue({ id: 'task2', request: 'Second task' });
    expect(queueProcessorSpy).toHaveBeenCalledTimes(2);
    expect(queue.current).toStrictEqual({ id: 'task1', request: 'First task' });
    expect(queue.queue.length).toBe(1);
    // wait for all the jobs to clear the queue
    await Bun.sleep(4);
    expect(queue.current).not.toBeDefined();
  });
});
