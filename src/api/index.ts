import { Hono } from 'hono';

import { onError } from '@app/errors';
import type { AppContext } from '@app/types';

import { composes } from './composes';
import { ComposeService } from './composes/service';
import { meta } from './meta';

export const api = new Hono<AppContext>()
  // we need to catch the errors either at the router
  // level otherwise the errors go uncaught
  .onError(onError)
  .route('/', meta)
  .route('/', composes);

export const services = {
  Compose: ComposeService,
};

export type * from './composes/types';
