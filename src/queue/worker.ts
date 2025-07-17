import { $ } from 'bun';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

import { logger } from '@app/logger';
import { ComposeJob } from '@app/types';
import { mapHostedToOnPrem } from '@app/utilities/blueprint-converter';

// TODO: maybe import this from another file, since it's polluting
// the global scope (workers are global), we might want to wrap
// more of this in a try/catch since there are a number of errors
// that could occur here.
const processRequest = async ({ request, id }: ComposeJob, store: string) => {
  const outputDir = path.join(store, id);
  await mkdir(outputDir, { recursive: true });
  await Bun.file(path.join(outputDir, 'request.json')).write(
    JSON.stringify(request, null, 2),
  );

  // TODO: use the validated mapping instead
  const blueprint = mapHostedToOnPrem({
    name: id,
    customizations: request.customizations || {},
  });

  const bpPath = path.join(outputDir, 'blueprint.json');
  await Bun.file(bpPath).write(JSON.stringify(blueprint, null, 2));

  // there should only be one item, we have already validated this
  const imageType = request.image_requests[0].image_type;

  try {
    const result = await $`image-builder-cli \
      build -v \
      --with-buildlog \
      --blueprint ${bpPath} \
      --output-dir ${outputDir} \
      --distro ${request.distribution} \
      ${imageType}
    `.quiet();
    // TODO: save the result to a file
    logger.info(result);
  } catch (error) {
    // TODO: save the error to a file
    // @ts-expect-error stdout should be fine here
    logger.error(error.stdout.toString());
    // @ts-expect-error stderr should be fine here
    logger.error(error.stderr.toString());
  }
};

self.onmessage = async (event) => {
  const { type } = event.data;

  if (type === 'process') {
    await processRequest(event.data.request, event.data.store);
    postMessage({ type: 'ready', message: 'Worker is ready' });
  }
};
