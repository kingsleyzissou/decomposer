export const removeSocket = async (socket: string) => {
  if (await Bun.file(socket).exists()) {
    await Bun.file(socket).unlink();
  }
};
