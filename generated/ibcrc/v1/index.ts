import z from 'zod';

import * as schemas from './zod';

// this is just a simple type helper to get
// the underlying type of a zod schema
type Inferred<T extends { [key: string]: z.ZodTypeAny }> = {
  [K in keyof T]: z.infer<T[K]>;
};

export type Schemas = Inferred<typeof schemas>;
export { default as schema } from './api.json';
