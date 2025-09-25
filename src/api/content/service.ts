import { Result } from 'true-myth/result';
import * as Task from 'true-myth/task';

import { AppError } from '@app/errors';

import type { Request, ContentService as Service } from './types';

export class ContentService implements Service {
  constructor() {}

  public async rpms(request: Request) {
    const response = await Task.fromPromise(
      fetch('http://localhost/api/image-builder-composer/v2/search/packages', {
        unix: '/run/cloudapi/api.socket',
        method: 'POST',
        body: JSON.stringify(request),
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    );

    if (response.isErr) {
      return Result.err(new AppError({ message: 'Unable to find packages' }));
    }

    const result = await response.value.json();

    const packages = result.packages?.map(
      ({
        name,
        summary,
        version,
        release,
        arch,
      }: {
        name: string;
        summary: string;
        version: string;
        release: string;
        arch: string;
      }) => ({
        package_name: name,
        summary: `${summary} (${version}-${release}.${arch})`,
      }),
    );

    return Result.ok(packages);
  }
}
