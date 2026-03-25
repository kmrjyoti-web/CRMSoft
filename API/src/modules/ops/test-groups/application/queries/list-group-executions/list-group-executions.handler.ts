import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ListGroupExecutionsQuery } from './list-group-executions.query';
import { TEST_GROUP_REPOSITORY, ITestGroupRepository } from '../../../infrastructure/repositories/test-group.repository';

@QueryHandler(ListGroupExecutionsQuery)
export class ListGroupExecutionsHandler implements IQueryHandler<ListGroupExecutionsQuery> {
  constructor(
    @Inject(TEST_GROUP_REPOSITORY)
    private readonly repo: ITestGroupRepository,
  ) {}

  async execute(query: ListGroupExecutionsQuery): Promise<any[]> {
    return this.repo.listExecutions(query.testGroupId);
  }
}
