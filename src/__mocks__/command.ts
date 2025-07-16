export const runJob = async (request: { id: string; request: string }) => {
  Bun.spawn({
    cmd: ['echo', request.request],
  });
};
