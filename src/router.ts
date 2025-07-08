import { Hono } from 'hono';

import { SCHEMA_PATH } from '@app/constants';
import { API_ENDPOINT } from '@app/constants';

const router = new Hono();

router.use(API_ENDPOINT);

// define other routes here
router.get('/readiness', (ctx) => {
  return ctx.json({ readiness: 'ready' });
});

router.get('/openapi.json', async (ctx) => {
  try {
    const schema = await Bun.file(SCHEMA_PATH).json();
    return ctx.json(schema);
  } catch {
    const message = 'There was an error parsing the openapi schema';
    return ctx.json({ message, ok: false }, 500);
  }
});

export { router };
