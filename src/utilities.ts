import { SOCKET_PATH } from '@app/constants';

export const removeSocket = async () => {
  if (await Bun.file(SOCKET_PATH).exists()) {
    await Bun.file(SOCKET_PATH).unlink();
  }
};

export const prettyPrint = (o: object) => {
  return Object.entries(o)
    .map(([key, value]) => {
      return `  ${key}: ${value}\n`;
    })
    .join('');
};
