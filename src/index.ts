import { chmod } from 'fs/promises';

import { createApp } from '@app/app';
import { cliArgs } from '@app/cli';
import { API_ENDPOINT } from '@app/constants';
import { logger } from '@app/logger';
import { createQueue } from '@app/queue';
import { createStore } from '@app/store';
import { prettyPrint, removeSocket } from '@app/utilities';

// we need to make sure that the socket doesn't
// already exist, otherwise we run into issues
// where the server can't run
await removeSocket(cliArgs.socket);

const store = createStore(cliArgs.store);
const queue = createQueue(store);
const app = createApp(cliArgs.socket, store, queue);
Bun.serve(app);

// we need to change this so that we can
// ping the socket as a non-privileged user
await chmod(cliArgs.socket, 0o775);

const shutdown = async (signal: string) => {
  logger.info(`Received ${signal}, shutting down gracefully...`);
  await removeSocket(cliArgs.socket);
  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

logger.info(
  `🚀 Decomposer server started with configuration:\n${prettyPrint({
    socket: app.unix,
    store: cliArgs.store,
    api: API_ENDPOINT,
    pid: process.pid,
  })}`,
);
