import type {
  BlueprintService,
  ComposeService,
  DistributionService,
} from '@app/api';
import type { Logger } from '@app/logger';

export type { ComposeDocument, Store } from '@app/store';
export type { Job, JobResult, Worker } from '@app/worker';

export type AppContext = {
  Variables: {
    logger: Logger;
    services: {
      blueprint: BlueprintService;
      compose: ComposeService;
      distribution: DistributionService;
    };
  };
};
