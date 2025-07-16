export type Job<T> = {
  id: string;
  request: T;
};

export type processor<T> = (request: Job<T>) => Promise<void>;
