import { beforeEach, describe, expect, it, spyOn } from 'bun:test';
import path from 'path';

import { WorkerQueue as Queue } from './queue';

describe('Test the worker queue', () => {
  let worker: Worker;
  let queue: Queue<string>;
  let queueProcessorSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    // just use an actual worker, since mocking this is quite
    // tricky and not worth the hassle. The added benefit of this
    // is that it simulates the real usecase a lot better
    worker = new Worker(path.join(__dirname, '..', '__mocks__', 'worker.ts'));
    queue = new Queue<string>(worker);
    queueProcessorSpy = spyOn(queue, 'process');
  });

  it('initial queue size should be zero', () => {
    expect(queue.queue.length).toBe(0);
    expect(queueProcessorSpy).toHaveBeenCalledTimes(0);
  });

  it('enqueuing a requests should start the worker thread', () => {
    expect(queue.queue.length).toBe(0);
    queue.enqueue('task1');
    expect(queueProcessorSpy).toHaveBeenCalledTimes(1);
    expect(queue.current).toBe('task1');
    // simulate job execution
    setTimeout(() => {
      expect(queueProcessorSpy).toHaveBeenCalledTimes(2);
    }, 200);
  });

  it('enqueuing 3 requests should call the process function multiple times', () => {
    expect(queue.queue.length).toBe(0);
    queue.enqueue('task1');
    expect(queueProcessorSpy).toHaveBeenCalledTimes(1);
    queue.enqueue('task2');
    queue.enqueue('task3');
    expect(queueProcessorSpy).toHaveBeenCalledTimes(3);
    expect(queue.queue.length).toBe(2);
    expect(queue.current).toBe('task1');
    // simulate job execution
    setTimeout(() => {
      expect(queueProcessorSpy).toHaveBeenCalledTimes(4);
    }, 200);
  });

  it('completed queue should have no items and current should not be set', () => {
    expect(queue.queue.length).toBe(0);
    queue.enqueue('task1');
    expect(queueProcessorSpy).toHaveBeenCalledTimes(1);
    queue.enqueue('task2');
    expect(queueProcessorSpy).toHaveBeenCalledTimes(2);
    expect(queue.current).toBe('task1');
    expect(queue.queue.length).toBe(1);
    // simulate job execution
    setTimeout(() => {
      expect(queueProcessorSpy).toHaveBeenCalledTimes(4);
      expect(queue.current).toBe('task2');
      expect(queue.queue.length).toBe(0);
      expect(queue.current).not.toBeDefined();
    }, 200);
  });
});
