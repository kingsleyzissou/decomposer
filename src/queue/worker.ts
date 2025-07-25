import { mkdir } from 'fs/promises';
import path from 'path';
import z from 'zod';

import { mapHostedToOnPrem } from '@app/blueprint';
import { logger } from '@app/logger';
import { ComposeRequest, JobResult, Status } from '@app/types';
import { imageTypeLookup, jsonFormat } from '@app/utilities';
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

type BuildImageArgs = {
  store: string;
  executable?: string;
  subcommand?: string;
};

export const buildImage = ({
  store,
  executable = 'image-builder',
  // this is for convenience for our integration tests, we could build manifests
  // instead of images. We can then compare the manifest against a known manifest.
  // this will help with ci test times
  subcommand = 'build',
}: BuildImageArgs) => {
  return async ({ request, id }: Job<ComposeRequest>): Promise<JobResult> => {
    const outputDir = path.join(store, id);
    await mkdir(outputDir, { recursive: true });
    const bpPath = await saveBlueprint(outputDir, id, request.customizations);

    // there should only be one item, we have already validated this
    const imageType = imageTypeLookup.crcToIbcli(
      request.distribution,
      request.image_requests[0].image_type,
    );

    const isManifest = subcommand === 'manifest';

    const options = isManifest
      ? {
          stderr: Bun.file(path.join(outputDir, 'build.log')),
        }
      : {
          stdout: Bun.file(path.join(outputDir, 'build.log')),
          stderr: Bun.file(path.join(outputDir, 'build.log')),
        };

    const extraArgs = isManifest ? ['--seed', '42'] : [];

    const proc = Bun.spawn(
      [
        executable,
        subcommand,
        '--blueprint',
        bpPath,
        '--output-dir',
        outputDir,
        '--distro',
        request.distribution,
        ...extraArgs,
        imageType,
      ],
      options,
    );

    await proc.exited;
    if (proc.exitCode !== 0) {
      logger.info(`❌ Image build failed: ${id}`);
      return { id, result: Status.FAILURE };
    }

    if (subcommand === 'manifest') {
      // @ts-expect-error this expected, we have made sure that
      // stdout is not set if we are running the manifest subcommand
      const text = await proc.stdout.text();
      await Bun.file(path.join(outputDir, 'manifest.json')).write(
        jsonFormat(JSON.parse(text)),
      );
    }

    logger.info(`✅ Image build successful: ${id}`);
    return { id, result: Status.SUCCESS };
  };
};
