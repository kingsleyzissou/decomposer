import path from 'node:path';
import z from 'zod';

import * as schemas from './zod';

export const schema = await Bun.file(path.join(__dirname, 'api.json')).json();

// this is just a simple type helper to get
// the underlying type of a zod schema
type Inferred<T extends { [key: string]: z.ZodTypeAny }> = {
  [K in keyof T]: z.infer<T[K]>;
};

export type Schemas = Inferred<typeof schemas>;
