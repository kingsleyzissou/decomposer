import { mkdir } from 'fs/promises';
import path from 'path';
import z from 'zod';

import { mapHostedToOnPrem } from '@app/blueprint';
import { logger } from '@app/logger';
import { ComposeRequest } from '@app/types';
import { jsonFormat } from '@app/utilities';
import { Customizations } from '@gen/ibcrc/zod';

import { Job } from './types';

type Customizations = z.infer<typeof Customizations>;

const saveBlueprint = async (
  outputDir: string,
  id: string,
  customizations?: Customizations,
) => {
  const blueprint = mapHostedToOnPrem({
    name: id,
    customizations: customizations || {},
  });

  const bpPath = path.join(outputDir, 'blueprint.json');
  await Bun.file(bpPath).write(jsonFormat(blueprint));
  return bpPath;
};

export const buildImage = (
  store: string,
  executable: string = 'image-builder',
) => {
  return async ({ request, id }: Job<ComposeRequest>) => {
    const outputDir = path.join(store, id);
    await mkdir(outputDir, { recursive: true });
    const bpPath = await saveBlueprint(outputDir, id, request.customizations);

    // there should only be one item, we have already validated this
    const imageType = request.image_requests[0].image_type;

    const proc = Bun.spawn(
      [
        executable,
        'build',
        '--blueprint',
        bpPath,
        '--output-dir',
        outputDir,
        '--distro',
        request.distribution,
        imageType,
      ],
      {
        stdout: Bun.file(path.join(outputDir, 'build.log')),
        stderr: Bun.file(path.join(outputDir, 'build.log')),
      },
    );

    await proc.exited;
    if (proc.exitCode === 0) {
      logger.info(`✅ Image build successful: ${id}`);
      return 'success';
    }

    logger.info(`❌ Image build failed: ${id}`);
    return 'failure';
  };
};
