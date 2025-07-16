import { Queue } from './queue';

export type AppContext = {
  Variables: {
    store: string;
    queue: Queue;
  };
};
