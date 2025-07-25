import { AppError } from '@app/errors';

export const imageTypeLookup = {
  crcToIbcli: (distro: string, imageType: string) => {
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
};
