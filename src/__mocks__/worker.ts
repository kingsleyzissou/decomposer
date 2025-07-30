import * as Task from 'true-myth/task';

export const runJob = async (request: { id: string; request: string }) => {
  const proc = Bun.spawn({
    cmd: ['echo', request.request],
  });

  return await Task.fromPromise(proc.exited).andThen((exitCode: number) =>
    exitCode === 0
      ? Task.resolve('OK')
      : Task.reject(new Error('Process exited with a non-zero exit code')),
  );
};
