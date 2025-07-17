import { format, resolveConfig } from 'prettier';

import * as cloudapi from './configs/cloudapi';
import * as ibcrc from './configs/ibcrc';

const prettierrc = await resolveConfig('./.prettierrc.js');

[ibcrc, cloudapi].forEach(async ({ input, output, generator, component }) => {
  const schema = await generator(input);

  console.log(`📄 Generating filtered openapi spec file for ${component}`);
  await Bun.write(
    output,
    await format(JSON.stringify(schema, null, 2), {
      ...prettierrc,
      filepath: output,
    }),
  );
});
