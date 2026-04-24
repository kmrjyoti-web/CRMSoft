"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseProcessor = void 0;
const common_1 = require("@nestjs/common");
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
class BaseProcessor {
    constructor() {
        this.logger = new common_1.Logger(this.constructor.name);
    }
    async process(job, handler) {
        const start = Date.now();
        this.logger.log(`Processing job ${job.id} (${job.name})`);
        try {
            const result = await handler(job.data);
            this.logger.log(`Job ${job.id} completed in ${Date.now() - start}ms`);
            return result;
        }
        catch (err) {
            this.logger.error(`Job ${job.id} failed: ${err instanceof Error ? err.message : String(err)}`);
            throw err;
        }
    }
}
exports.BaseProcessor = BaseProcessor;
//# sourceMappingURL=base-processor.js.map