import z from 'zod';

import { AppContext, ComposeRequest } from '@app/types';
import * as schema from '@gen/ibcrc/zod';

export type Compose = z.infer<typeof schema.ComposesResponseItem>;
export type ComposesResponse = z.infer<typeof schema.ComposesResponse>;

export type ComposeResponse = z.infer<typeof schema.ComposeResponse>;

export type ComposeStatus = z.infer<typeof schema.ComposeStatus>;
export type ImageStatus = z.infer<typeof schema.ImageStatus>;

export type ComposeContext = AppContext & {
  Variables: {
    service: ComposeService;
  };
};

export type ComposeService = {
  composes: () => Promise<Compose[]>;
  add: (request: ComposeRequest) => Promise<{ id: string }>;
  get: (id: string) => Promise<ComposeStatus>;
  delete: (id: string) => Promise<void>;
};
