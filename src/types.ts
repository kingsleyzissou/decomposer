import type { ComposeService } from '@app/api';

export type { ComposeDocument, Store } from '@app/store';

export type AppContext = {
  Variables: {
    services: {
      compose: ComposeService;
    };
  };
};
