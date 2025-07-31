import { arch } from 'node:os';

import { AppError } from '@app/errors';

export const removeSocket = async (socket: string) => {
  if (await Bun.file(socket).exists()) {
    await Bun.file(socket).unlink();
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

export const imageTypeLookup = {
  hostedToOnPrem: (distro: string, imageType: string) => {
    // TODO: add these aliases to the images library:
    // https://issues.redhat.com/browse/HMS-8730
    const prefix = distro.startsWith('fedora') ? 'server-' : '';
    switch (imageType) {
      case 'guest-image':
        return `${prefix}qcow2`;
      case 'aws':
        return `${prefix}ami`;
      case 'azure':
        return `${prefix}vhd`;
      case 'vsphere':
        return `${prefix}vmdk`;
      case 'vsphere-ova':
        return `${prefix}ova`;
      default:
        throw new AppError({
          message: `Unknown image type ${imageType} for distro ${distro}`,
        });
    }
  },
  onPremToHosted: (imageType: string) => {
    // TODO: ibcli doesn't return aliases, so we need to do this
    // translation. Possibly the best fix would be to add this to
    // ibcli upstream
    const image = imageType.startsWith('server-')
      ? imageType.split('server-')[1]
      : imageType;
    switch (image) {
      case 'qcow2':
        return 'guest-image';
      case 'ami':
        return 'aws';
      case 'vhd':
        return 'azure';
      case 'vmdk':
        return 'vshper';
      case 'ova':
        return 'vsphere-ova';
      default:
        return image;
    }
  },
};

export const getHostArch = () => {
  const hostArch = arch();
  if (['arm', 'arm64'].includes(hostArch)) {
    return 'aarch64';
  }

  if (['x64'].includes(hostArch)) {
    return 'x86_64';
  }

  throw Error('Unknown host arch');
};
