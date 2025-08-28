import { parseArgs } from 'util';

import { SOCKET_PATH } from '@app/constants';

export const { values: args } = parseArgs({
  args: Bun.argv,
  options: {
    socket: {
      type: 'string',
      default: process.env.SOCKET_PATH ?? SOCKET_PATH,
    },
  },
  strict: true,
  allowPositionals: true,
});
