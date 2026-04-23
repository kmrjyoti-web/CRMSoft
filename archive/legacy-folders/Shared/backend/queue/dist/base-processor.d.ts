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
export declare abstract class BaseProcessor {
    protected readonly logger: Logger;
    protected process<T, R>(job: {
        id?: string;
        name: string;
        data: T;
    }, handler: (data: T) => Promise<R>): Promise<R>;
}
//# sourceMappingURL=base-processor.d.ts.map