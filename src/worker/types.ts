import { Result } from 'true-myth/result';

import { Status } from '@app/constants';

export type WorkerArgs = {
  store: string;
  executable?: string;
};

export type JobResult = {
  type: string;
  data: {
    id: string;
    result: Status;
  };
};

export type Job<T> = {
  id: string;
  request: T;
};

export type Worker<T> = (request: Job<T>) => Promise<Result<string, unknown>>;
