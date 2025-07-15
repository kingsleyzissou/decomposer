import chalk from 'chalk';
import { Hono } from 'hono';

import * as api from '@app/api';
import { API_ENDPOINT, SOCKET_PATH } from '@app/constants';
import { notFound } from '@app/errors';
import { middleware } from '@app/middleware';

// we need to make sure that the socket doesn't
// already exist, otherwise we run into issues
// where the server can't run
if (await Bun.file(SOCKET_PATH).exists()) {
  await Bun.file(SOCKET_PATH).unlink();
}

const app = new Hono();
app.notFound(notFound);

app.route(API_ENDPOINT, middleware);
app.route(API_ENDPOINT, api.meta);

const server = {
  fetch: app.fetch,
  unix: SOCKET_PATH,
};

Bun.serve(server);
console.log(
  chalk.blue('[INFO]:'),
  '🚀 Server listening on unix socket:',
  server.unix,
);
