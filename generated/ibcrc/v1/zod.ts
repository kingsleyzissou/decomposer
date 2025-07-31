import { z } from 'zod';

export const Readiness = z.object({ readiness: z.string() }).passthrough();

export const DistributionItem = z
  .object({ description: z.string(), name: z.string() })
  .passthrough();

export const DistributionsResponse = z.array(DistributionItem);

export const ArchitectureItem = z
  .object({ arch: z.string(), image_types: z.array(z.string()) })
  .passthrough();

export const Architectures = z.array(ArchitectureItem);

export const HTTPError = z
  .object({ title: z.string(), detail: z.string() })
  .passthrough();

export const HTTPErrorList = z
  .object({ errors: z.array(HTTPError) })
  .passthrough();

export const Distributions = z.enum([
  'rhel-8',
  'rhel-8-nightly',
  'rhel-84',
  'rhel-85',
  'rhel-86',
  'rhel-87',
  'rhel-88',
  'rhel-89',
  'rhel-8.10',
  'rhel-9',
  'rhel-9-nightly',
  'rhel-9.6-nightly',
  'rhel-9.7-nightly',
  'rhel-9-beta',
  'rhel-90',
  'rhel-91',
  'rhel-92',
  'rhel-93',
  'rhel-94',
  'rhel-95',
  'rhel-9.6',
  'rhel-10',
  'rhel-10-nightly',
  'rhel-10.0-nightly',
  'rhel-10.1-nightly',
  'rhel-10-beta',
  'rhel-10.0',
  'centos-9',
  'centos-10',
  'fedora-37',
  'fedora-38',
  'fedora-39',
  'fedora-40',
  'fedora-41',
  'fedora-42',
]);

export const ImageTypes = z.enum([
  'aws',
  'azure',
  'edge-commit',
  'edge-installer',
  'gcp',
  'guest-image',
  'image-installer',
  'oci',
  'vsphere',
  'vsphere-ova',
  'wsl',
  'ami',
  'rhel-edge-commit',
  'rhel-edge-installer',
  'vhd',
]);

export const UploadTypes = z.enum([
  'aws',
  'gcp',
  'azure',
  'aws.s3',
  'oci.objectstorage',
  'local',
]);

export const AWSUploadRequestOptions = z
  .object({ region: z.string().default('us-east-1'), bucket: z.string() })
  .partial()
  .passthrough();

export const AWSS3UploadRequestOptions = z.object({}).partial().passthrough();

export const GCPUploadRequestOptions = z
  .object({ share_with_accounts: z.array(z.string()) })
  .partial()
  .passthrough();

export const AzureUploadRequestOptions = z
  .object({
    source_id: z.string().optional(),
    tenant_id: z.string().optional(),
    subscription_id: z.string().optional(),
    resource_group: z.string(),
    image_name: z
      .string()
      .min(1)
      .max(60)
      .regex(/(^[a-zA-Z0-9]$)|(^[a-zA-Z0-9][a-zA-Z0-9_\.-]*[a-zA-Z0-9_]$)/)
      .optional(),
    hyper_v_generation: z.enum(['V1', 'V2']).optional().default('V1'),
  })
  .passthrough();

export const OCIUploadRequestOptions = z.object({}).partial().passthrough();

export const UploadRequest = z
  .object({
    type: UploadTypes,
    options: z.union([
      AWSUploadRequestOptions,
      AWSS3UploadRequestOptions,
      GCPUploadRequestOptions,
      AzureUploadRequestOptions,
      OCIUploadRequestOptions,
    ]),
  })
  .passthrough();

export const OSTree = z
  .object({
    url: z.string(),
    contenturl: z.string(),
    ref: z.string(),
    parent: z.string(),
    rhsm: z.boolean(),
  })
  .partial()
  .passthrough();

export const ImageRequest = z.object({
  architecture: z.enum(['x86_64', 'aarch64']),
  image_type: ImageTypes,
  upload_request: UploadRequest,
  ostree: OSTree.optional(),
  size: z.unknown().optional(),
  snapshot_date: z.string().optional(),
  content_template: z.string().optional(),
  content_template_name: z.string().optional(),
});

export const Container = z
  .object({
    source: z.string(),
    name: z.string().optional(),
    tls_verify: z.boolean().optional(),
  })
  .passthrough();

export const Directory = z
  .object({
    path: z.string(),
    mode: z.string().optional(),
    user: z.union([z.string(), z.number()]).optional(),
    group: z.union([z.string(), z.number()]).optional(),
    ensure_parents: z.boolean().optional(),
  })
  .passthrough();

export const File = z
  .object({
    path: z.string(),
    mode: z.string().optional(),
    user: z.union([z.string(), z.number()]).optional(),
    group: z.union([z.string(), z.number()]).optional(),
    data: z.string().optional(),
    data_encoding: z.enum(['plain', 'base64']).optional(),
    ensure_parents: z.boolean().optional(),
  })
  .passthrough();

export const Subscription = z
  .object({
    organization: z.number().int(),
    activation_key: z.string(),
    server_url: z.string(),
    base_url: z.string(),
    insights: z.boolean(),
    rhc: z.boolean().optional().default(false),
    insights_client_proxy: z.string().url().optional(),
  })
  .passthrough();

export const Module = z.object({ name: z.string(), stream: z.string() });

export const Repository = z
  .object({
    id: z.string().optional(),
    rhsm: z.boolean(),
    baseurl: z.string().url().optional(),
    mirrorlist: z.string().url().optional(),
    metalink: z.string().url().optional(),
    gpgkey: z.string().optional(),
    check_gpg: z.boolean().optional(),
    check_repo_gpg: z.boolean().optional().default(false),
    ignore_ssl: z.boolean().optional(),
    module_hotfixes: z.boolean().optional(),
  })
  .passthrough();

export const CustomRepository = z
  .object({
    id: z.string(),
    name: z.string().optional(),
    filename: z.string().optional(),
    baseurl: z.array(z.string().url()).optional(),
    mirrorlist: z.string().url().optional(),
    metalink: z.string().url().optional(),
    gpgkey: z.array(z.string()).optional(),
    check_gpg: z.boolean().optional(),
    check_repo_gpg: z.boolean().optional(),
    enabled: z.boolean().optional(),
    priority: z.number().int().optional(),
    ssl_verify: z.boolean().optional(),
    module_hotfixes: z.boolean().optional(),
  })
  .passthrough();

export const OpenSCAPProfile = z
  .object({
    profile_id: z.string(),
    profile_name: z.string().optional(),
    profile_description: z.string().optional(),
  })
  .passthrough();

export const OpenSCAPCompliance = z
  .object({ policy_id: z.string().uuid() })
  .passthrough();

export const OpenSCAP = z.union([OpenSCAPProfile, OpenSCAPCompliance]);

export const Filesystem = z
  .object({ mountpoint: z.string(), min_size: z.number().int() })
  .passthrough();

export const minsize = z.string();

export const FilesystemTyped = z
  .object({
    type: z.literal('plain').optional(),
    part_type: z.string().optional(),
    minsize: minsize.optional(),
    mountpoint: z.string().optional(),
    label: z.string().optional(),
    fs_type: z.enum(['ext4', 'xfs', 'vfat', 'swap']),
  })
  .passthrough();

export const BtrfsSubvolume = z
  .object({ name: z.string(), mountpoint: z.string() })
  .passthrough();

export const BtrfsVolume = z
  .object({
    type: z.literal('btrfs'),
    part_type: z.string().optional(),
    minsize: minsize.optional(),
    subvolumes: z.array(BtrfsSubvolume),
  })
  .passthrough();

export const LogicalVolume = z
  .object({
    name: z.string().optional(),
    minsize: minsize.optional(),
    mountpoint: z.string().optional(),
    label: z.string().optional(),
    fs_type: z.enum(['ext4', 'xfs', 'vfat', 'swap']),
  })
  .passthrough();

export const VolumeGroup = z
  .object({
    type: z.literal('lvm'),
    part_type: z.string().optional(),
    name: z.string().optional(),
    minsize: minsize.optional(),
    logical_volumes: z.array(LogicalVolume),
  })
  .passthrough();

export const Partition = z.union([FilesystemTyped, BtrfsVolume, VolumeGroup]);

export const Disk = z
  .object({
    type: z.enum(['gpt', 'dos']).optional(),
    minsize: minsize.optional(),
    partitions: z.array(Partition),
  })
  .passthrough();

export const User = z
  .object({
    name: z.string(),
    groups: z.array(z.string()).optional(),
    ssh_key: z.string().optional(),
    password: z.string().optional(),
    has_password: z.boolean().optional(),
  })
  .passthrough();

export const Services = z
  .object({
    enabled: z.array(z.string()).min(1),
    disabled: z.array(z.string()).min(1),
    masked: z.array(z.string()).min(1),
  })
  .partial();

export const Kernel = z
  .object({ name: z.string(), append: z.string() })
  .partial();

export const Group = z.object({
  name: z.string(),
  gid: z.number().int().optional(),
});

export const Timezone = z
  .object({ timezone: z.string(), ntpservers: z.array(z.string()) })
  .partial();

export const Locale = z
  .object({ languages: z.array(z.string()), keyboard: z.string() })
  .partial();

export const FirewallCustomization = z
  .object({
    ports: z.array(z.string()),
    services: z
      .object({ enabled: z.array(z.string()), disabled: z.array(z.string()) })
      .partial(),
  })
  .partial();

export const FDO = z
  .object({
    manufacturing_server_url: z.string(),
    diun_pub_key_insecure: z.string(),
    diun_pub_key_hash: z.string(),
    diun_pub_key_root_certs: z.string(),
  })
  .partial();

export const IgnitionEmbedded = z.object({ config: z.string() });

export const IgnitionFirstboot = z.object({ url: z.string() });

export const Ignition = z
  .object({ embedded: IgnitionEmbedded, firstboot: IgnitionFirstboot })
  .partial();

export const FIPS = z.object({ enabled: z.boolean().default(false) }).partial();

export const Installer = z
  .object({ unattended: z.boolean(), sudo_nopasswd: z.array(z.string()) })
  .partial();

export const CACertsCustomization = z.object({
  pem_certs: z.array(z.string()),
});

export const AAPRegistration = z.object({
  ansible_callback_url: z.string(),
  host_config_key: z.string(),
  tls_certificate_authority: z.string().optional(),
  skip_tls_verification: z.boolean().optional(),
});

export const Customizations = z
  .object({
    containers: z.array(Container),
    directories: z.array(Directory),
    files: z.array(File),
    subscription: Subscription,
    packages: z.array(z.string()).max(10000),
    enabled_modules: z.array(Module),
    payload_repositories: z.array(Repository),
    custom_repositories: z.array(CustomRepository),
    openscap: OpenSCAP,
    filesystem: z.array(Filesystem).max(128),
    disk: Disk,
    users: z.array(User),
    services: Services,
    hostname: z.string(),
    kernel: Kernel,
    groups: z.array(Group),
    timezone: Timezone,
    locale: Locale,
    firewall: FirewallCustomization,
    installation_device: z.string(),
    fdo: FDO,
    ignition: Ignition,
    partitioning_mode: z.enum(['raw', 'lvm', 'auto-lvm']),
    fips: FIPS,
    installer: Installer,
    cacerts: CACertsCustomization,
    aap_registration: AAPRegistration,
  })
  .partial()
  .passthrough();

export const BlueprintMetadata = z
  .object({
    parent_id: z.string().uuid().nullable(),
    exported_at: z.string(),
    is_on_prem: z.boolean().default(false),
  })
  .passthrough();

export const CreateBlueprintRequest = z.object({
  name: z.string().max(100),
  description: z.string().max(250).optional(),
  distribution: Distributions,
  image_requests: z.array(ImageRequest).min(1),
  customizations: Customizations,
  metadata: BlueprintMetadata.optional(),
});

export const CreateBlueprintResponse = z
  .object({ id: z.string().uuid() })
  .passthrough();

export const ListResponseMeta = z
  .object({ count: z.number().int() })
  .passthrough();

export const ListResponseLinks = z
  .object({ first: z.string(), last: z.string() })
  .passthrough();

export const ClientId = z.enum(['api', 'ui', 'mcp']);

export const ComposeRequest = z.object({
  distribution: Distributions,
  image_name: z.string().max(100).optional(),
  image_description: z.string().max(250).optional(),
  client_id: ClientId.optional().default('api'),
  image_requests: z.array(ImageRequest).min(1).max(1),
  customizations: Customizations.optional(),
});

export const ComposesResponseItem = z
  .object({
    id: z.string().uuid(),
    request: ComposeRequest,
    created_at: z.string(),
    image_name: z.string().optional(),
    client_id: ClientId.optional().default('api'),
    blueprint_id: z.string().uuid().nullish(),
    blueprint_version: z.number().int().nullish(),
  })
  .passthrough();

export const ComposesResponse = z
  .object({
    meta: ListResponseMeta,
    links: ListResponseLinks,
    data: z.array(ComposesResponseItem),
  })
  .passthrough();

export const AWSUploadStatus = z
  .object({ ami: z.string(), region: z.string() })
  .passthrough();

export const AWSS3UploadStatus = z.object({ url: z.string() }).passthrough();

export const GCPUploadStatus = z
  .object({ project_id: z.string(), image_name: z.string() })
  .passthrough();

export const AzureUploadStatus = z
  .object({ image_name: z.string() })
  .passthrough();

export const OCIUploadStatus = z.object({ url: z.string() }).passthrough();

export const UploadStatus = z
  .object({
    status: z.enum(['success', 'failure', 'pending', 'running']),
    type: UploadTypes,
    options: z.union([
      AWSUploadStatus,
      AWSS3UploadStatus,
      GCPUploadStatus,
      AzureUploadStatus,
      OCIUploadStatus,
    ]),
  })
  .passthrough();

export const ComposeStatusError = z
  .object({ id: z.number().int(), reason: z.string() })
  .passthrough();

export const ImageStatus = z
  .object({
    status: z.enum([
      'success',
      'failure',
      'pending',
      'building',
      'uploading',
      'registering',
    ]),
    upload_status: UploadStatus.optional(),
    error: ComposeStatusError.optional(),
  })
  .passthrough();

export const ComposeStatus = z
  .object({ image_status: ImageStatus, request: ComposeRequest })
  .passthrough();

export const ComposeResponse = z
  .object({ id: z.string().uuid() })
  .passthrough();
