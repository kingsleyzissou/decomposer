import { $ } from 'bun';
import Result from 'true-myth/result';
import * as Task from 'true-myth/task';

import { Architecture } from '@app/constants';
import { AppError } from '@app/errors';
import { imageTypeLookup } from '@app/utilities';

// pre-load the json list of distribution data on app
// startup and inject it to the route through middleware
import { list } from './distribution-list';
import { DistributionService as Service } from './types';
import {
  ArchitecturesResponse,
  Distributions,
  DistributionsResponse,
  ImageType,
} from './types';

const ibcliList = async (
  distribution: Distributions,
  arch: Architecture,
): Promise<ImageType[]> => {
  return await $`image-builder \
      --format json \
      --filter distro:${distribution} \
      --filter arch:${arch} \
      list
    `.json();
};

export class DistributionService implements Service {
  private distributions: DistributionsResponse;
  private cmd: (
    distribution: Distributions,
    arch: Architecture,
  ) => Promise<ImageType[]>;

  constructor(cmd = ibcliList) {
    this.distributions = list;
    this.cmd = cmd;
  }

  all(): Result<DistributionsResponse, AppError> {
    return Result.ok(this.distributions);
  }

  async getArchitectures(
    distribution: Distributions,
  ): Promise<Result<ArchitecturesResponse, AppError>> {
    const x86Task = await Task.fromPromise(
      this.getArchImageTypes(distribution, Architecture.X86_64),
    );
    if (x86Task.isErr) {
      return Result.err(new AppError({ message: 'Unable to get image types' }));
    }

    const aarchTask = await Task.fromPromise(
      this.getArchImageTypes(distribution, Architecture.AARCH64),
    );
    if (aarchTask.isErr) {
      return Result.err(new AppError({ message: 'Unable to get image types' }));
    }

    return Result.ok([x86Task.value, aarchTask.value]);
  }

  private toBeFiltered(type: string) {
    // we have azure & aws already
    if (type.includes('azure') || type.includes('ec2')) {
      return false;
    }

    // filter out edge images
    if (type.includes('iot') || type.includes('edge')) {
      return false;
    }

    // other artifacts
    if (
      type === 'tar' ||
      type === 'container' ||
      type.includes('minimal') ||
      type.includes('vagrant') ||
      type.includes('workstation')
    ) {
      return false;
    }

    return true;
  }

  private async getArchImageTypes(
    distribution: Distributions,
    arch: Architecture,
  ) {
    const items = await this.cmd(distribution, arch);

    const imageTypes = items
      .map((item: ImageType) =>
        imageTypeLookup.onPremToHosted(item.image_type.name),
      )
      // we don't filter out as much as CRC does here since the filtering
      // matrix is quite involved. This will mean that the on-prem version
      // will have more image type options than CRC
      .filter(this.toBeFiltered)
      .sort();

    return {
      arch,
      image_types: imageTypes,
    };
  }
}
