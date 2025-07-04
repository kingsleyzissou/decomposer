import chalk from 'chalk';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';

import { SOCKET_PATH } from '@app/constants';

// we need to make sure that the socket doesn't
// already exist, otherwise we run into issues
// where the server can't run
if (await Bun.file(SOCKET_PATH).exists()) {
  await Bun.file(SOCKET_PATH).unlink();
}

const app = new Hono();
app.notFound((c) => c.json({ message: 'Not Found', ok: false }, 404));

// these middlewares need to be registered
// on the app-level (or main router), since
// we need them to be available to the entire
// application
const middleware = new Hono();
middleware.use(prettyJSON());
middleware.use(logger());

app.route('/', middleware);
app.get('/health', (c) => c.json({ message: 'OK', ok: true }, 200));

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
