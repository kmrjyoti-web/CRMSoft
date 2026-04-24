import { Logger } from '@nestjs/common';

/**
 * Base class for BullMQ job processors.
 * Extend in each module's processor class.
 *
 * Usage:
 *   @Processor('notifications')
 *   export class NotificationProcessor extends BaseProcessor {
 *     @Process('send-email')
 *     async handleEmail(job: Job<EmailPayload>) {
 *       return this.process(job, async (data) => {
 *         // do work
 *       });
 *     }
 *   }
 */
export abstract class BaseProcessor {
  protected readonly logger = new Logger(this.constructor.name);

  protected async process<T, R>(
    job: { id?: string; name: string; data: T },
    handler: (data: T) => Promise<R>,
  ): Promise<R> {
    const start = Date.now();
    this.logger.log(`Processing job ${job.id} (${job.name})`);
    try {
      const result = await handler(job.data);
      this.logger.log(`Job ${job.id} completed in ${Date.now() - start}ms`);
      return result;
    } catch (err) {
      this.logger.error(`Job ${job.id} failed: ${err instanceof Error ? err.message : String(err)}`);
      throw err;
    }
  }
}
