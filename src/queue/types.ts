export type Job<T> = {
  id: string;
  request: T;
};

export type Worker<T> = (request: Job<T>) => Promise<string>;
