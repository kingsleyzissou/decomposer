import { Status } from '@app/types';

export const runJob = async (request: { id: string; request: string }) => {
  const proc = Bun.spawn({
    cmd: ['echo', request.request],
  });
  await proc.exited;
  return { id: request.id, result: Status.SUCCESS };
};
