import path from 'path';
import { Maybe } from 'true-myth/maybe';
import { Result } from 'true-myth/result';
import * as Task from 'true-myth/task';

import type { ComposeRequest } from '@app/api/composes';
import { AppError } from '@app/errors';
import { createJobLogger, createTimingLogger } from '@app/logger';
import { imageTypeLookup } from '@app/utilities';

import { saveBlueprint } from './save-blueprint';
import type { Job, WorkerArgs } from './types';

export const buildImage = ({
  store,
  executable = 'image-builder',
}: WorkerArgs) => {
  return async ({ request, id }: Job<ComposeRequest>) => {
    const jobLogger = createJobLogger(id, 'build-image');
    const timingLogger = createTimingLogger('build-image', { jobId: id });

    jobLogger.info({
      distribution: request.distribution,
      imageRequestsCount: request.image_requests.length,
      executable,
      outputDir: path.join(store, id),
    }, 'Starting image build');

    const outputDir = path.join(store, id);
    
    try {
      // Save blueprint step
      const bpTiming = createTimingLogger('save-blueprint', { jobId: id });
      jobLogger.debug('Saving blueprint');
      
             const bpResult = await saveBlueprint(outputDir, id, request.customizations);
       if (bpResult.isErr) {
         const error = bpResult.error instanceof Error ? bpResult.error : new Error(String(bpResult.error));
         bpTiming.error(error);
         timingLogger.error(error);
         return Result.err(bpResult.error);
       }
      
      const bpPath = bpResult.value;
      bpTiming.done({ blueprintPath: bpPath });
      jobLogger.debug({ blueprintPath: bpPath }, 'Blueprint saved successfully');

      // Validate image request
      const imageRequest = Maybe.of(request.image_requests[0]);
      if (imageRequest.isNothing) {
        const error = new AppError({ message: 'Image request is empty' });
        jobLogger.error('Image request validation failed - empty request');
        timingLogger.error(error);
        return Result.err(error);
      }

      const imageType = imageTypeLookup.hostedToOnPrem(
        request.distribution,
        imageRequest.value.image_type,
      );

      jobLogger.debug({
        originalImageType: imageRequest.value.image_type,
        mappedImageType: imageType,
      }, 'Image type mapped');

      // Prepare and execute build command
      const buildArgs = [
        executable,
        'build',
        '--blueprint',
        bpPath,
        '--output-dir',
        outputDir,
        '--with-manifest',
        '--distro',
        request.distribution,
        imageType,
      ];

      jobLogger.info({
        command: buildArgs.join(' '),
        logFile: path.join(outputDir, 'build.log'),
      }, 'Executing image build command');

      const buildTiming = createTimingLogger('image-builder-process', { jobId: id });

      const proc = Bun.spawn(buildArgs, {
        stdout: Bun.file(path.join(outputDir, 'build.log')),
        stderr: Bun.file(path.join(outputDir, 'build.log')),
      });

      return Task.fromPromise(proc.exited).andThen((exitCode: number) => {
        if (exitCode === 0) {
          const duration = buildTiming.done({ exitCode });
          jobLogger.info({ exitCode, duration }, 'Image build completed successfully');
          timingLogger.done({ exitCode });
          return Task.resolve('OK');
        } else {
          const error = new Error(`Image builder exited with code ${exitCode}`);
          buildTiming.error(error, { exitCode });
          jobLogger.error({ 
            exitCode,
            logFile: path.join(outputDir, 'build.log'),
          }, 'Image build failed with non-zero exit code');
          timingLogger.error(error, { exitCode });
          return Task.reject(error);
        }
      });

    } catch (error) {
      jobLogger.error({
        error: {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        }
      }, 'Unexpected error during image build');
      
      timingLogger.error(error instanceof Error ? error : new Error(String(error)));
      return Result.err(error instanceof Error ? error : new Error(String(error)));
    }
  };
};
