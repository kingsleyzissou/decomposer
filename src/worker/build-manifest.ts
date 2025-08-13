import path from 'path';
import { Maybe } from 'true-myth/maybe';
import { Result } from 'true-myth/result';
import * as Task from 'true-myth/task';

import type { ComposeRequest } from '@app/api/composes';
import { AppError } from '@app/errors';
import { imageTypeLookup } from '@app/utilities';

import { saveBlueprint } from './save-blueprint';
import type { Job, WorkerArgs } from './types';

export const buildManifest = ({
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

    const imageRequest = Maybe.of(request.image_requests[0]);
    if (imageRequest.isNothing) {
      // this really shouldn't happen since we validate the image request at
      // the api handler level, but it is an additional runtime check, so it's ok
      return Result.err(new AppError({ message: 'Image request is empty' }));
    }

    const imageType = imageTypeLookup.hostedToOnPrem(
      request.distribution,
      imageRequest.value.image_type,
    );

    const proc = Bun.spawn(
      [
        executable,
        'manifest',
        '--blueprint',
        bpPath,
        '--seed',
        '42',
        '--distro',
        request.distribution,
        imageType,
      ],
      {
        stdout: Bun.file(path.join(outputDir, 'manifest.json')),
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
