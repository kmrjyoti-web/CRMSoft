import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { GetManualTestSummaryQuery } from './get-manual-test-summary.query';
import { MANUAL_TEST_LOG_REPOSITORY, IManualTestLogRepository } from '../../../infrastructure/repositories/manual-test-log.repository';

@QueryHandler(GetManualTestSummaryQuery)
export class GetManualTestSummaryHandler implements IQueryHandler<GetManualTestSummaryQuery> {
    private readonly logger = new Logger(GetManualTestSummaryHandler.name);

  constructor(
    @Inject(MANUAL_TEST_LOG_REPOSITORY)
    private readonly repo: IManualTestLogRepository,
  ) {}

  async execute(query: GetManualTestSummaryQuery): Promise<Record<string, unknown>> {
    try {
      return this.repo.getSummary(query.tenantId, query.filters);
    } catch (error) {
      this.logger.error(`GetManualTestSummaryHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
