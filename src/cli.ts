import { parseArgs } from 'util';

import { STORE_PATH } from '@app/constants';

export const { values: cliArgs } = parseArgs({
  args: Bun.argv,
  options: {
    store: {
      type: 'string',
      default: process.env.STORE_PATH ?? STORE_PATH,
    },
  },
  strict: true,
  allowPositionals: true,
});
