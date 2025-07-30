import { $ } from 'bun';
import path from 'node:path';

import { getHostArch, jsonFormat } from '../src/utilities';

const manifest = await $`image-builder manifest \
  --distro centos-9 \
  --seed 42 \
  qcow2
`.json();

const hostArch = getHostArch();

await Bun.file(
  path.join(
    __dirname,
    '..',
    'integration',
    '__fixtures__',
    hostArch,
    'centos-9.qcow2.json',
  ),
).write(jsonFormat(manifest));
