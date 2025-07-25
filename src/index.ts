import { chmod } from 'fs/promises';
import { Hono } from 'hono';
import { pinoLogger } from 'hono-pino';
import { prettyJSON } from 'hono/pretty-json';

import * as api from '@app/api';
import { cliArgs } from '@app/cli';
import { API_ENDPOINT } from '@app/constants';
import { notFound, onError } from '@app/errors';
import { logger } from '@app/logger';
import { JobQueue } from '@app/queue';
import { buildImage } from '@app/queue';
import { createStore } from '@app/store';
import { AppContext, ComposeRequest } from '@app/types';
import { prettyPrint, removeSocket } from '@app/utilities';

// we need to make sure that the socket doesn't
// already exist, otherwise we run into issues
// where the server can't run
await removeSocket(cliArgs.socket);

const app = new Hono();
app.notFound(notFound);
app.onError(onError);

const { composes } = createStore(cliArgs.store);
const queue = new JobQueue<ComposeRequest>(buildImage(cliArgs.store));

export const middleware = new Hono<AppContext>();
middleware.use(prettyJSON());
middleware.use(pinoLogger({ pino: logger }));
middleware.use(async (ctx, next) => {
  ctx.set('store', {
    path: cliArgs.store,
    composes,
  });
  ctx.set('queue', queue);
  await next();
});
app.route('*', middleware);

app.route(API_ENDPOINT, api.meta);
app.route(API_ENDPOINT, api.composes);

const server = {
  fetch: app.fetch,
  unix: cliArgs.socket,
};

Bun.serve(server);

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
    socket: server.unix,
    store: cliArgs.store,
    api: API_ENDPOINT,
    pid: process.pid,
  })}`,
);
