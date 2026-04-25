import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { ListTestRunsQuery } from './list-test-runs.query';
import { TEST_RUN_REPOSITORY, ITestRunRepository } from '../../../infrastructure/repositories/test-run.repository';

@QueryHandler(ListTestRunsQuery)
export class ListTestRunsHandler implements IQueryHandler<ListTestRunsQuery> {
    private readonly logger = new Logger(ListTestRunsHandler.name);

  constructor(
    @Inject(TEST_RUN_REPOSITORY)
    private readonly repo: ITestRunRepository,
  ) {}

  async execute(query: ListTestRunsQuery): Promise<Record<string, unknown>[]> {
    try {
      return this.repo.findByTenantId(query.tenantId, query.filters);
    } catch (error) {
      this.logger.error(`ListTestRunsHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
