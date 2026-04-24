import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, Logger } from '@nestjs/common';
import { GetScheduledTestQuery } from './get-scheduled-test.query';
import {
  SCHEDULED_TEST_REPOSITORY,
  IScheduledTestRepository,
} from '../../../infrastructure/repositories/scheduled-test.repository';

@QueryHandler(GetScheduledTestQuery)
export class GetScheduledTestHandler implements IQueryHandler<GetScheduledTestQuery> {
    private readonly logger = new Logger(GetScheduledTestHandler.name);

  constructor(
    @Inject(SCHEDULED_TEST_REPOSITORY)
    private readonly repo: IScheduledTestRepository,
  ) {}

  async execute(query: GetScheduledTestQuery) {
    try {
      const test = await this.repo.findById(query.id);
      if (!test || test.tenantId !== query.tenantId) {
        throw new NotFoundException('Scheduled test not found');
      }
      return test;
    } catch (error) {
      this.logger.error(`GetScheduledTestHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
