import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { ListTestGroupsQuery } from './list-test-groups.query';
import { TEST_GROUP_REPOSITORY, ITestGroupRepository } from '../../../infrastructure/repositories/test-group.repository';

@QueryHandler(ListTestGroupsQuery)
export class ListTestGroupsHandler implements IQueryHandler<ListTestGroupsQuery> {
    private readonly logger = new Logger(ListTestGroupsHandler.name);

  constructor(
    @Inject(TEST_GROUP_REPOSITORY)
    private readonly repo: ITestGroupRepository,
  ) {}

  async execute(query: ListTestGroupsQuery): Promise<Record<string, unknown>[]> {
    try {
      return this.repo.findByTenantId(query.tenantId, query.filters);
    } catch (error) {
      this.logger.error(`ListTestGroupsHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
