import path from 'path';
import * as Task from 'true-myth/task';
import type z from 'zod';

import { mapHostedToOnPrem } from '@app/blueprint';
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
  const task = Task.fromPromise(
    Bun.file(bpPath).write(JSON.stringify(blueprint, null, 2)),
  );

  return task.map(() => bpPath);
};
