import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetScheduledTestQuery } from './get-scheduled-test.query';
import {
  SCHEDULED_TEST_REPOSITORY,
  IScheduledTestRepository,
} from '../../../infrastructure/repositories/scheduled-test.repository';

@QueryHandler(GetScheduledTestQuery)
export class GetScheduledTestHandler implements IQueryHandler<GetScheduledTestQuery> {
  constructor(
    @Inject(SCHEDULED_TEST_REPOSITORY)
    private readonly repo: IScheduledTestRepository,
  ) {}

  async execute(query: GetScheduledTestQuery) {
    const test = await this.repo.findById(query.id);
    if (!test || test.tenantId !== query.tenantId) {
      throw new NotFoundException('Scheduled test not found');
    }
    return test;
  }
}
