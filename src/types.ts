import type { ComposeService } from '@app/api';

export type { ComposeDocument, Store } from '@app/store';
export type { Job, JobResult, Worker } from '@app/worker';

export type AppContext = {
  Variables: {
    services: {
      compose: ComposeService;
    };
  };
};
