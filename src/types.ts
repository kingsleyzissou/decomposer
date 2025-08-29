import type { ComposeService } from '@app/api';
import type { Logger } from '@app/logger';

export type { ComposeDocument, Store } from '@app/store';

export type AppContext = {
  Variables: {
    logger: Logger;
    services: {
      compose: ComposeService;
    };
  };
};
