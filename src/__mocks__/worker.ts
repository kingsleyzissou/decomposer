import * as Task from 'true-myth/task';

import { workerError } from '@app/worker/build-image';

export const runJob = async (request: { id: string; request: string }) => {
  return await Task.tryOrElse(workerError, async () => {
    const proc = Bun.spawn({
      cmd: ['echo', request.request],
    });

    await proc.exited;

    if (proc.exitCode !== 0) {
      throw new Error('Process exited with a non-zero exit code');
    }

    return 'OK';
  });
};
