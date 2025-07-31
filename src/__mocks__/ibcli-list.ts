import { Distribution, ImageType } from '@app/api/distributions/types';
import { Architecture } from '@app/constants';

import { imageTypes } from '@fixtures';

export const ibcliList = async (
  distribution: Distribution,
  arch: Architecture,
): Promise<ImageType[]> => {
  return new Promise((resolve) =>
    resolve(
      imageTypes[distribution]
        .filter((type) => type.arch === arch)
        .flatMap((type) => type.image_types)
        .map((type) => ({
          image_type: {
            name: type,
          },
        })),
    ),
  );
};
