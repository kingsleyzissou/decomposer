export const imageTypes: Record<
  string,
  {
    arch: string;
    image_types: string[];
  }[]
> = {
  'fedora-42': [
    {
      arch: 'x86_64',
      image_types: [
        'aws',
        'guest-image',
        'oci',
        'openstack',
        'vsphere',
        'vsphere-ova',
        'wsl',
      ],
    },
    {
      arch: 'aarch64',
      image_types: ['aws', 'guest-image', 'oci', 'openstack'],
    },
  ],
  'rhel-9.6': [
    {
      arch: 'x86_64',
      image_types: [
        'aws',
        'gcp',
        'guest-image',
        'image-installer',
        'oci',
        'openstack',
        'vsphere',
        'vsphere-ova',
        'wsl',
      ],
    },
    {
      arch: 'aarch64',
      image_types: [
        'aws',
        'guest-image',
        'image-installer',
        'openstack',
        'wsl',
      ],
    },
  ],
  'rhel-10.0': [
    {
      arch: 'x86_64',
      image_types: [
        'aws',
        'gcp',
        'guest-image',
        'image-installer',
        'oci',
        'vsphere',
        'vsphere-ova',
        'wsl',
      ],
    },
    {
      arch: 'aarch64',
      image_types: ['aws', 'guest-image', 'image-installer', 'wsl'],
    },
  ],
};
