import { $ } from 'bun';
import Result from 'true-myth/result';
import * as Task from 'true-myth/task';

import { Architecture } from '@app/constants';
import { AppError } from '@app/errors';
import { imageTypeLookup } from '@app/utilities';
import { ImageTypes } from '@gen/ibcrc/zod';

// pre-load the json list of distribution data on app
// startup and inject it to the route through middleware
import { list } from './distribution-list';
import { DistributionService as Service } from './types';
import { Architectures, Distribution, Distributions, ImageType } from './types';

const ibcliList = async (
  distribution: Distribution,
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
  private list: Distributions;
  private cmd: (
    distribution: Distribution,
    arch: Architecture,
  ) => Promise<ImageType[]>;

  constructor(cmd = ibcliList) {
    this.list = list;
    this.cmd = cmd;
  }

  distributions(): Result<Distributions, AppError> {
    return Result.ok(this.list);
  }

  async architectures(
    distribution: Distribution,
  ): Promise<Result<Architectures, AppError>> {
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

  private async getArchImageTypes(
    distribution: Distribution,
    arch: Architecture,
  ) {
    const items = await this.cmd(distribution, arch);

    const imageTypes = items
      .map((item: ImageType) =>
        imageTypeLookup.onPremToHosted(item.image_type.name),
      )
      .filter((item) => {
        const supported = ImageTypes.safeParse(item);
        return supported.success;
      })
      .sort();

    return {
      arch,
      image_types: imageTypes,
    };
  }
}
