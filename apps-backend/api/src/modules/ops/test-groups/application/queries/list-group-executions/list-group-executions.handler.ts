import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { ListGroupExecutionsQuery } from './list-group-executions.query';
import { TEST_GROUP_REPOSITORY, ITestGroupRepository } from '../../../infrastructure/repositories/test-group.repository';

@QueryHandler(ListGroupExecutionsQuery)
export class ListGroupExecutionsHandler implements IQueryHandler<ListGroupExecutionsQuery> {
    private readonly logger = new Logger(ListGroupExecutionsHandler.name);

  constructor(
    @Inject(TEST_GROUP_REPOSITORY)
    private readonly repo: ITestGroupRepository,
  ) {}

  async execute(query: ListGroupExecutionsQuery): Promise<Record<string, unknown>[]> {
    try {
      return this.repo.listExecutions(query.testGroupId);
    } catch (error) {
      this.logger.error(`ListGroupExecutionsHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
