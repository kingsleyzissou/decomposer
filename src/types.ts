import type { Logger } from '@app/logger';

export type AppContext = {
  Variables: {
    logger: Logger;
  };
};
