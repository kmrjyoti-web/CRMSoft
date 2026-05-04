import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, Logger } from '@nestjs/common';
import { GetGroupExecutionQuery } from './get-group-execution.query';
import { TEST_GROUP_REPOSITORY, ITestGroupRepository } from '../../../infrastructure/repositories/test-group.repository';

@QueryHandler(GetGroupExecutionQuery)
export class GetGroupExecutionHandler implements IQueryHandler<GetGroupExecutionQuery> {
    private readonly logger = new Logger(GetGroupExecutionHandler.name);

  constructor(
    @Inject(TEST_GROUP_REPOSITORY)
    private readonly repo: ITestGroupRepository,
  ) {}

  async execute(query: GetGroupExecutionQuery): Promise<Record<string, unknown>> {
    try {
      const exec = await this.repo.findExecution(query.executionId);
      if (!exec) throw new NotFoundException(`Execution not found: ${query.executionId}`);
      return exec;
    } catch (error) {
      this.logger.error(`GetGroupExecutionHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
