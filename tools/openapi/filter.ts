import { format, resolveConfig } from 'prettier';

import * as ibcrc from './configs/ibcrc';

const prettierrc = await resolveConfig('./.prettierrc.js');

const schema = await ibcrc.generator(ibcrc.input);

console.log(`📄 Generating filtered openapi spec file for image-builder-crc`);
await Bun.write(
  ibcrc.output,
  await format(JSON.stringify(schema, null, 2), {
    ...prettierrc,
    filepath: ibcrc.output,
  }),
);
