import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ListScheduledTestsQuery } from './list-scheduled-tests.query';
import {
  SCHEDULED_TEST_REPOSITORY,
  IScheduledTestRepository,
} from '../../../infrastructure/repositories/scheduled-test.repository';

@QueryHandler(ListScheduledTestsQuery)
export class ListScheduledTestsHandler implements IQueryHandler<ListScheduledTestsQuery> {
  constructor(
    @Inject(SCHEDULED_TEST_REPOSITORY)
    private readonly repo: IScheduledTestRepository,
  ) {}

  async execute(query: ListScheduledTestsQuery) {
    return this.repo.findByTenantId(query.tenantId, {
      isActive: query.isActive,
      page: query.page,
      limit: query.limit,
    });
  }
}
