import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, Logger } from '@nestjs/common';
import { GetManualTestLogQuery } from './get-manual-test-log.query';
import { MANUAL_TEST_LOG_REPOSITORY, IManualTestLogRepository } from '../../../infrastructure/repositories/manual-test-log.repository';

@QueryHandler(GetManualTestLogQuery)
export class GetManualTestLogHandler implements IQueryHandler<GetManualTestLogQuery> {
    private readonly logger = new Logger(GetManualTestLogHandler.name);

  constructor(
    @Inject(MANUAL_TEST_LOG_REPOSITORY)
    private readonly repo: IManualTestLogRepository,
  ) {}

  async execute(query: GetManualTestLogQuery): Promise<Record<string, unknown>> {
    try {
      const log = await this.repo.findById(query.id);
      if (!log) throw new NotFoundException(`ManualTestLog not found: ${query.id}`);
      return log;
    } catch (error) {
      this.logger.error(`GetManualTestLogHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
