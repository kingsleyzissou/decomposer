import path from 'path';
import * as Task from 'true-myth/task';
import type z from 'zod';

import { mapHostedToOnPrem } from '@app/blueprint';
import { jsonFormat } from '@app/utilities';
import type { Customizations } from '@gen/ibcrc/zod';

type Customizations = z.infer<typeof Customizations>;

export const saveBlueprint = async (
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
