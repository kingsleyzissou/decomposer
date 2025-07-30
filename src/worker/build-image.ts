import path from 'path';
import { Result } from 'true-myth/result';
import * as Task from 'true-myth/task';

import { ComposeRequest, Job } from '@app/types';
import { imageTypeLookup } from '@app/utilities';

import { saveBlueprint } from './save-blueprint';
import { WorkerArgs } from './types';

export const buildImage = ({
  store,
  executable = 'image-builder',
}: WorkerArgs) => {
  return async ({ request, id }: Job<ComposeRequest>) => {
    const outputDir = path.join(store, id);
    const bpResult = await saveBlueprint(outputDir, id, request.customizations);
    if (bpResult.isErr) {
      return Result.err(bpResult.error);
    }

    const bpPath = bpResult.value;

    const imageType = imageTypeLookup.hostedToOnPrem(
      request.distribution,
      // there should only be one item, we have already validated this
      request.image_requests[0].image_type,
    );

    const proc = Bun.spawn(
      [
        executable,
        'build',
        '--blueprint',
        bpPath,
        '--output-dir',
        outputDir,
        '--with-manifest',
        '--distro',
        request.distribution,
        imageType,
      ],
      {
        stdout: Bun.file(path.join(outputDir, 'build.log')),
        stderr: Bun.file(path.join(outputDir, 'build.log')),
      },
    );

    return Task.fromPromise(proc.exited).andThen((exitCode: number) =>
      exitCode === 0
        ? Task.resolve('OK')
        : Task.reject(
            new Error('Image builder exited with a non-zero exit code'),
          ),
    );
  };
};
