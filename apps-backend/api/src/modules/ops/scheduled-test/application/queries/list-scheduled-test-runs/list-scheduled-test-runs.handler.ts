import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, Logger } from '@nestjs/common';
import { ListScheduledTestRunsQuery } from './list-scheduled-test-runs.query';
import {
  SCHEDULED_TEST_REPOSITORY,
  IScheduledTestRepository,
} from '../../../infrastructure/repositories/scheduled-test.repository';
import {
  SCHEDULED_TEST_RUN_REPOSITORY,
  IScheduledTestRunRepository,
} from '../../../infrastructure/repositories/scheduled-test-run.repository';

@QueryHandler(ListScheduledTestRunsQuery)
export class ListScheduledTestRunsHandler implements IQueryHandler<ListScheduledTestRunsQuery> {
    private readonly logger = new Logger(ListScheduledTestRunsHandler.name);

  constructor(
    @Inject(SCHEDULED_TEST_REPOSITORY)
    private readonly testRepo: IScheduledTestRepository,
    @Inject(SCHEDULED_TEST_RUN_REPOSITORY)
    private readonly runRepo: IScheduledTestRunRepository,
  ) {}

  async execute(query: ListScheduledTestRunsQuery) {
    try {
      const test = await this.testRepo.findById(query.scheduledTestId);
      if (!test || test.tenantId !== query.tenantId) {
        throw new NotFoundException('Scheduled test not found');
      }
      return this.runRepo.findByScheduledTestId(query.scheduledTestId, query.limit ?? 20);
    } catch (error) {
      this.logger.error(`ListScheduledTestRunsHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
