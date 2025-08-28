import { chmod } from 'node:fs/promises';

import { app } from '@app/app';
import { args } from '@app/args';
import { API_ENDPOINT } from '@app/constants';
import { logger } from '@app/logger';
import { prettyPrint, removeSocket } from '@app/utilities';

// we need to make sure that the socket doesn't
// already exist, otherwise we run into issues
// where the server can't run
await removeSocket(args.socket);

const server = {
  fetch: app.fetch,
  unix: args.socket,
};

Bun.serve(server);

// we need to change this so that we can
// ping the socket as a non-privileged user
await chmod(args.socket, 0o775);

const shutdown = async (signal: string) => {
  logger.info(`Received ${signal}, shutting down gracefully...`);
  await removeSocket(args.socket);
  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

logger.info(
  `🚀 Decomposer server started with configuration:\n${prettyPrint({
    socket: args.socket,
    api: API_ENDPOINT,
    pid: process.pid,
  })}`,
);
