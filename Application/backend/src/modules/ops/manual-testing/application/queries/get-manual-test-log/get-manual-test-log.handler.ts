import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetManualTestLogQuery } from './get-manual-test-log.query';
import { MANUAL_TEST_LOG_REPOSITORY, IManualTestLogRepository } from '../../../infrastructure/repositories/manual-test-log.repository';

@QueryHandler(GetManualTestLogQuery)
export class GetManualTestLogHandler implements IQueryHandler<GetManualTestLogQuery> {
  constructor(
    @Inject(MANUAL_TEST_LOG_REPOSITORY)
    private readonly repo: IManualTestLogRepository,
  ) {}

  async execute(query: GetManualTestLogQuery): Promise<any> {
    const log = await this.repo.findById(query.id);
    if (!log) throw new NotFoundException(`ManualTestLog not found: ${query.id}`);
    return log;
  }
}
