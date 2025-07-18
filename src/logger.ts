import { pino } from 'pino';

export const logger = pino({
  base: null,
  level: 'trace',
  transport: {
    target: 'hono-pino/debug-log',
  },
  timestamp: pino.stdTimeFunctions.unixTime,
});
