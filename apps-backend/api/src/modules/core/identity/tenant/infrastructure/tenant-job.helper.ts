import { Injectable, Logger } from '@nestjs/common';
import { TenantContextService } from './tenant-context.service';

const logger = new Logger('TenantJobHelper');

/**
 * Envelope added to every job dispatched via addToQueue().
 * The __tenant block is read back by runWithJobContext() in the worker.
 */
export interface TenantJobEnvelope<T = unknown> {
  __tenant: {
    tenantId: string;
    userId: string;
    role: string;
  };
  payload: T;
}

/**
 * TenantJobHelper — tenant-safe BullMQ dispatching and processing.
 *
 * WHY: AsyncLocalStorage does not cross process/queue boundaries.
 *      When a job is dispatched the ALS context is in memory on the
 *      dispatcher's thread; the worker runs in a different async scope
 *      and starts with no ALS state. Any tenant-scoped ORM call in the
 *      worker will therefore pass through unfiltered (passthrough rule).
 *
 * SOLUTION:
 *   Dispatcher side: addToQueue() captures current ALS context and
 *     serialises it into the job data as __tenant.
 *   Worker side: runWithJobContext() reads __tenant from job data and
 *     calls tenantContext.run(...) to restore ALS state before the
 *     handler executes.
 *
 * USAGE — dispatcher:
 *   await this.tenantJobHelper.addToQueue(this.leadsQueue, 'ENRICH_LEAD', { leadId });
 *
 * USAGE — worker (inside @Process handler):
 *   @Process('ENRICH_LEAD')
 *   async handle(job: Job) {
 *     return this.tenantJobHelper.runWithJobContext(job, async () => {
 *       const { leadId } = this.tenantJobHelper.getPayload<EnrichLeadPayload>(job);
 *       await this.prisma.lead.update({ where: { id: leadId }, data: { ... } });
 *     });
 *   }
 *
 * NOTE: Existing marketplace processors (OfferSchedulerProcessor,
 *       AnalyticsAggregatorProcessor) use mktPrisma.client with explicit
 *       tenantId in where clauses — they do NOT need TenantJobHelper.
 *       Use this helper only for jobs that access the working DB via
 *       PrismaService and rely on the $extends tenant extension.
 */
@Injectable()
export class TenantJobHelper {
  constructor(private readonly tenantContext: TenantContextService) {}

  /**
   * Add a job with tenant context auto-attached.
   * Throws if called outside a request context (no ALS tenant set).
   */
  async addToQueue<T>(
    queue: { add: (name: string, data: any, options?: any) => Promise<any> },
    jobName: string,
    payload: T,
    options?: Record<string, unknown>,
  ): Promise<void> {
    const tenantId = this.tenantContext.getTenantId();
    if (!tenantId) {
      throw new Error(`TENANT_REQUIRED: cannot dispatch job '${jobName}' without tenant context`);
    }

    const envelope: TenantJobEnvelope<T> = {
      __tenant: { tenantId, userId: '', role: '' },
      payload,
    };

    await queue.add(jobName, envelope, options);
    logger.debug(`Dispatched ${jobName} for tenant ${tenantId}`);
  }

  /**
   * Run a job handler with ALS tenant context restored from job data.
   * Call this at the start of every @Process handler that touches working DB.
   */
  async runWithJobContext<T>(
    job: { data: TenantJobEnvelope<any> },
    handler: () => Promise<T>,
  ): Promise<T> {
    const envelope = job.data as TenantJobEnvelope<any>;
    if (!envelope?.__tenant?.tenantId) {
      logger.error(`TENANT_MISSING_IN_JOB: job has no __tenant envelope — cannot restore context`);
      throw new Error('TENANT_MISSING_IN_JOB: job dispatched without TenantJobHelper.addToQueue');
    }
    return this.tenantContext.run({ tenantId: envelope.__tenant.tenantId }, handler);
  }

  /**
   * Extract the typed payload from a job (stripping the __tenant envelope).
   */
  getPayload<T>(job: { data: TenantJobEnvelope<T> }): T {
    return job.data.payload;
  }
}
