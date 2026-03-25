import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ListTestGroupsQuery } from './list-test-groups.query';
import { TEST_GROUP_REPOSITORY, ITestGroupRepository } from '../../../infrastructure/repositories/test-group.repository';

@QueryHandler(ListTestGroupsQuery)
export class ListTestGroupsHandler implements IQueryHandler<ListTestGroupsQuery> {
  constructor(
    @Inject(TEST_GROUP_REPOSITORY)
    private readonly repo: ITestGroupRepository,
  ) {}

  async execute(query: ListTestGroupsQuery): Promise<any[]> {
    return this.repo.findByTenantId(query.tenantId, query.filters);
  }
}
