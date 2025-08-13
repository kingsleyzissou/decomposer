import { pino } from 'pino';
import { randomUUID } from 'crypto';

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
  base: {
    service: 'decomposer',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  },
  level: level(),
  timestamp: pino.stdTimeFunctions.unixTime,
  transport: {
    target: 'hono-pino/debug-log',
  },
}
);

// Create child loggers for different modules
export const createModuleLogger = (module: string) => {
  return logger.child({ module });
};

// Create request logger with correlation ID
export const createRequestLogger = (requestId?: string) => {
  return logger.child({ 
    requestId: requestId || randomUUID(),
    type: 'request'
  });
};

// Create job logger with job context
export const createJobLogger = (jobId: string, jobType?: string) => {
  return logger.child({ 
    jobId,
    jobType,
    type: 'job'
  });
};

// Helper for timing operations
export const createTimingLogger = (operation: string, context?: Record<string, any>) => {
  const startTime = Date.now();
  const loggerInstance = logger.child({ operation, ...context });
  
  return {
    logger: loggerInstance,
    done: (additionalContext?: Record<string, any>) => {
      const duration = Date.now() - startTime;
      loggerInstance.info({ duration, ...additionalContext }, `${operation} completed`);
      return duration;
    },
    error: (error: Error, additionalContext?: Record<string, any>) => {
      const duration = Date.now() - startTime;
      loggerInstance.error({ 
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        },
        duration,
        ...additionalContext 
      }, `${operation} failed`);
      return duration;
    }
  };
};

export type Logger = typeof logger;
