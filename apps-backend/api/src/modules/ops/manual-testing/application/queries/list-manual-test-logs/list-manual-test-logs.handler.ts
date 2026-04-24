import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { ListManualTestLogsQuery } from './list-manual-test-logs.query';
import { MANUAL_TEST_LOG_REPOSITORY, IManualTestLogRepository } from '../../../infrastructure/repositories/manual-test-log.repository';

@QueryHandler(ListManualTestLogsQuery)
export class ListManualTestLogsHandler implements IQueryHandler<ListManualTestLogsQuery> {
    private readonly logger = new Logger(ListManualTestLogsHandler.name);

  constructor(
    @Inject(MANUAL_TEST_LOG_REPOSITORY)
    private readonly repo: IManualTestLogRepository,
  ) {}

  async execute(query: ListManualTestLogsQuery): Promise<Record<string, unknown>[]> {
    try {
      return this.repo.findByTenantId(query.tenantId, query.filters);
    } catch (error) {
      this.logger.error(`ListManualTestLogsHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
