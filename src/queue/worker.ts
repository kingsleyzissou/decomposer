import { mkdir } from 'fs/promises';
import path from 'path';
import { Result } from 'true-myth/result';
import * as Task from 'true-myth/task';
import z from 'zod';

import { mapHostedToOnPrem } from '@app/blueprint';
import { ComposeRequest } from '@app/types';
import { imageTypeLookup, jsonFormat } from '@app/utilities';
import { Customizations } from '@gen/ibcrc/zod';

import { Job } from './types';

type Customizations = z.infer<typeof Customizations>;

const createArtifactsDir = async (outputDir: string) => {
  return Task.fromPromise(mkdir(outputDir, { recursive: true }));
};

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
  const task = Task.fromPromise(Bun.file(bpPath).write(jsonFormat(blueprint)));

  return task.map(() => bpPath);
};

export const buildImage = (
  store: string,
  executable: string = 'image-builder',
) => {
  return async ({ request, id }: Job<ComposeRequest>) => {
    const outputDir = path.join(store, id);
    const dirResult = await createArtifactsDir(outputDir);
    if (dirResult.isErr) {
      return Result.err(dirResult.error);
    }

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
