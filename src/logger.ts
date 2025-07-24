import { pino } from 'pino';

const level = () => {
  const env = process.env.NODE_ENV;
  if (env === 'production') {
    return 'info';
  }

  if (env === 'test') {
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
