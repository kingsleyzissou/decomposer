import { Hono } from 'hono';
import { pinoLogger } from 'hono-pino';
import { prettyJSON } from 'hono/pretty-json';

import * as api from '@app/api';
import { cliArgs } from '@app/cli';
import { API_ENDPOINT, SOCKET_PATH } from '@app/constants';
import { notFound } from '@app/errors';
import { logger } from '@app/logger';
import { prettyPrint } from '@app/utilities';

// we need to make sure that the socket doesn't
// already exist, otherwise we run into issues
// where the server can't run
if (await Bun.file(SOCKET_PATH).exists()) {
  await Bun.file(SOCKET_PATH).unlink();
}

const app = new Hono();
app.notFound(notFound);

export const middleware = new Hono();
middleware.use('*', prettyJSON());
middleware.use('*', pinoLogger({ pino: logger }));

app.route(API_ENDPOINT, middleware);
app.route(API_ENDPOINT, api.meta);

const server = {
  fetch: app.fetch,
  unix: SOCKET_PATH,
};

Bun.serve(server);
logger.info(
  `🚀 Decomposer server started with configuration:\n${prettyPrint({
    socket: server.unix,
    store: cliArgs.store,
    api: API_ENDPOINT,
    pid: process.pid,
  })}`,
);
