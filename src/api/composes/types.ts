import z from 'zod';

import { AppContext } from '@app/types';
import * as schema from '@generated/zod';

export type Compose = z.infer<typeof schema.ComposesResponseItem>;
export type ComposesResponse = z.infer<typeof schema.ComposesResponse>;

export type ComposeResponse = z.infer<typeof schema.ComposeResponse>;
export type ComposeRequest = z.infer<typeof schema.ComposeRequest>;

export type ComposeContext = AppContext & {
  Variables: {
    service: ComposeService;
  };
};

export type ComposeService = {
  composes: () => Promise<Compose[]>;
  add: (request: ComposeRequest) => Promise<{ id: string }>;
};
