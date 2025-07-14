import z from 'zod';

import { ComposeRequest } from '@generated/zod';

import { WorkerQueue } from './queue';

export type ComposeJob = {
  id: string;
  request: z.infer<typeof ComposeRequest>;
};

export type AppContext = {
  Variables: {
    store: string;
    queue: WorkerQueue<ComposeJob>;
  };
};
