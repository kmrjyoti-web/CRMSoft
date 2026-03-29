import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ListManualTestLogsQuery } from './list-manual-test-logs.query';
import { MANUAL_TEST_LOG_REPOSITORY, IManualTestLogRepository } from '../../../infrastructure/repositories/manual-test-log.repository';

@QueryHandler(ListManualTestLogsQuery)
export class ListManualTestLogsHandler implements IQueryHandler<ListManualTestLogsQuery> {
  constructor(
    @Inject(MANUAL_TEST_LOG_REPOSITORY)
    private readonly repo: IManualTestLogRepository,
  ) {}

  async execute(query: ListManualTestLogsQuery): Promise<any[]> {
    return this.repo.findByTenantId(query.tenantId, query.filters);
  }
}
