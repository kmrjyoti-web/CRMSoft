import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetManualTestSummaryQuery } from './get-manual-test-summary.query';
import { MANUAL_TEST_LOG_REPOSITORY, IManualTestLogRepository } from '../../../infrastructure/repositories/manual-test-log.repository';

@QueryHandler(GetManualTestSummaryQuery)
export class GetManualTestSummaryHandler implements IQueryHandler<GetManualTestSummaryQuery> {
  constructor(
    @Inject(MANUAL_TEST_LOG_REPOSITORY)
    private readonly repo: IManualTestLogRepository,
  ) {}

  async execute(query: GetManualTestSummaryQuery): Promise<any> {
    return this.repo.getSummary(query.tenantId, query.filters);
  }
}
