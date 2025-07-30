import { mkdir } from 'fs/promises';
import path from 'path';
import { Result } from 'true-myth/result';
import * as Task from 'true-myth/task';
import z from 'zod';

import { mapHostedToOnPrem } from '@app/blueprint';
import { jsonFormat } from '@app/utilities';
import { Customizations } from '@gen/ibcrc/zod';

type Customizations = z.infer<typeof Customizations>;

const createArtifactsDir = async (outputDir: string) => {
  return Task.fromPromise(mkdir(outputDir, { recursive: true }));
};

export const saveBlueprint = async (
  outputDir: string,
  id: string,
  customizations?: Customizations,
) => {
  const dirResult = await createArtifactsDir(outputDir);
  if (dirResult.isErr) {
    return Result.err(dirResult.error);
  }

  const blueprint = mapHostedToOnPrem({
    name: id,
    customizations: customizations || {},
  });

  const bpPath = path.join(outputDir, 'blueprint.json');
  const task = Task.fromPromise(Bun.file(bpPath).write(jsonFormat(blueprint)));

  return task.map(() => bpPath);
};
