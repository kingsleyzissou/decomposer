import { z } from 'zod';

export const ImageTypes = z.enum([
  'aws',
  'aws-ha-rhui',
  'aws-rhui',
  'aws-sap-rhui',
  'azure',
  'azure-cvm',
  'azure-eap7-rhui',
  'azure-rhui',
  'azure-sapapps-rhui',
  'azure-sap-rhui',
  'edge-commit',
  'edge-container',
  'edge-installer',
  'gcp',
  'gcp-rhui',
  'guest-image',
  'image-installer',
  'iot-bootable-container',
  'iot-commit',
  'iot-container',
  'iot-installer',
  'iot-raw-image',
  'iot-simplified-installer',
  'live-installer',
  'minimal-raw',
  'oci',
  'vsphere',
  'vsphere-ova',
  'wsl',
]);

export const Repository = z
  .object({
    rhsm: z.boolean().default(false),
    baseurl: z.string().url(),
    mirrorlist: z.string().url(),
    metalink: z.string().url(),
    gpgkey: z.string(),
    check_gpg: z.boolean(),
    check_repo_gpg: z.boolean().default(false),
    ignore_ssl: z.boolean(),
    module_hotfixes: z.boolean().default(false),
    package_sets: z.array(z.string()),
  })
  .partial()
  .passthrough();

export const OSTree = z
  .object({
    url: z.string(),
    contenturl: z.string(),
    ref: z.string(),
    parent: z.string(),
    rhsm: z.boolean().default(false),
  })
  .partial()
  .passthrough();

export const UploadTypes = z.enum([
  'aws',
  'aws.s3',
  'gcp',
  'azure',
  'container',
  'oci.objectstorage',
  'pulp.ostree',
  'local',
]);

export const AWSEC2UploadOptions = z.object({
  region: z.string(),
  snapshot_name: z.string().optional(),
  share_with_accounts: z.array(z.string()),
});

export const AWSS3UploadOptions = z.object({
  region: z.string(),
  public: z.boolean().optional().default(false),
});

export const GCPUploadOptions = z.object({
  region: z.string(),
  bucket: z.string().optional(),
  image_name: z.string().optional(),
  share_with_accounts: z.array(z.string()).optional(),
});

export const AzureUploadOptions = z.object({
  tenant_id: z.string(),
  subscription_id: z.string(),
  resource_group: z.string(),
  location: z.string().optional(),
  image_name: z.string().optional(),
  hyper_v_generation: z.enum(['V1', 'V2']).optional().default('V1'),
});

export const ContainerUploadOptions = z
  .object({ name: z.string(), tag: z.string() })
  .partial();

export const LocalUploadOptions = z.object({}).partial();

export const OCIUploadOptions = z.object({}).partial();

export const PulpOSTreeUploadOptions = z.object({
  basepath: z.string(),
  repository: z.string().optional(),
  server_address: z.string().url().optional(),
});

export const UploadOptions = z.union([
  AWSEC2UploadOptions,
  AWSS3UploadOptions,
  GCPUploadOptions,
  AzureUploadOptions,
  ContainerUploadOptions,
  LocalUploadOptions,
  OCIUploadOptions,
  PulpOSTreeUploadOptions,
]);

export const UploadTarget = z
  .object({ type: UploadTypes, upload_options: UploadOptions })
  .passthrough();

export const ImageRequest = z.object({
  architecture: z.string(),
  image_type: ImageTypes,
  repositories: z.array(Repository),
  ostree: OSTree.optional(),
  upload_targets: z.array(UploadTarget).optional(),
  upload_options: UploadOptions.optional(),
  size: z.unknown().optional().default(0),
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
    ensure_parents: z.boolean().optional().default(false),
  })
  .passthrough();

export const Subscription = z
  .object({
    organization: z.string(),
    activation_key: z.string(),
    server_url: z.string().url(),
    base_url: z.string().url(),
    insights: z.boolean(),
    rhc: z.boolean().optional().default(false),
    insights_client_proxy: z.string().url().optional(),
    template_uuid: z.string().optional(),
    template_name: z.string().optional(),
    patch_url: z.string().optional(),
  })
  .passthrough();

export const Module = z.object({ name: z.string(), stream: z.string() });

export const User = z.object({
  name: z.string(),
  groups: z.array(z.string()).optional(),
  key: z.string().optional(),
  password: z.string().optional(),
});

export const CustomRepository = z
  .object({
    id: z.string(),
    name: z.string().optional(),
    filename: z.string().optional(),
    baseurl: z.array(z.string().url()).optional(),
    mirrorlist: z.string().url().optional(),
    metalink: z.string().url().optional(),
    enabled: z.boolean().optional(),
    gpgkey: z.array(z.string()).optional(),
    check_gpg: z.boolean().optional(),
    check_repo_gpg: z.boolean().optional(),
    ssl_verify: z.boolean().optional(),
    priority: z.number().int().optional(),
    module_hotfixes: z.boolean().optional(),
  })
  .passthrough();

export const OpenSCAPTailoring = z
  .object({ selected: z.array(z.string()), unselected: z.array(z.string()) })
  .partial()
  .passthrough();

export const OpenSCAPJSONTailoring = z
  .object({ profile_id: z.string(), filepath: z.string() })
  .passthrough();

export const OpenSCAP = z
  .object({
    policy_id: z.string().uuid().optional(),
    profile_id: z.string(),
    tailoring: OpenSCAPTailoring.optional(),
    json_tailoring: OpenSCAPJSONTailoring.optional(),
  })
  .passthrough();

export const Filesystem = z
  .object({ mountpoint: z.string(), min_size: z.unknown() })
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

export const FirewallServices = z
  .object({ enabled: z.array(z.string()), disabled: z.array(z.string()) })
  .partial();

export const FirewallCustomization = z
  .object({ ports: z.array(z.string()), services: FirewallServices })
  .partial();

export const FDO = z
  .object({
    manufacturing_server_url: z.string(),
    diun_pub_key_insecure: z.string(),
    diun_pub_key_hash: z.string(),
    diun_pub_key_root_certs: z.string(),
    di_mfg_string_type_mac_iface: z.string(),
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
  .partial()
  .passthrough();

export const ImportKeys = z
  .object({ files: z.array(z.string()) })
  .partial()
  .passthrough();

export const RPMCustomization = z
  .object({ import_keys: ImportKeys })
  .partial()
  .passthrough();

export const DNFPluginConfig = z
  .object({ enabled: z.boolean() })
  .partial()
  .passthrough();

export const SubManDNFPluginsConfig = z
  .object({
    product_id: DNFPluginConfig,
    subscription_manager: DNFPluginConfig,
  })
  .partial()
  .passthrough();

export const SubManRHSMConfig = z
  .object({ manage_repos: z.boolean(), auto_enable_yum_plugins: z.boolean() })
  .partial()
  .passthrough();

export const SubManRHSMCertdConfig = z
  .object({ auto_registration: z.boolean() })
  .partial()
  .passthrough();

export const SubManConfig = z
  .object({ rhsm: SubManRHSMConfig, rhsmcertd: SubManRHSMCertdConfig })
  .partial()
  .passthrough();

export const RHSMConfig = z
  .object({
    dnf_plugins: SubManDNFPluginsConfig,
    subscription_manager: SubManConfig,
  })
  .partial()
  .passthrough();

export const RHSMCustomization = z
  .object({ config: RHSMConfig })
  .partial()
  .passthrough();

export const CACertsCustomization = z.object({
  pem_certs: z.array(z.string()),
});

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

export const Customizations = z
  .object({
    containers: z.array(Container),
    directories: z.array(Directory),
    files: z.array(File),
    subscription: Subscription,
    packages: z.array(z.string()),
    enabled_modules: z.array(Module),
    users: z.array(User),
    payload_repositories: z.array(Repository),
    custom_repositories: z.array(CustomRepository),
    openscap: OpenSCAP,
    filesystem: z.array(Filesystem),
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
    partitioning_mode: z.enum(['raw', 'lvm', 'auto-lvm']).default('auto-lvm'),
    fips: FIPS,
    installer: Installer,
    rpm: RPMCustomization,
    rhsm: RHSMCustomization,
    cacerts: CACertsCustomization,
    disk: Disk,
  })
  .partial();

export const Koji = z.object({
  server: z.string().url(),
  task_id: z.number().int(),
  name: z.string(),
  version: z.string(),
  release: z.string(),
});

export const Package = z.object({
  name: z.string(),
  version: z.string().optional(),
});

export const PackageGroup = z.object({ name: z.string() });

export const SSHKey = z.object({ user: z.string(), key: z.string() });

export const BlueprintUser = z.object({
  name: z.string(),
  description: z.string().optional(),
  password: z.string().optional(),
  key: z.string().optional(),
  home: z.string().optional(),
  shell: z.string().optional(),
  groups: z.array(z.string()).optional(),
  uid: z.number().int().optional(),
  gid: z.number().int().optional(),
});

export const FirewallZones = z
  .object({ name: z.string(), sources: z.array(z.string()) })
  .partial();

export const BlueprintFirewall = z
  .object({
    ports: z.array(z.string()),
    services: FirewallServices,
    zones: z.array(FirewallZones),
  })
  .partial();

export const BlueprintFilesystem = z
  .object({ mountpoint: z.string(), minsize: minsize })
  .passthrough();

export const BlueprintOpenSCAP = z
  .object({
    policy_id: z.string().uuid().optional(),
    profile_id: z.string(),
    datastream: z.string().optional(),
    tailoring: OpenSCAPTailoring.optional(),
    json_tailoring: OpenSCAPJSONTailoring.optional(),
  })
  .passthrough();

export const BlueprintFile = z
  .object({
    path: z.string(),
    mode: z.string().optional(),
    user: z.union([z.string(), z.number()]).optional(),
    group: z.union([z.string(), z.number()]).optional(),
    data: z.string().optional(),
  })
  .passthrough();

export const BlueprintRepository = z
  .object({
    id: z.string(),
    baseurls: z.array(z.string().url()).optional(),
    gpgkeys: z.array(z.string()).optional(),
    metalink: z.string().url().optional(),
    mirrorlist: z.string().url().optional(),
    name: z.string().optional(),
    priority: z.number().int().optional(),
    enabled: z.boolean().optional(),
    gpgcheck: z.boolean().optional(),
    repo_gpgcheck: z.boolean().optional(),
    sslverify: z.boolean().optional(),
    filename: z.string().optional(),
    module_hotfixes: z.boolean().optional(),
  })
  .passthrough();

export const BlueprintCustomizations = z
  .object({
    hostname: z.string(),
    kernel: Kernel,
    sshkey: z.array(SSHKey),
    user: z.array(BlueprintUser),
    group: z.array(Group),
    timezone: Timezone,
    locale: Locale,
    firewall: BlueprintFirewall,
    services: Services,
    filesystem: z.array(BlueprintFilesystem),
    disk: Disk,
    installation_device: z.string(),
    partitioning_mode: z.enum(['raw', 'lvm', 'auto-lvm']).default('auto-lvm'),
    fdo: FDO,
    openscap: BlueprintOpenSCAP,
    ignition: Ignition,
    directories: z.array(Directory),
    files: z.array(BlueprintFile),
    repositories: z.array(BlueprintRepository),
    fips: z.boolean(),
    installer: Installer,
    rpm: RPMCustomization,
    rhsm: RHSMCustomization,
    cacerts: CACertsCustomization,
  })
  .partial();

export const Blueprint = z.object({
  name: z.string(),
  description: z.string().optional(),
  version: z.string().optional(),
  distro: z.string().optional(),
  packages: z.array(Package).optional(),
  modules: z.array(Package).optional(),
  enabled_modules: z.array(Module).optional(),
  groups: z.array(PackageGroup).optional(),
  containers: z.array(Container).optional(),
  customizations: BlueprintCustomizations.optional(),
});

export const ComposeRequest = z.object({
  distribution: z.string(),
  image_request: ImageRequest.optional(),
  image_requests: z.array(ImageRequest).optional(),
  customizations: Customizations.optional(),
  koji: Koji.optional(),
  blueprint: Blueprint.optional(),
});

export const ObjectReference = z
  .object({ id: z.string(), kind: z.string(), href: z.string() })
  .passthrough();

export const ComposeId = ObjectReference.and(
  z.object({ id: z.string().uuid() }).passthrough(),
);

export const Error = ObjectReference.and(
  z
    .object({ code: z.string(), reason: z.string(), operation_id: z.string() })
    .passthrough(),
);
