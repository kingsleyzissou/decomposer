import type { ComposeService } from '@app/api';
import type { Logger } from '@app/logger';

export type { ComposeDoc, Store } from '@app/store';
export type { Job, JobResult, Worker } from '@app/worker';

export type AppContext = {
  Variables: {
    logger: Logger;
    services: {
      compose: ComposeService;
    };
  };
};
