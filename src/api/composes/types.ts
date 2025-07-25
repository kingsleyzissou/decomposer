import z from 'zod';

import * as schema from '@gen/ibcrc/zod';

export type ComposesResponse = z.infer<typeof schema.ComposesResponse>;

export type ComposeResponse = z.infer<typeof schema.ComposeResponse>;

export type ComposeStatusResponse = z.infer<typeof schema.ComposeStatus>;
