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

export const imageTypeLookup = {
  hostedToOnPrem: (distro: string, imageType: string) => {
    // TODO: add these aliases to the images library:
    // https://issues.redhat.com/browse/HMS-8730
    // https://github.com/osbuild/images/pull/1716
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
    // Fedora image types have a `server-` prefix that
    const image = imageType.startsWith('server-')
      ? imageType.slice('server-'.length)
      : imageType;

    // this is a list of types that we know we need to translate
    const lookup: Record<string, string> = {
      qcow2: 'guest-image',
      ami: 'aws',
      gce: 'gcp',
      vhd: 'azure',
      vmdk: 'vshpere',
      ova: 'vsphere-ova',
    };

    const result = lookup[image];
    return result ? result : image;
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
