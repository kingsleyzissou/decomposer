export { prettyPrint, jsonFormat } from './formatting';
export { imageTypeLookup } from './image-lookup';
export { withMutex } from './mutex';

export const removeSocket = async (socket: string) => {
  if (await Bun.file(socket).exists()) {
    await Bun.file(socket).unlink();
  }
};
