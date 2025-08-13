import { StatusCodes } from 'http-status-codes';
import { Maybe, Result } from 'true-myth';

import { AppError } from '@app/errors';
import { createModuleLogger, createTimingLogger } from '@app/logger';
import type { JobQueue } from '@app/queue';
import type { ComposeDocument, JobResult, Store } from '@app/types';

import { Model } from './model';
import type { ComposeRequest, ComposeService as Service } from './types';

export class ComposeService implements Service {
  private model: Model;
  private queue: JobQueue<ComposeRequest>;
  private logger = createModuleLogger('compose-service');

  constructor(queue: JobQueue<ComposeRequest>, store: Store) {
    this.queue = queue;
    this.model = new Model(store.path, store.composes);
    
    this.logger.debug('ComposeService initialized');
    
    this.queue.events.on('message', async ({ data }: JobResult) => {
      this.logger.debug({
        jobId: data.id,
        status: data.result,
      }, 'Received job status update');
      
      await this.update(data.id, { status: data.result });
    });
  }

  public async all(blueprintId?: string) {
    const timing = createTimingLogger('compose-find-all', { 
      blueprintId: blueprintId || 'all' 
    });
    
    try {
      this.logger.debug({ blueprintId }, 'Finding all composes');
      const result = await this.model.findAll(Maybe.of(blueprintId));
      
      timing.done({ 
        resultCount: Array.isArray(result) ? result.length : 'error'
      });
      
      this.logger.debug({ 
        blueprintId,
        resultCount: Array.isArray(result) ? result.length : 'error'
      }, 'Retrieved composes');
      
      return result;
    } catch (error) {
      timing.error(error instanceof Error ? error : new Error(String(error)));
      this.logger.error({
        blueprintId,
        error: {
          message: error instanceof Error ? error.message : String(error),
        }
      }, 'Failed to retrieve composes');
      throw error;
    }
  }

  public async add(request: ComposeRequest, blueprintId?: string) {
    const timing = createTimingLogger('compose-add', { 
      blueprintId,
      distribution: request.distribution,
    });
    
    try {
      this.logger.info({
        blueprintId,
        distribution: request.distribution,
        imageRequestsCount: request.image_requests.length,
      }, 'Creating new compose request');

      const result = await this.model.create(request, Maybe.of(blueprintId));

      return result.map(({ id }) => {
        this.queue.enqueue({ id, request });
        
        timing.done({ composeId: id });
        this.logger.info({
          composeId: id,
          blueprintId,
          distribution: request.distribution,
        }, 'Compose created and queued for processing');
        
        return { id };
      });
    } catch (error) {
      timing.error(error instanceof Error ? error : new Error(String(error)));
      this.logger.error({
        blueprintId,
        distribution: request.distribution,
        error: {
          message: error instanceof Error ? error.message : String(error),
        }
      }, 'Failed to create compose');
      throw error;
    }
  }

  public async status(id: string) {
    const timing = createTimingLogger('compose-status', { composeId: id });
    
    try {
      this.logger.debug({ composeId: id }, 'Retrieving compose status');
      
      const result = await this.model.findById(id);

      return result.map((compose) => {
        timing.done({ status: compose.status });
        
        this.logger.debug({
          composeId: id,
          status: compose.status,
        }, 'Compose status retrieved');
        
        return {
          request: compose.request as ComposeRequest,
          image_status: {
            status: compose.status,
          },
        };
      });
    } catch (error) {
      timing.error(error instanceof Error ? error : new Error(String(error)));
      this.logger.error({
        composeId: id,
        error: {
          message: error instanceof Error ? error.message : String(error),
        }
      }, 'Failed to retrieve compose status');
      throw error;
    }
  }

  public async delete(id: string) {
    const timing = createTimingLogger('compose-delete', { composeId: id });
    
    try {
      this.logger.info({ composeId: id }, 'Attempting to delete compose');
      
      if (this.queue.isCurrent(id)) {
        timing.done({ result: 'forbidden-in-progress' });
        this.logger.warn({
          composeId: id,
        }, 'Cannot delete compose - job is in progress');
        
        return Result.err(
          new AppError({
            code: StatusCodes.FORBIDDEN,
            message: 'Job is in progress, it cannot be deleted.',
          }),
        );
      }
      
      this.queue.remove(id);
      const result = await this.model.delete(id);
      
      timing.done({ result: 'success' });
      this.logger.info({
        composeId: id,
      }, 'Compose deleted successfully');
      
      return result;
    } catch (error) {
      timing.error(error instanceof Error ? error : new Error(String(error)));
      this.logger.error({
        composeId: id,
        error: {
          message: error instanceof Error ? error.message : String(error),
        }
      }, 'Failed to delete compose');
      throw error;
    }
  }

  public async update(id: string, changes: Partial<ComposeDocument>) {
    const timing = createTimingLogger('compose-update', { 
      composeId: id,
      changes: Object.keys(changes),
    });
    
    try {
      this.logger.debug({
        composeId: id,
        changes: Object.keys(changes),
        status: changes.status,
      }, 'Updating compose');
      
      const result = await this.model.update(id, changes);
      
      timing.done();
      this.logger.debug({
        composeId: id,
        changes: Object.keys(changes),
        status: changes.status,
      }, 'Compose updated successfully');
      
      return result;
    } catch (error) {
      timing.error(error instanceof Error ? error : new Error(String(error)));
      this.logger.error({
        composeId: id,
        changes: Object.keys(changes),
        error: {
          message: error instanceof Error ? error.message : String(error),
        }
      }, 'Failed to update compose');
      throw error;
    }
  }
}
