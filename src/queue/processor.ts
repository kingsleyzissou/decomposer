import { mkdir } from 'fs/promises';
import path from 'path';

import { logger } from '@app/logger';
import { ComposeRequest } from '@app/types';
import { jsonFormat } from '@app/utilities';

import { Job } from './types';

const saveRequest = async (outputDir: string, request: ComposeRequest) => {
  await Bun.file(path.join(outputDir, 'request.json')).write(
    jsonFormat(request),
  );
};

const handleExit = (id: string, outputDir: string) => {
  return async (_: unknown, exitCode: number) => {
    if (exitCode === 0) {
      logger.info(`✅ Image build successful: ${id}`);
      await Bun.file(path.join(outputDir, 'result.good')).write('');
      return;
    }
    logger.info(`❌ Image build failed: ${id}`);
    await Bun.file(path.join(outputDir, 'result.bad')).write('');
  };
};

export const buildImage = (
  store: string,
  executable: string = 'image-builder',
) => {
  return async ({ request, id }: Job<ComposeRequest>) => {
    const outputDir = path.join(store, id);
    await mkdir(outputDir, { recursive: true });
    await saveRequest(outputDir, request);

    // there should only be one item, we have already validated this
    const imageType = request.image_requests[0].image_type;

    Bun.spawn({
      cmd: [
        executable,
        'build',
        '--output-dir',
        outputDir,
        '--distro',
        request.distribution,
        imageType,
      ],
      stdout: Bun.file(path.join(outputDir, 'build.log')),
      stderr: Bun.file(path.join(outputDir, 'build.log')),
      onExit: handleExit(id, outputDir),
    });
  };
};
