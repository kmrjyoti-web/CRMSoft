import { Injectable, Logger } from '@nestjs/common';

/** Result returned by every cron job handler. */
export interface CronJobResult {
  recordsProcessed?: number;
  recordsSucceeded?: number;
  recordsFailed?: number;
  details?: Record<string, any>;
}

/** Every cron job handler implements this interface. */
export interface ICronJobHandler {
  readonly jobCode: string;

  /**
   * Execute the job.
   * @param params  Job-specific config from CronJobConfig.jobParams
   * @param context Optional tenant context for TENANT-scoped jobs
   */
  execute(
    params: Record<string, any>,
    context?: { tenantId?: string },
  ): Promise<CronJobResult>;
}

/**
 * Maps jobCode → handler function.
 * All handlers self-register via `register()` during module init.
 */
@Injectable()
export class JobRegistryService {
  private readonly logger = new Logger(JobRegistryService.name);
  private handlers = new Map<string, ICronJobHandler>();

  /** Register a handler (called during module init). */
  register(handler: ICronJobHandler): void {
    this.handlers.set(handler.jobCode, handler);
    this.logger.log(`Registered handler: ${handler.jobCode}`);
  }

  /** Get handler for a job code. */
  getHandler(jobCode: string): ICronJobHandler | null {
    return this.handlers.get(jobCode) ?? null;
  }

  /** List all registered job codes. */
  listRegistered(): string[] {
    return Array.from(this.handlers.keys());
  }
}
