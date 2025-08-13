import { $ } from 'bun';
import path from 'node:path';

import { Architecture } from '../src/constants';
import { jsonFormat } from '../src/utilities';

const arches = [Architecture.X86_64, Architecture.AARCH64];

const genManifest = async (arch: string) =>
  await $`image-builder manifest \
  --distro centos-9 \
  --arch ${arch} \
  --seed 42 \
  qcow2
`.json();

for await (const arch of arches) {
  console.log(`📝 Generating manifest for ${arch}`);
  const manifest = await genManifest(arch);

  await Bun.file(
    path.join(
      __dirname,
      '..',
      'integration',
      '__fixtures__',
      arch,
      'centos-9.qcow2.json',
    ),
  ).write(jsonFormat(manifest));
}
