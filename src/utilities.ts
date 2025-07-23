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

export const jsonFormat = (o: object) => {
  return JSON.stringify(o, null, 2);
};

// this is a simple higher order function so that we can
// execute a promise with `true-myth` tasks
export const resolve = <T>(fn: () => Promise<T>): Promise<T> => fn();
