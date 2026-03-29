import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetGroupExecutionQuery } from './get-group-execution.query';
import { TEST_GROUP_REPOSITORY, ITestGroupRepository } from '../../../infrastructure/repositories/test-group.repository';

@QueryHandler(GetGroupExecutionQuery)
export class GetGroupExecutionHandler implements IQueryHandler<GetGroupExecutionQuery> {
  constructor(
    @Inject(TEST_GROUP_REPOSITORY)
    private readonly repo: ITestGroupRepository,
  ) {}

  async execute(query: GetGroupExecutionQuery): Promise<any> {
    const exec = await this.repo.findExecution(query.executionId);
    if (!exec) throw new NotFoundException(`Execution not found: ${query.executionId}`);
    return exec;
  }
}
