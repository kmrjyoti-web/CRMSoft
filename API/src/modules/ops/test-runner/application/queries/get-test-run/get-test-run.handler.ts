import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetTestRunQuery } from './get-test-run.query';
import { TEST_RUN_REPOSITORY, ITestRunRepository } from '../../../infrastructure/repositories/test-run.repository';

@QueryHandler(GetTestRunQuery)
export class GetTestRunHandler implements IQueryHandler<GetTestRunQuery> {
  constructor(
    @Inject(TEST_RUN_REPOSITORY)
    private readonly repo: ITestRunRepository,
  ) {}

  async execute(query: GetTestRunQuery): Promise<any> {
    const run = await this.repo.findById(query.id);
    if (!run) throw new NotFoundException(`TestRun not found: ${query.id}`);
    return run;
  }
}
