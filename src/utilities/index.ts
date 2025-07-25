export { prettyPrint, jsonFormat } from './formatting';
export { withTransaction } from './transaction';

export const removeSocket = async (socket: string) => {
  if (await Bun.file(socket).exists()) {
    await Bun.file(socket).unlink();
  }
};
