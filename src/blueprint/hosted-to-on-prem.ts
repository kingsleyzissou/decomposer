import z from 'zod';

import * as cloudapi from '@gen/cloudapi/zod';
import * as ibcrc from '@gen/ibcrc/zod';

type CreateBlueprintRequest = Pick<
  z.infer<typeof ibcrc.CreateBlueprintRequest>,
  'customizations'
> & { name: string };
type CloudApiBlueprint = z.infer<typeof cloudapi.Blueprint>;

// this function was copied in from the frontend, since we need an on-prem blueprint
// for ibcli it was modified slightly to make it more re-usable. since we might be
// importing this project into the frontend as a library, we might be able remove the
// code there and import it from here. We would also need to implement the converter
// going the other way too though. However, the need for this should go away when we
// implement universtal blueprints
export const mapHostedToOnPrem = ({
  name,
  customizations,
}: CreateBlueprintRequest): CloudApiBlueprint => {
  const result: CloudApiBlueprint = {
    name,
    customizations: {},
  };

  if (customizations?.packages) {
    result.packages = customizations.packages.map((pkg) => {
      return {
        name: pkg,
        version: '*',
      };
    });
  }

  if (customizations?.groups) {
    result.customizations!.group = customizations.groups;
  }

  if (customizations?.containers) {
    result.containers = customizations.containers;
  }

  if (customizations?.directories) {
    result.customizations!.directories = customizations.directories;
  }

  if (customizations?.files) {
    result.customizations!.files = customizations.files;
  }

  if (customizations?.filesystem) {
    result.customizations!.filesystem = customizations.filesystem.map((fs) => {
      return {
        mountpoint: fs.mountpoint,
        minsize: fs.min_size + '',
      };
    });
  }

  if (customizations?.users) {
    result.customizations!.user = customizations.users.map((u) => {
      const user: z.infer<typeof cloudapi.User> = {
        name: u.name,
      };

      if (u.ssh_key) {
        user.key = u.ssh_key;
      }

      if (u.groups) {
        user.groups = u.groups;
      }

      if (u.password) {
        user.password = u.password;
      }

      return user;
    });
  }

  if (customizations?.services) {
    result.customizations!.services = customizations.services;
  }

  if (customizations?.hostname) {
    result.customizations!.hostname = customizations.hostname;
  }

  if (customizations?.kernel) {
    result.customizations!.kernel = customizations.kernel;
  }

  if (customizations?.timezone) {
    result.customizations!.timezone = customizations.timezone;
  }

  if (customizations?.locale) {
    result.customizations!.locale = customizations.locale;
  }

  if (customizations?.firewall) {
    result.customizations!.firewall = customizations.firewall;
  }

  if (customizations?.installation_device) {
    result.customizations!.installation_device =
      customizations.installation_device;
  }

  if (customizations?.fdo) {
    result.customizations!.fdo = customizations.fdo;
  }

  if (customizations?.ignition) {
    result.customizations!.ignition = customizations.ignition;
  }

  if (customizations?.partitioning_mode) {
    result.customizations!.partitioning_mode = customizations.partitioning_mode;
  }

  if (customizations?.fips) {
    result.customizations!.fips = customizations.fips?.enabled || false;
  }

  if (customizations?.installer) {
    result.customizations!.installer = customizations.installer;
  }

  return result;
};

// because we're deriving our types from zod schema rather than types,
// we can actually use zod to make sure that the conversion was okay.
export const validatedHostedToOnPrem = (blueprint: CreateBlueprintRequest) => {
  return cloudapi.Blueprint.safeParse(mapHostedToOnPrem(blueprint));
};
