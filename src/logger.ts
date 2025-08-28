import { pino } from 'pino';

const level = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'info';
  }

  if (process.env.NODE_ENV === 'test') {
    // debug messages make the testing suite
    // noisier than it needs to be
    return 'silent';
  }

  return 'trace';
};

export const logger = pino({
  base: null,
  level: level(),
  transport: {
    target: 'hono-pino/debug-log',
  },
  timestamp: pino.stdTimeFunctions.unixTime,
});

export type Logger = typeof logger;
