import { logger } from '@app/logger';

export type AppContext = {
  Variables: {
    store: string;
    logger: typeof logger;
  };
};
