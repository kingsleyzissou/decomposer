export class WorkerQueue<T> {
  current?: T | undefined;
  public queue: T[];
  public worker: Worker;

  constructor(worker: Worker) {
    this.queue = [];
    this.worker = worker;
    this.worker.onmessage = (event) => {
      if (event.data && event.data.type === 'ready') {
        this.current = undefined;
        this.process();
      }
    };
  }

  public async enqueue(request: T) {
    this.queue.push(request);
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

    const request = this.dequeue();
    this.worker.postMessage({
      type: 'process',
      request,
    });
  }
}
